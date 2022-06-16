# 2022-06-16

import json
import os

from jupyter_server.base.handlers import JupyterHandler
from jupyter_server.extension.handler import (
    ExtensionHandlerJinjaMixin,
    ExtensionHandlerMixin
)
from jupyter_server.utils import url_path_join as ujoin
from jupyterlab_server import LabServerApp

HERE = os.path.dirname(__file__)

with open(os.path.join(HERE, "package.json")) as fid:
    version = json.load(fid)["version"]


def _jupyter_server_extension_points():
    return [{"module": __name__, "app": ExampleApp}]


class ExampleHandler(ExtensionHandlerJinjaMixin, ExtensionHandlerMixin, JupyterHandler):
    """Handle requests betwwen the main app page and notebook server."""
    def get(self):
        """Get the main page for the application's interface"""
        config_data = {
            "appVersion": version,
            "baseUrl": self.base_url,
            "token": self.settings["token"],
            "fullStaticUrl": ujoin(self.base_url, "static", self.name),
            "frontendUrl": ujoin(self.base_url, "example/"),
        }
        return self.write(
            self.render_template(
                "index.html",
                static=self.static_url,
                base_url=self.base_url,
                token=self.settings["token"],
                page_config=config_data,
            )
        )


class ExampleApp(LabServerApp):
    extension_url = "/dsl"
    default_url = "/dsl"
    app_url = "/dsl"
    name = __name__
    load_other_extensions = False
    app_name = "dsl-demo"
    static_dir = os.path.join(HERE, "build")
    templates_dir = os.path.join(HERE, "templates")
    app_version = version
    app_settings_dir = os.path.join(HERE, "build", "application_settings")
    schemas_dir = os.path.join(HERE, "build", "schemas")
    themes_dir = os.path.join(HERE, "build", "themes")
    user_settings_dir = os.path.join(HERE, "build", "user_settings")
    workspaces_dir = os.path.join(HERE, "build", "workspaces")

    def initialize_handlers(self):
        """Add example handler to Lab Server's handler list."""
        self.handlers.append(("/dsl", ExampleHandler))


if __name__ == "__main__":
    ExampleApp.launch_instance()
