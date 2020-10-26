'use strict'

import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
import sauce from './sauce'
import examples from '../examples/example-contracts'

const sources = [
  {'browser/Untitled.sol': { content: examples.ballot_0_4_11.content }}
]

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, null, false)
  },
  '@sources': function () {
    return sources
  },
  'Compile Ballot with compiler version 0.4.11': function (browser: NightwatchBrowser) {
    browser
    .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
    .clickLaunchIcon('solidity')
    .setSolidityCompilerVersion('soljson-v0.4.11+commit.68ef5810.js')
    .waitForElementVisible('[for="autoCompile"]')
    .click('[for="autoCompile"]')
    .verify.elementPresent('[data-id="compilerContainerAutoCompile"]:checked')
    .testContracts('Untitled.sol', sources[0]['browser/Untitled.sol'], ['Ballot'])

  },

  'Deploy Ballot': function (browser: NightwatchBrowser) {
    browser.pause(500)
    .testContracts('Untitled.sol', sources[0]['browser/Untitled.sol'], ['Ballot'])
    .clickLaunchIcon('udapp')
    .selectAccount('0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c')
    .setValue('input[placeholder="uint8 _numProposals"]', '2')
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
  },

  'Debug Ballot / delegate': function (browser: NightwatchBrowser) {
    browser.pause(500)
    .click('*[data-id="txLoggerDebugButton0x41fab8ea5b1d9fba5e0a6545ca1a2d62fff518578802c033c2b9a031a01c31b3"]')
    .pause(2000)
    .click('*[data-id="buttonNavigatorJumpPreviousBreakpoint"]')
    .pause(2000)
    .goToVMTraceStep(20)
    .pause(1000)
    .checkVariableDebug('callstackpanel', ["0x692a70D2e424a56D2C6C27aA97D1a86395877b3A"])
  },

  'Access Ballot via at address': function (browser: NightwatchBrowser) {
    browser.clickLaunchIcon('udapp')
    .click('*[data-id="universalDappUiUdappClose"]')
    .addFile('ballot.abi', { content: ballotABI })
    .addAtAddressInstance('0x692a70D2e424a56D2C6C27aA97D1a86395877b3B', true, false)
    .clickLaunchIcon('fileExplorers')
    .addAtAddressInstance('0x692a70D2e424a56D2C6C27aA97D1a86395877b3A', true, true)
    .pause(500)
    .waitForElementPresent('*[data-id="universalDappUiContractActionWrapper"]')
    .click('*[data-id="universalDappUiTitleExpander"]')
    .clickFunction('delegate - transact (not payable)', {types: 'address to', values: '"0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db"'})
    .testFunction('0xca58080c8099429caeeffe43b8104df919c2c543dceb9edf9242fa55f045c803',
      {
        status: 'true Transaction mined and execution succeed',
        'transaction hash': '0xca58080c8099429caeeffe43b8104df919c2c543dceb9edf9242fa55f045c803',
        'decoded input': { 'address to': '0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB' }
      })
  },

  'Deploy and use Ballot using external web3': function (browser: NightwatchBrowser) {
    browser
    .click('*[data-id="settingsWeb3Mode"]')
    .modalFooterOKClick()
    .clickLaunchIcon('solidity')
    .testContracts('Untitled.sol', sources[0]['browser/Untitled.sol'], ['Ballot'])
    .clickLaunchIcon('udapp')
    .setValue('input[placeholder="uint8 _numProposals"]', '2')
    .click('*[data-id="Deploy - transact (not payable)"]')
    .clickInstance(0)
    .click('*[data-id="terminalClearConsole"]')
    .clickFunction('delegate - transact (not payable)', {types: 'address to', values: '0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c'})
    .journalLastChildIncludes('Ballot.delegate(address)')
    .journalLastChildIncludes('data: 0x5c1...a733c')
    .end()
  },

  tearDown: sauce
}

const ballotABI = `[
	{
		"constant": false,
		"inputs": [
			{
				"name": "to",
				"type": "address"
			}
		],
		"name": "delegate",
		"outputs": [],
		"payable": false,
		"type": "function",
		"stateMutability": "nonpayable"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "winningProposal",
		"outputs": [
			{
				"name": "_winningProposal",
				"type": "uint8"
			}
		],
		"payable": false,
		"type": "function",
		"stateMutability": "nonpayable"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "toVoter",
				"type": "address"
			}
		],
		"name": "giveRightToVote",
		"outputs": [],
		"payable": false,
		"type": "function",
		"stateMutability": "nonpayable"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "toProposal",
				"type": "uint8"
			}
		],
		"name": "vote",
		"outputs": [],
		"payable": false,
		"type": "function",
		"stateMutability": "nonpayable"
	},
	{
		"inputs": [
			{
				"name": "_numProposals",
				"type": "uint8"
			}
		],
		"payable": false,
		"type": "constructor",
		"stateMutability": "nonpayable"
	}
]`
