import { ReactWidget } from '@jupyterlab/apputils'
import React from 'react'

import 'element-theme-default'
import { Input } from 'element-react'

// const UIAreaComponent = () => {
//   return (
//     <>
//       <h2>UI-Area...</h2> 
//     </>
//   )
// }

interface IProps {
  pyList: string[]
  dslList: string[]
  updateCodeFunc: Function
}

interface IState {
  pyValue: string | boolean | number
}

class UIAreaComponent extends React.Component<IProps> {
  state: IState = {
    pyValue: '' 
  }
  
  constructor(props: IProps) {
    super(props)
  }

  onInputChanged(newValue: any, linePySrc: string, pyValue: string) {
    if (pyValue === '') {
      pyValue = '\"\"'
      newValue = '"' + newValue + '"'
    }
    const newLinePySrc = linePySrc.replace(pyValue, newValue)
    console.log(newLinePySrc)
    this.props.updateCodeFunc(linePySrc, newLinePySrc)
  }

  parseDSL(): JSX.Element[] {
    const { pyList } = this.props
    const { dslList } = this.props
    const result: JSX.Element[] = []
    let keyIndex: number = 0

    for (let i = 0; i < dslList.length; i++) {
      keyIndex++
      let originPy = pyList[i]
      const dsl = dslList[i]

      const py = originPy.replace(/\s*=\s*/, '=') 
      const pySplits = py.split('=')
      const pyValName = pySplits[0]
      const pyOriginValue = pySplits[1]
      let pyValue = pyOriginValue.replace(/\s*\"/, '')
      pyValue = pyValue.replace(/\"\s*/, '')

      const dslSplits = dsl.split(' ')
      for (const item of dslSplits) {
        const containsType = (item.indexOf('type') !== -1)
        if (containsType) {
          const subSplits = item.split('=')
          const type = subSplits[1]
          switch (type) {
            case 'text':
              result.push (
                <div key={keyIndex} className="react-ui-area-widget-container">
                  <span style={{marginRight: 8, fontWeight: 'bold'}}>{pyValName} =</span>
                  <Input value={pyValue} size="small"
                    style={{width: 350, fontSize: 18}} className="ui-input-width"
                    onChange={(newValue: any) => {
                      // console.log(newText)
                      this.onInputChanged(newValue, originPy, pyValue)
                    }}
                  />
                </div>
              )
              break 
            default:
              console.log('unknown type...')
          }
        }
      }
    }
    return result
  }

  render() {
    return (
      <>
        { this.parseDSL() }
        {/* <h2>UI-Area...</h2>  */}
      </>
    )
  }
}

export class UIAreaWidget extends ReactWidget {
  pyList: string[] = []
  dslList: string[] =  []
  updateCodeFunc: Function

  constructor() {
    super()
    this.addClass('react-ui-area-widget')
  }

  public updateUIArea(pyList: string[], dslList: string[], updateCodeFunc: Function) {
    this.pyList = pyList
    this.dslList = dslList
    this.updateCodeFunc = updateCodeFunc
    this.update()
  }

  render(): JSX.Element {
    return <UIAreaComponent pyList={this.pyList} dslList={this.dslList} updateCodeFunc={this.updateCodeFunc} />
  }
}
