const yo = require('yo-yo')
const remixDebug = require('@remix-project/remix-debug')
const css = require('./styles/debugger-tab-styles')
import toaster from '../ui/tooltip'
const DebuggerUI = require('./debugger/debuggerUI')
import { ViewPlugin } from '@remixproject/engine'
import * as packageJson from '../../../../../package.json'

const profile = {
  name: 'debugger',
  displayName: 'Debugger',
  methods: ['debug', 'getTrace'],
  events: [],
  icon: 'assets/img/debuggerLogo.webp',
  description: 'Debug transactions',
  kind: 'debugging',
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/debugger.html',
  version: packageJson.version
}

class DebuggerTab extends ViewPlugin {

  constructor (blockchain) {
    super(profile)
    this.el = null
    this.blockchain = blockchain
  }

  render () {
    if (this.el) return this.el

    this.el = yo`
      <div class="${css.debuggerTabView}" id="debugView">
        <div id="debugger" class="${css.debugger}"></div>
      </div>`

    this.on('fetchAndCompile', 'compiling', (settings) => {
      toaster(yo`<div><b>Recompiling and debugging with params</b><pre class="text-left">${JSON.stringify(settings, null, '\t')}</pre></div>`)
    })

    this.on('fetchAndCompile', 'compilationFailed', (data) => {
      toaster(yo`<div><b>Compilation failed...</b> continuing <i>without</i> source code debugging.</div>`)
    })

    this.on('fetchAndCompile', 'notFound', (contractAddress) => {
      toaster(yo`<div><b>Contract ${contractAddress} not found in source code repository</b> continuing <i>without</i> source code debugging.</div>`)
    })

    this.on('fetchAndCompile', 'usingLocalCompilation', (contractAddress) => {
      toaster(yo`<div><b>Using compilation result from Solidity module</b></div>`)
    })

    this.on('fetchAndCompile', 'sourceVerificationNotAvailable', () => {
      toaster(yo`<div><b>Source verification plugin not activated or not available.</b> continuing <i>without</i> source code debugging.</div>`)
    })

    this.debuggerUI = new DebuggerUI(
      this,
      this.el.querySelector('#debugger'),
      (address, receipt) => {
        const target = (address && remixDebug.traceHelper.isContractCreation(address)) ? receipt.contractAddress : address
        return this.call('fetchAndCompile', 'resolve', target || receipt.contractAddress || receipt.to, '.debug', this.blockchain.web3())
      }
    )

    this.call('manager', 'activatePlugin', 'source-verification').catch(e => console.log(e.message))
    // this.call('manager', 'activatePlugin', 'udapp')

    return this.el
  }

  deactivate () {
    this.debuggerUI.deleteHighlights()
    super.deactivate()
  }

  debug (hash) {
    if (this.debuggerUI) this.debuggerUI.debug(hash)
  }

  getTrace (hash) {
    return this.debuggerUI.getTrace(hash)
  }

  debugger () {
    return this.debuggerUI
  }
}

module.exports = DebuggerTab
