import { ReactWidget } from '@jupyterlab/apputils'
import React from 'react'

const UIAreaComponent = () => {
  return (
    <>
      <h2>UI-Area...</h2> 
    </>
  )
}

export class UIAreaWidget extends ReactWidget {
  constructor() {
    super()
    this.addClass('react-ui-area-widget')
  }

  render(): JSX.Element {
    return <UIAreaComponent />
  }
}
