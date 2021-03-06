// 2022-06-16

import { PageConfig, URLExt } from '@jupyterlab/coreutils'
(window as any).__webpack_public_path__ = URLExt.join(
  PageConfig.getBaseUrl(),
  'dsl/'
)

import '@jupyterlab/application/style/index.css'
import '@jupyterlab/cells/style/index.css'
import '@jupyterlab/theme-light-extension/style/theme.css'
import '@jupyterlab/completer/style/index.css'
import '../style/index.css'

import { SessionContext, Toolbar } from '@jupyterlab/apputils'
import { CodeCell, CodeCellModel } from '@jupyterlab/cells'
import { CodeMirrorMimeTypeService } from '@jupyterlab/codemirror'

import {
  Completer,
  CompleterModel,
  CompletionHandler,
  KernelConnector
} from '@jupyterlab/completer'

import {
  standardRendererFactories as initialFactories,
  RenderMimeRegistry
} from '@jupyterlab/rendermime'

import {
  KernelManager,
  KernelSpecManager,
  SessionManager
} from '@jupyterlab/services'

import { CommandRegistry } from '@lumino/commands'
import { BoxPanel, Widget } from '@lumino/widgets'

import { IntroWidget } from './IntroWidget'
import { UIAreaWidget } from './UIAreaWidget'

let _cellWidget: CodeCell

function main(): void {
  const kernelManager = new KernelManager()
  const specsManager = new KernelSpecManager()
  const sessionManager = new SessionManager({ kernelManager })
  const sessionContext = new SessionContext({
    sessionManager,
    specsManager,
    name: 'dsl'
  })
  const mimeService = new CodeMirrorMimeTypeService()

  // Initialize the command registry with the bindings.
  const commands = new CommandRegistry()
  const useCapture = true

  // Setup the keydown listener for the document.
  document.addEventListener(
    'keydown',
    event => {
      commands.processKeydownEvent(event)
    },
    useCapture
  )

  // Create the cell widget with a default rendermime instance.
  const rendermime = new RenderMimeRegistry({ initialFactories })

  _cellWidget = new CodeCell({
    rendermime,
    model: new CodeCellModel({})
  }).initializeState()

  // setInterval(()=> {
  //   console.log('code=', cellWidget.editor.model.value.text)
  // }, 3000)

  // cellWidget.editor.model.value.text = 'print("hello...")'
  // setInterval(() => {
  //   const code = cellWidget.editor.model.value.text  
  //   cellWidget.editor.model.value.text = code + 'print("hello...")\n'
  // }, 3000)

  // cellWidget.editor.model.value.changed.connect((obj, _) => {
  //   console.log('changed...=', obj.text)
  // })

  const uiAreaWidget = new UIAreaWidget()

  _cellWidget.editor.model.value.changed.connect((obj, _) => {
    onCodeChanged(obj.text, uiAreaWidget) 
  })

  // Handle the mimeType for the current kernel asynchronously.
  sessionContext.kernelChanged.connect(() => {
    void sessionContext.session?.kernel?.info.then(info => {
      const lang = info.language_info
      const mimeType = mimeService.getMimeTypeByLanguage(lang)
      _cellWidget.model.mimeType = mimeType
    })
  })

  // Use the default kernel.
  sessionContext.kernelPreference = { autoStartDefault: true }

  // Set up a completer.
  const editor = _cellWidget.editor
  const model = new CompleterModel()
  const completer = new Completer({ editor, model })
  const connector = new KernelConnector({ session: sessionContext.session })
  const handler = new CompletionHandler({ completer, connector })

  // sessionContext.session?.kernel.
  void sessionContext.ready.then(() => {
    handler.connector = new KernelConnector({
      session: sessionContext.session
    })
  })

  // Set the handler's editor
  handler.editor = editor

  // Hide the widget when it first loads.
  completer.hide()
  completer.addClass('jp-Completer-Cell')

  // Create a toolbar for the cell.
  const toolbar = new Toolbar()
  // toolbar.addItem('spacer', Toolbar.createSpacerItem())
  toolbar.addItem('interrupt', Toolbar.createInterruptButton(sessionContext))
  toolbar.addItem('restart', Toolbar.createRestartButton(sessionContext))
  toolbar.addItem('name', Toolbar.createKernelNameItem(sessionContext))
  toolbar.addItem('status', Toolbar.createKernelStatusItem(sessionContext))

  // Lay out the widgets.
  const panel = new BoxPanel()
  panel.id = 'main'
  panel.direction = 'top-to-bottom'
  panel.spacing = 12 

  panel.addWidget(toolbar)
  const introWidget: IntroWidget = new IntroWidget()
  panel.addWidget(introWidget)

  const cellPanel = new BoxPanel()
  cellPanel.id = 'cell-panel'
  cellPanel.direction = 'left-to-right'
  cellPanel.spacing = 10

  panel.addWidget(cellPanel)

  cellPanel.addWidget(_cellWidget)
  cellPanel.addWidget(uiAreaWidget)

  BoxPanel.setStretch(toolbar, 0)
  BoxPanel.setStretch(introWidget, 1)
  BoxPanel.setStretch(cellPanel, 3)

  // Attach the panel to the DOM.
  Widget.attach(panel, document.body)
  Widget.attach(completer, document.body)

  // Handle widget state.
  window.addEventListener('resize', () => {
    panel.update()
  })
  _cellWidget.activate()

  // Add the commands.
  commands.addCommand('invoke:completer', {
    execute: () => {
      handler.invoke()
    }
  })
  commands.addCommand('run:cell', {
    execute: () => CodeCell.execute(_cellWidget, sessionContext)
  })

  commands.addKeyBinding({
    selector: '.jp-InputArea-editor.jp-mod-completer-enabled',
    keys: ['Tab'],
    command: 'invoke:completer'
  })
  commands.addKeyBinding({
    selector: '.jp-InputArea-editor',
    keys: ['Shift Enter'],
    command: 'run:cell'
  })

  // Start up the kernel
  void sessionContext.initialize().then(() => {
    console.debug('dsl started!')
  })
}

window.addEventListener('load', main)

const onCodeChanged = (code: string, uiContainer: UIAreaWidget) => {
  // console.log('code=', code)
  const splits = code.split('\n')
  // console.log('splits=', splits)
  const pyList = []
  const dslList = []
  for (const line of splits) {
    const startIndex = line.indexOf('#@')
    if (startIndex !== -1) {
      const py = line.substring(0, startIndex)
      const dsl = line.substring(startIndex)
      pyList.push(py)
      dslList.push(dsl)
    }
  }
  // console.log('dsls=', dslList)
  uiContainer.updateUIArea(pyList, dslList, updateCodeByReact)
}

const updateCodeByReact = (originCode: string, newCode: string) => {
  let code = _cellWidget.editor.model.value.text
  code = code.replace(originCode, newCode)
  _cellWidget.editor.model.value.text = code
}
