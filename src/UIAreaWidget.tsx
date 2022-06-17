import { ReactWidget } from '@jupyterlab/apputils'
import React from 'react'

import {
  Input,
  InputNumber,
  Checkbox,
  Select,
  Radio,
  Slider
} from 'element-react'
import 'element-theme-default'
import '../style/element.css'

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

  onCheckboxChanged(checked: boolean, linePySrc: string, pyValue: string) {
    console.log('checked=', checked)
    let newValue = 'True'
    if (!checked) {
      newValue = 'False'
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
              result.push(
                <div key={keyIndex} className="react-ui-area-widget-container">
                  <span style={{marginRight: 8, fontWeight: 'bold'}}>{pyValName} =</span>
                  <Input value={pyValue}
                    style={{width: 350, fontSize: 18}} className="ui-input-width"
                    onChange={(newValue: any) => {
                      this.onInputChanged(newValue, originPy, pyValue)
                    }}
                  />
                </div>
              )
              break
            case 'number':
              {
                pyValue = pyValue.replace(/\s+/g, '')
                const pyValueNum = +pyValue
                result.push(
                  <div key={keyIndex} className="react-ui-area-widget-container">
                    <span style={{marginRight: 8, fontWeight: 'bold'}}>{pyValName} =</span>
                    <InputNumber defaultValue={pyValueNum} value={pyValueNum}
                      style={{width: 350, fontSize: 28}} className="ui-input-width"
                      onChange={(newValue: any) => {
                        this.onInputChanged(newValue, originPy, pyValue)
                      }}
                    />
                  </div>
                )
              }
              break
            case 'bool':
              {
                pyValue = pyValue.replace(/\s+/g, '')
                let pyValueBool = false
                if (pyValue === 'True') {
                  pyValueBool = true
                } else if (pyValue === 'False') {
                  pyValueBool = false
                }
                result.push(
                  <div key={keyIndex} className="react-ui-area-widget-container">
                    <span style={{marginRight: 8, fontWeight: 'bold'}}>{pyValName} =</span>
                    <Checkbox checked={pyValueBool}
                      onChange={(newValue: any) => {
                        this.onCheckboxChanged(newValue, originPy, pyValue)
                      }}
                    />
                  </div>
                )
              }
              break
            case 'select':
              {
                const listSource = [
                  // { value:'选项A', label: '选项A' },
                  // { value:'选项B', label: '选项B' },
                  // { value:'选项C', label: '选项C' }
                ]

                for (const item2 of dslSplits) {
                  const containsList = (item2.indexOf('list') !== -1)
                  if (containsList) {
                    let splitsForList = item2.split('=')
                    let listStr = splitsForList[1]
                    listStr = listStr.replace('[', '')
                    listStr = listStr.replace(']', '')
                    splitsForList = listStr.split(',') 

                    for (const value of splitsForList) {
                      listSource.push({
                        value, label: value
                      }) 
                    }

                    break
                  }
                }

                result.push(
                  <div key={keyIndex} className="react-ui-area-widget-container">
                    <span style={{marginRight: 8, fontWeight: 'bold'}}>{pyValName} =</span>
                    <Select value={pyValue}
                      onChange={(newValue: any) => {
                        this.onInputChanged(newValue, originPy, pyValue)
                      }}
                    >
                      {
                        listSource.map(el => {
                          return <Select.Option key={el.value} label={el.label} value={el.value} />
                        })
                      }
                    </Select>
                  </div>
                ) 
              }
              break
            case 'radio':
              {
                const listSource = []

                for (const item2 of dslSplits) {
                  const containsList = (item2.indexOf('list') !== -1)
                  if (containsList) {
                    let splitsForList = item2.split('=')
                    let listStr = splitsForList[1]
                    listStr = listStr.replace('[', '')
                    listStr = listStr.replace(']', '')
                    splitsForList = listStr.split(',') 

                    for (const value of splitsForList) {
                      listSource.push({
                        value, label: value
                      }) 
                    }

                    break
                  }
                }

                result.push(
                  <div key={keyIndex} className="react-ui-area-widget-container">
                    <span style={{marginRight: 8, fontWeight: 'bold'}}>{pyValName} =</span>
                    {
                      listSource.map((el, index) => {
                        return <Radio key={'Radio=' + keyIndex + index} value={el.value} 
                            checked={el.value === pyValue}
                            onChange={(newValue: any) => {
                              this.onInputChanged(newValue, originPy, pyValue)
                            }}
                          >
                            {el.label}
                          </Radio>
                      }) 
                    }
                  </div>
                ) 
              }
              break
            case 'slider':
              {
                pyValue = pyValue.replace(/\s+/g, '')
                const pyValueNum = +pyValue
                result.push(
                  <div key={keyIndex} className="react-ui-area-widget-container">
                    <span style={{marginRight: 8, fontWeight: 'bold'}}>{pyValName} =</span>
                    <Slider value={pyValueNum}
                      onChange={(newValue: any) => {
                        this.onInputChanged(newValue, originPy, pyValue)
                      }}
                    />
                  </div>
                )
              }
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
