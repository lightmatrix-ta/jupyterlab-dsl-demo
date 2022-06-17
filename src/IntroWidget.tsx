import { ReactWidget } from '@jupyterlab/apputils'
import React from 'react'

const IntroComponent = () => {
  return (
    <>
      <h1>Python行尾注释中的DSL Demo</h1>
      <h2> &nbsp;&nbsp;&nbsp;&nbsp; - 😂 🤣 😄 Made with love by Machine Learning, kidding, by my hands 😂 🤣 😄 ......</h2>
      <ul className='react-intro-ul'>
        <li className='react-intro-li'>
          #@input type=text
        </li>
        <li className='react-intro-li'>
          #@input type=number
        </li>
        <li className='react-intro-li'>
          #@input type=bool
        </li>
        <li className='react-intro-li'>
          #@input type=select list=[1, 2, 3]
        </li>
        <li className='react-intro-li'>
          #@input type=radio &nbsp;&nbsp;list=[1, 2, 3]
        </li>
        <li className='react-intro-li'>
          #@input type=slider &nbsp;min=10 max=80 value=66 
        </li>
        <li className='react-intro-li'>
          ......... 
        </li>
      </ul>
    </>
  )
}

export class IntroWidget extends ReactWidget {
  constructor() {
    super()
    this.addClass('react-intro-widget')
  }

  render(): JSX.Element {
    return <IntroComponent />
  }
}
