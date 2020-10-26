'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
import sauce from './sauce'
import examples from '../examples/example-contracts'

const sources = [
  {'browser/Untitled.sol': {content: examples.ballot.content}},
  {'browser/Untitled1.sol': {content: `contract test {}`}}
]

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'The sequence: Compiling / Deploying / Compiling another contract / calling the first contract - should display in the log the transaction with all the decoded information': function (browser: NightwatchBrowser) {
    // https://github.com/ethereum/remix-ide/issues/2864
    browser
    .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
    .clickLaunchIcon('solidity')
    .testContracts('Untitled.sol', sources[0]['browser/Untitled.sol'], ['Ballot'])
    .clickLaunchIcon('udapp')
    .selectAccount('0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c')
    .setValue('input[placeholder="bytes32[] proposalNames"]', '["0x48656c6c6f20576f726c64210000000000000000000000000000000000000000"]')
    .click('*[data-id="Deploy - transact (not payable)"]')
    .waitForElementPresent('*[data-id="universalDappUiContractActionWrapper"]')
    .click('*[data-id="universalDappUiTitleExpander"]')
    .clickFunction('delegate - transact (not payable)', {types: 'address to', values: '"0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db"'})
    .testFunction('0x41fab8ea5b1d9fba5e0a6545ca1a2d62fff518578802c033c2b9a031a01c31b3',
      {
        status: 'true Transaction mined and execution succeed',
        'transaction hash': '0x41fab8ea5b1d9fba5e0a6545ca1a2d62fff518578802c033c2b9a031a01c31b3',
        'decoded input': { 'address to': '0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB' }
      })
    .clickLaunchIcon('solidity')
    .testContracts('Untitled1.sol', sources[1]['browser/Untitled1.sol'], ['test'])
    .clickLaunchIcon('udapp')
    .clickFunction('delegate - transact (not payable)', {types: 'address to', values: ''})
    .pause(5000)
    .testFunction('0xca58080c8099429caeeffe43b8104df919c2c543dceb9edf9242fa55f045c803',
      {
        status: 'false Transaction mined but execution failed',
        'transaction hash': '0xca58080c8099429caeeffe43b8104df919c2c543dceb9edf9242fa55f045c803',
        'decoded input': { 'address to': '0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB' }
      })
    .end()
  },

  tearDown: sauce
}
