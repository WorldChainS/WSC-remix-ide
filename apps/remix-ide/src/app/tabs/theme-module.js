import { Plugin } from '@remixproject/engine'
import { EventEmitter } from 'events'
import QueryParams from '../../lib/query-params'
import * as packageJson from '../../../../../package.json'
import yo from 'yo-yo'

const themes = [
  {name: 'Dark', quality: 'dark', url: 'https://res.cloudinary.com/lianahus/raw/upload/v1597918237/remix-themes/PR365/remix-dark_tvx1s2.css'},
  {name: 'Light', quality: 'light', url: 'https://res.cloudinary.com/lianahus/raw/upload/v1597918237/remix-themes/PR365/remix-light_powaqg.css'},
  {name: 'Midcentury', quality: 'light', url: 'https://res.cloudinary.com/lianahus/raw/upload/v1598014334/remix-themes/PR365/remix-midcentury_hrzph3.css'},
  {name: 'Black', quality: 'dark', url: 'https://res.cloudinary.com/lianahus/raw/upload/v1598014334/remix-themes/PR365/remix-black_undtds.css'},
  {name: 'Candy', quality: 'light', url: 'https://res.cloudinary.com/lianahus/raw/upload/v1598014799/remix-themes/PR365/remix-candy_ikhg4m.css'},

  {name: 'Cerulean', quality: 'light', url: 'https://bootswatch.com/4/cerulean/bootstrap.min.css'},
  {name: 'Flatly', quality: 'light', url: 'https://bootswatch.com/4/flatly/bootstrap.min.css'},
  {name: 'Spacelab', quality: 'light', url: 'https://bootswatch.com/4/spacelab/bootstrap.min.css'},
  {name: 'Cyborg', quality: 'dark', url: 'https://bootswatch.com/4/cyborg/bootstrap.min.css'}
]

const profile = {
  name: 'theme',
  events: ['themeChanged'],
  methods: ['switchTheme', 'getThemes', 'currentTheme'],
  version: packageJson.version,
  kind: 'theme'
}

export class ThemeModule extends Plugin {

  constructor (registry) {
    super(profile)
    this.events = new EventEmitter()
    this._deps = {
      config: registry.get('config').api
    }
    this.themes = themes.reduce((acc, theme) => ({ ...acc, [theme.name]: theme }), {})
    let queryTheme = (new QueryParams()).get().theme
    queryTheme = this.themes[queryTheme] ? queryTheme : null
    let currentTheme = this._deps.config.get('settings/theme')
    currentTheme = this.themes[currentTheme] ? currentTheme : null
    this.active = queryTheme || currentTheme || 'Dark'
    this.forced = queryTheme !== undefined
  }

  /** Return the active theme */
  currentTheme () {
    return this.themes[this.active]
  }

  /** Returns all themes as an array */
  getThemes () {
    return Object.keys(this.themes).map(key => this.themes[key])
  }

  /**
   * Init the theme
   */
  initTheme (callback) {
    if (this.active) {
      const nextTheme = this.themes[this.active] // Theme
      document.documentElement.style.setProperty('--theme', nextTheme.quality)
      const theme = yo`<link rel="stylesheet" href="${nextTheme.url}" id="theme-link"/>`
      theme.addEventListener('load', () => {
        if (callback) callback()
      })
      document.head.insertBefore(theme, document.head.firstChild)
    }
  }

  /**
   * Change the current theme
   * @param {string} [themeName] - The name of the theme
   */
  switchTheme (themeName) {
    if (themeName && !Object.keys(this.themes).includes(themeName)) {
      throw new Error(`Theme ${themeName} doesn't exist`)
    }
    const next = themeName || this.active   // Name
    const nextTheme = this.themes[next] // Theme
    if (!this.forced) this._deps.config.set('settings/theme', next)
    document.getElementById('theme-link').setAttribute('href', nextTheme.url)
    document.documentElement.style.setProperty('--theme', nextTheme.quality)
    if (themeName) this.active = themeName
    // TODO: Only keep `this.emit` (issue#2210)
    this.emit('themeChanged', nextTheme)
    this.events.emit('themeChanged', nextTheme)
  }

  /**
   * fixes the invertion for images since this should be adjusted when we switch between dark/light qualified themes
   * @param {element} [image] - the dom element which invert should be fixed to increase visibility
   */
  fixInvert (image) {
    const invert = this.currentTheme().quality === 'dark' ? 1 : 0
    if (image) {
      image.style.filter = `invert(${invert})`
    }
  }
}
