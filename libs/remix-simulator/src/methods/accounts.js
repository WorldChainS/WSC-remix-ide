const ethJSUtil = require('ethereumjs-util')
const { BN, privateToAddress, isValidPrivate } = require('ethereumjs-util')
const Web3 = require('web3')
const crypto = require('crypto')

class Accounts{

  constructor(executionContext) {
    this.web3 = new Web3()
    this.executionContext = executionContext
    // TODO: make it random and/or use remix-libs
    
    this.accounts = {}
    this.accountsKeys = {}
    this.executionContext.init({get: () => { return true }})
  }

  async resetAccounts () {
    // TODO: setting this to {} breaks the app currently, unclear why still
    // this.accounts = {}
    // this.accountsKeys = {}
    await this._addAccount('503f38a9c967ed597e47fe25643985f032b072db8075426a92110f82df48dfcb', '0x56BC75E2D63100000')
    await this._addAccount('7e5bfb82febc4c2c8529167104271ceec190eafdca277314912eaabdb67c6e5f', '0x56BC75E2D63100000')
    await this._addAccount('cc6d63f85de8fef05446ebdd3c537c72152d0fc437fd7aa62b3019b79bd1fdd4', '0x56BC75E2D63100000')
    await this._addAccount('638b5c6c8c5903b15f0d3bf5d3f175c64e6e98a10bdb9768a2003bf773dcb86a', '0x56BC75E2D63100000')
    await this._addAccount('f49bf239b6e554fdd08694fde6c67dac4d01c04e0dda5ee11abee478983f3bc0', '0x56BC75E2D63100000')
    await this._addAccount('adeee250542d3790253046eee928d8058fd544294a5219bea152d1badbada395', '0x56BC75E2D63100000')
    await this._addAccount('097ffe12069dcb3c3d99e6771e2cbf491a9b8b2f93ff4d3468f550c5e8264755', '0x56BC75E2D63100000')
    await this._addAccount('5f58e8b9f1867ef00578b6f03e159428ab168f776aa445bc3ecdb02c7db8e865', '0x56BC75E2D63100000')
    await this._addAccount('290e721ac87c7b3f31bef7b70104b9280ed3fa1425a59451490c9c02bf50d08f', '0x56BC75E2D63100000')
    await this._addAccount('27efe944ff128cf510ab447b529eec28772f13bf65ebf1cbd504192c4f26e9d8', '0x56BC75E2D63100000')
    await this._addAccount('3cd7232cd6f3fc66a57a6bedc1a8ed6c228fff0a327e169c2bcc5e869ed49511', '0x56BC75E2D63100000')
    await this._addAccount('2ac6c190b09897cd8987869cc7b918cfea07ee82038d492abce033c75c1b1d0c', '0x56BC75E2D63100000')
    await this._addAccount('dae9801649ba2d95a21e688b56f77905e5667c44ce868ec83f82e838712a2c7a', '0x56BC75E2D63100000')
    await this._addAccount('d74aa6d18aa79a05f3473dd030a97d3305737cbc8337d940344345c1f6b72eea', '0x56BC75E2D63100000')
    await this._addAccount('71975fbf7fe448e004ac7ae54cad0a383c3906055a65468714156a07385e96ce', '0x56BC75E2D63100000')
  }

  _addAccount (privateKey, balance) {
    return new Promise((resolve, reject) => {
      privateKey = Buffer.from(privateKey, 'hex')
      const address = ethJSUtil.privateToAddress(privateKey)

      this.accounts[ethJSUtil.toChecksumAddress('0x' + address.toString('hex'))] = { privateKey, nonce: 0 }
      this.accountsKeys[ethJSUtil.toChecksumAddress('0x' + address.toString('hex'))] = '0x' + privateKey.toString('hex')

      let stateManager = this.executionContext.vm().stateManager
      stateManager.getAccount(address, (error, account) => {
        if (error) {
          console.log(error)
          reject(error)
          return
        }
        account.balance = balance || '0xf00000000000000001'
        resolve()
      })
    })
    
  }

  newAccount (cb) {
    let privateKey
    do {
      privateKey = crypto.randomBytes(32)
    } while (!isValidPrivate(privateKey))
    this._addAccount(privateKey, '0x56BC75E2D63100000')
    return cb(null, '0x' + privateToAddress(privateKey).toString('hex'))
  }

  methods () {
    return {
      eth_accounts: this.eth_accounts.bind(this),
      eth_getBalance: this.eth_getBalance.bind(this),
      eth_sign: this.eth_sign.bind(this)
    }
  }

  eth_accounts (_payload, cb) {
    return cb(null, Object.keys(this.accounts))
  }

  eth_getBalance (payload, cb) {
    let address = payload.params[0]
    address = ethJSUtil.stripHexPrefix(address)

    this.executionContext.vm().stateManager.getAccount(Buffer.from(address, 'hex'), (err, account) => {
      if (err) {
        return cb(err)
      }
      cb(null, new BN(account.balance).toString(10))
    })
  }

  eth_sign (payload, cb) {
    const address = payload.params[0]
    const message = payload.params[1]

    const privateKey = this.accountsKeys[ethJSUtil.toChecksumAddress(address)]
    if (!privateKey) {
      return cb(new Error('unknown account'))
    }
    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey)

    const data = account.sign(message)

    cb(null, data.signature)
  }
}

module.exports = Accounts