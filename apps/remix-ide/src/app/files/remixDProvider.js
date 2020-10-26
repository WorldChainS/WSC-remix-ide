'use strict'
var EventManager = require('../../lib/events')

module.exports = class RemixDProvider {
  constructor (appManager) {
    this.event = new EventManager()
    this._appManager = appManager
    this.type = 'localhost'
    this.error = { 'EEXIST': 'File already exists' }
    this._isReady = false
    this._readOnlyFiles = {}
    this._readOnlyMode = false
    this.filesContent = {}
    this.files = {}
  }

  _registerEvent () {
    var remixdEvents = ['connecting', 'connected', 'errored', 'closed']
    remixdEvents.forEach((value) => {
      this._appManager.on('remixd', value, (event) => {
        this.event.trigger(value, [event])
      })
    })

    this._appManager.on('remixd', 'folderAdded', (path) => {
      this.event.trigger('folderAdded', [this.addPrefix(path)])
    })

    this._appManager.on('remixd', 'fileAdded', (path) => {
      this.event.trigger('fileAdded', [this.addPrefix(path)])
    })

    this._appManager.on('remixd', 'fileChanged', (path) => {
      this.event.trigger('fileChanged', [this.addPrefix(path)])
    })

    this._appManager.on('remixd', 'fileRemoved', (path) => {
      this.event.trigger('fileRemoved', [this.addPrefix(path)])
    })

    this._appManager.on('remixd', 'fileRenamed', (oldPath, newPath) => {
      this.event.trigger('fileRemoved', [this.addPrefix(oldPath), this.addPrefix(newPath)])
    })
  }

  isConnected () {
    return this._isReady
  }

  close (cb) {
    this._isReady = false
    cb()
  }

  init (cb) {
    if (this._isReady) return cb && cb()
    this._appManager.call('remixd', 'folderIsReadOnly', {})
    .then((result) => {
      this._isReady = true
      this._readOnlyMode = result
      this._registerEvent()
      cb && cb()
    }).catch((error) => {
      cb && cb(error)
    })
  }

  exists (path, cb) {
    if (!this._isReady) return cb && cb('provider not ready')
    const unprefixedpath = this.removePrefix(path)

    return this._appManager.call('remixd', 'exists', { path: unprefixedpath })
    .then((result) => {
      if (cb) return cb(null, result)
      return result
    }).catch((error) => {
      if (cb) return cb(error)
      throw new Error(error)
    })
  }

  getNormalizedName (path) {
    return path
  }

  getPathFromUrl (path) {
    return path
  }

  get (path, cb) {
    if (!this._isReady) return cb && cb('provider not ready')
    var unprefixedpath = this.removePrefix(path)
    this._appManager.call('remixd', 'get', { path: unprefixedpath })
    .then((file) => {
      this.filesContent[path] = file.content
      if (file.readonly) { this._readOnlyFiles[path] = 1 }
      cb(null, file.content)
    }).catch((error) => {
      if (error) console.log(error)
      // display the last known content.
      // TODO should perhaps better warn the user that the file is not synced.
      return cb(null, this.filesContent[path])
    })
  }

  async set (path, content, cb) {
    if (!this._isReady) return cb && cb('provider not ready')
    const unprefixedpath = this.removePrefix(path)

    return this._appManager.call('remixd', 'set', { path: unprefixedpath, content: content }).then(async (result) => {
      if (cb) return cb(null, result)
    }).catch((error) => {
      if (cb) return cb(error)
      throw new Error(error)
    })
  }

  isReadOnly (path) {
    return this._readOnlyMode || this._readOnlyFiles[path] === 1
  }

  remove (path) {
    return new Promise((resolve, reject) => {
      if (!this._isReady) return reject('provider not ready')
      const unprefixedpath = this.removePrefix(path)
      this._appManager.call('remixd', 'remove', { path: unprefixedpath })
      .then(result => {
        const path = this.type + '/' + unprefixedpath

        delete this.filesContent[path]
        resolve(true)
        this.init()
      }).catch(error => {
        if (error) console.log(error)
        resolve(false)
      })
    })
  }

  rename (oldPath, newPath, isFolder) {
    const unprefixedoldPath = this.removePrefix(oldPath)
    const unprefixednewPath = this.removePrefix(newPath)
    if (!this._isReady) return new Promise((resolve, reject) => reject('provider not ready'))
    return this._appManager.call('remixd', 'rename', { oldPath: unprefixedoldPath, newPath: unprefixednewPath })
    .then(result => {
      const newPath = this.type + '/' + unprefixednewPath
      const oldPath = this.type + '/' + unprefixedoldPath

      this.filesContent[newPath] = this.filesContent[oldPath]
      delete this.filesContent[oldPath]
      this.init(() => {
        this.event.trigger('fileRenamed', [oldPath, newPath, isFolder])
      })
      return result
    }).catch(error => {
      console.log(error)
      if (this.error[error.code]) error = this.error[error.code]
      this.event.trigger('fileRenamedError', [this.error[error.code]])
    })
  }

  isExternalFolder (path) {
    return false
  }

  removePrefix (path) {
    path = path.indexOf(this.type) === 0 ? path.replace(this.type, '') : path
    if (path[0] === '/') return path.substring(1)
    return path
  }

  addPrefix (path) {
    if (path.indexOf(this.type + '/') === 0) return path
    if (path[0] === '/') return 'localhost' + path
    return 'localhost/' + path
  }

  resolveDirectory (path, callback) {
    var self = this
    if (path[0] === '/') path = path.substring(1)
    if (!path) return callback(null, { [self.type]: { } })
    const unprefixedpath = this.removePrefix(path)

    if (!this._isReady) return callback && callback('provider not ready')
    this._appManager.call('remixd', 'resolveDirectory', { path: unprefixedpath }).then((result) => {
      callback(null, result)
    }).catch(callback)
  }

  async isDirectory (path) {
    const unprefixedpath = this.removePrefix(path)
    if (!this._isReady) throw new Error('provider not ready')
    return await this._appManager.call('remixd', 'isDirectory', {path: unprefixedpath})
  }

  async isFile (path) {
    const unprefixedpath = this.removePrefix(path)
    if (!this._isReady) throw new Error('provider not ready')
    return await this._appManager.call('remixd', 'isFile', { path: unprefixedpath })
  }
}
