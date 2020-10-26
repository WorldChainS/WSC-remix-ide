import * as packageJson from '../../../../../../package.json'
import { ViewPlugin } from '@remixproject/engine'

let yo = require('yo-yo')
let csjs = require('csjs-inject')
let globalRegistry = require('../../../global/registry')
let CompilerImport = require('../../compiler/compiler-imports')
var modalDialogCustom = require('../modal-dialog-custom')
var tooltip = require('../tooltip')
var GistHandler = require('../../../lib/gist-handler')
var QueryParams = require('../../../lib/query-params.js')

let css = csjs`
  .text {
    cursor: pointer;
    font-weight: normal;
    max-width: 300px;
    user-select: none;
  }
  .text:hover {
    text-decoration: underline;
  }
  .homeContainer {
    user-select: none;
    overflow-y: hidden;
  }
  .mainContent {
    overflow-y: auto;
    flex-grow: 3;
  }
  .hpLogoContainer {
    margin: 30px;
    padding-right: 90px;
  }
  .mediaBadge {
   font-size: 2em;
   height: 2em;
   width: 2em;
  }
  .mediaBadge:focus {
    outline: none;
  }
  .logoImg {
    height: 10em;
  }
  .hpSections {
  }
  .rightPanel {
    right: 0;
    position: absolute;
    z-index: 1000;
  }
  .remixHomeMedia {
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 720px;
  }
  .panels {
    box-shadow: 0px 0px 17px -7px;
  }
  .labelIt {
    margin-bottom: 0;
  }
  .bigLabelSize {
    font-size: 13px;
  }
  .seeAll {
    margin-top: 7px;
    white-space: nowrap;
  }
  .importFrom p {
    margin-right: 10px;
  }
  .logoContainer img{
    height: 150px;
    opacity: 0.7;
  }
  .envLogo {
    height: 16px;
  }
  .cursorStyle {
    cursor: pointer;
  }
  .envButton {
    width: 120px;
    height: 70px;
  }
  .media {
    overflow: hidden;
    width: 400px;
    transition: .5s ease-out;
    z-index: 1000;
  }
}
`

const profile = {
  name: 'home',
  displayName: 'Home',
  methods: [],
  events: [],
  description: ' - ',
  icon: 'assets/img/remixLogo.webp',
  location: 'mainPanel',
  version: packageJson.version
}

export class LandingPage extends ViewPlugin {

  constructor (appManager, verticalIcons) {
    super(profile)
    this.profile = profile
    this.appManager = appManager
    this.verticalIcons = verticalIcons
    this.gistHandler = new GistHandler()
    const themeQuality = globalRegistry.get('themeModule').api.currentTheme().quality
    window.addEventListener('resize', () => this.adjustMediaPanel())
    window.addEventListener('click', (e) => this.hideMediaPanel(e))
    this.twitterFrame = yo`
      <div class="px-2 ${css.media}">
        <a class="twitter-timeline"
          data-width="350"
          data-theme="${themeQuality}"
          data-chrome="nofooter noheader transparent"
          data-tweet-limit="8"
          href="https://twitter.com/EthereumRemix"
        >
        </a>
        <script src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
      </div>
    `
    this.badgeTwitter = yo`<button
      class="btn-info p-2 m-1 border rounded-circle ${css.mediaBadge} fab fa-twitter"
      src="assets/img/sleepingRemiCroped.webp"
      id="remixIDEHomeTwitterbtn"
      onclick=${(e) => this.showMediaPanel(e)}
    ></button>`
    this.badgeMedium = yo`<button
      class="btn-danger p-2 m-1 border rounded-circle ${css.mediaBadge} fab fa-medium"
      src="assets/img/sleepingRemiCroped.webp"
      id="remixIDEHomeMediumbtn"
      onclick=${(e) => this.showMediaPanel(e)}
    ></button>`
    this.twitterPanel = yo`
      <div id="remixIDE_TwitterBlock" class="p-2 mx-0 mb-0 d-none ${css.remixHomeMedia}">
        ${this.twitterFrame}
      </div>
    `
    this.mediumPanel = yo`
      <div id="remixIDE_MediumBlock" class="p-2 mx-04 mb-0 d-none ${css.remixHomeMedia}">
        <div id="medium-widget" class="p-3 ${css.media}">
          <div
            id="retainable-rss-embed"
            data-rss="https://medium.com/feed/remix-ide"
            data-maxcols="1"
            data-layout="grid"
            data-poststyle="external"
            data-readmore="More..."
            data-buttonclass="btn mb-3"
            data-offset="-100">
          </div>
        </div>
      </div>
    `
    this.adjustMediaPanel()
    globalRegistry.get('themeModule').api.events.on('themeChanged', (theme) => {
      console.log("theme is ", theme.quality)
      this.onThemeChanged(theme.quality)
    })
  }

  adjustMediaPanel () {
    this.twitterPanel.style.maxHeight = Math.max(window.innerHeight - 150, 200) + 'px'
    this.mediumPanel.style.maxHeight = Math.max(window.innerHeight - 150, 200) + 'px'
  }

  hideMediaPanel (e) {
    const mediaPanelsTitle = document.getElementById('remixIDEMediaPanelsTitle')
    const mediaPanels = document.getElementById('remixIDEMediaPanels')
    if (!mediaPanelsTitle.contains(e.target) && !mediaPanels.contains(e.target)) {
      this.mediumPanel.classList.remove('d-block')
      this.mediumPanel.classList.add('d-none')
      this.twitterPanel.classList.remove('d-block')
      this.twitterPanel.classList.add('d-none')
    }
  }

  onThemeChanged (themeQuality) {
    console.log("themes in listener is", themeQuality)
    let twitterFrame = yo`
      <div class="px-2 ${css.media}">
        <a class="twitter-timeline"
          data-width="350"
          data-theme="${themeQuality}"
          data-chrome="nofooter noheader transparent"
          data-tweet-limit="8"
          href="https://twitter.com/EthereumRemix"
        >
        </a>
        <script src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
      </div>
    `
    yo.update(this.twitterFrame, twitterFrame)
  }

  showMediaPanel (e) {
    console.log(e)
    if (e.target.id === 'remixIDEHomeTwitterbtn') {
      this.mediumPanel.classList.remove('d-block')
      this.mediumPanel.classList.add('d-none')
      this.twitterPanel.classList.toggle('d-block')
    } else {
      this.twitterPanel.classList.remove('d-block')
      this.twitterPanel.classList.add('d-none')
      this.mediumPanel.classList.toggle('d-block')
    }
  }
  render () {
    let load = (service, item, examples, info) => {
      let compilerImport = new CompilerImport()
      let fileProviders = globalRegistry.get('fileproviders').api
      const msg = yo`
        <div class="p-2">
          <span>Enter the ${item} you would like to load.</span>
          <div>${info}</div>
          <div>e.g ${examples.map((url) => { return yo`<div class="p-1"><a>${url}</a></div>` })}</div>
        </div>`

      modalDialogCustom.prompt(`Import from ${service}`, msg, null, (target) => {
        if (target !== '') {
          compilerImport.import(
            target,
            (loadingMsg) => { tooltip(loadingMsg) },
            (error, content, cleanUrl, type, url) => {
              if (error) {
                modalDialogCustom.alert(error)
              } else {
                fileProviders['browser'].addExternal(type + '/' + cleanUrl, content, url)
                this.verticalIcons.select('fileExplorers')
              }
            }
          )
        }
      })
    }

    const startSolidity = () => {
      this.appManager.ensureActivated('solidity')
      this.appManager.ensureActivated('udapp')
      this.appManager.ensureActivated('solidityStaticAnalysis')
      this.appManager.ensureActivated('solidityUnitTesting')
      this.verticalIcons.select('solidity')
    }
    /*
    const startWorkshop = () => {
      this.appManager.ensureActivated('box')
      this.appManager.ensureActivated('solidity')
      this.appManager.ensureActivated('solidityUnitTesting')
      this.appManager.ensureActivated('workshops')
      this.verticalIcons.select('workshops')
    }
    */

    const startPipeline = () => {
      this.appManager.ensureActivated('solidity')
      this.appManager.ensureActivated('pipeline')
      this.appManager.ensureActivated('udapp')
    }
    const startDebugger = () => {
      this.appManager.ensureActivated('debugger')
      this.verticalIcons.select('debugger')
    }
    const startMythX = () => {
      this.appManager.ensureActivated('solidity')
      this.appManager.ensureActivated('mythx')
      this.verticalIcons.select('mythx')
    }
    const startSourceVerify = () => {
      this.appManager.ensureActivated('solidity')
      this.appManager.ensureActivated('source-verification')
      this.verticalIcons.select('source-verification')
    }
    const startPluginManager = () => {
      this.appManager.ensureActivated('pluginManager')
      this.verticalIcons.select('pluginManager')
    }

    const createNewFile = () => {
      let fileExplorer = globalRegistry.get('fileexplorer/browser').api
      fileExplorer.createNewFile()
    }
    const connectToLocalhost = () => {
      this.appManager.ensureActivated('remixd')
    }
    const importFromGist = () => {
      this.gistHandler.loadFromGist({gist: ''}, globalRegistry.get('filemanager').api)
      this.verticalIcons.select('fileExplorers')
    }

    globalRegistry.get('themeModule').api.events.on('themeChanged', (theme) => {
      globalRegistry.get('themeModule').api.fixInvert(document.getElementById('remixLogo'))
      globalRegistry.get('themeModule').api.fixInvert(document.getElementById('solidityLogo'))
      globalRegistry.get('themeModule').api.fixInvert(document.getElementById('pipelineLogo'))
      globalRegistry.get('themeModule').api.fixInvert(document.getElementById('debuggerLogo'))
      globalRegistry.get('themeModule').api.fixInvert(document.getElementById('workshopLogo'))
      globalRegistry.get('themeModule').api.fixInvert(document.getElementById('moreLogo'))
    })

    const createLargeButton = (imgPath, envID, envText, callback) => {
      return yo`
        <button
          class="btn border-secondary d-flex mr-3 text-nowrap justify-content-center flex-column align-items-center ${css.envButton}"
          data-id="landingPageStartSolidity"
          onclick=${() => callback()}
        >
          <img class="m-2 align-self-center ${css.envLogo}" id=${envID} src="${imgPath}">
          <label class="text-uppercase text-dark ${css.cursorStyle}">${envText}</label>
        </button>
      `
    }

    // main
    const solEnv = createLargeButton('assets/img/solidityLogo.webp', 'solidityLogo', 'Solidity', startSolidity)
    // Featured
    const pipelineEnv = createLargeButton('assets/img/pipelineLogo.webp', 'pipelineLogo', 'Pipeline', startPipeline)
    const debuggerEnv = createLargeButton('assets/img/debuggerLogo.webp', 'debuggerLogo', 'Debugger', startDebugger)
    const mythXEnv = createLargeButton('assets/img/mythxLogo.webp', 'mythxLogo', 'MythX', startMythX)
    const sourceVerifyEnv = createLargeButton('assets/img/sourceVerifyLogo.webp', 'sourceVerifyLogo', 'Sourcify', startSourceVerify)
    const moreEnv = createLargeButton('assets/img/moreLogo.webp', 'moreLogo', 'More', startPluginManager)

    const themeQuality = globalRegistry.get('themeModule').api.currentTheme().quality
    const invertNum = (themeQuality === 'dark') ? 1 : 0
    solEnv.getElementsByTagName('img')[0].style.filter = `invert(${invertNum})`
    pipelineEnv.getElementsByTagName('img')[0].style.filter = `invert(${invertNum})`
    debuggerEnv.getElementsByTagName('img')[0].style.filter = `invert(${invertNum})`
    mythXEnv.getElementsByTagName('img')[0].style.filter = `invert(${invertNum})`
    sourceVerifyEnv.getElementsByTagName('img')[0].style.filter = `invert(${invertNum})`
    moreEnv.getElementsByTagName('img')[0].style.filter = `invert(${invertNum})`

    let switchToPreviousVersion = () => {
      const query = new QueryParams()
      query.update({appVersion: '0.7.7'})
      document.location.reload()
    }
    const img = yo`<img class=${css.logoImg} src="assets/img/sleepingRemiCroped.webp"></img>`

    // to retrieve medium posts
    document.body.appendChild(yo`<script src="https://www.retainable.io/assets/retainable/rss-embed/retainable-rss-embed.js"></script>`)
    const container = yo`
      <div class="${css.homeContainer} d-flex" data-id="landingPageHomeContainer">
        <div class="${css.mainContent} bg-light">
          <div class="d-flex justify-content-between">
            <div class="d-flex flex-column">
              <div class="border-bottom d-flex justify-content-between clearfix py-3 mb-4">
                <div class="mx-4 w-100">${img}</div>
              </div>

              <div class="row ${css.hpSections} mx-4" data-id="landingPageHpSections">
                <div class="ml-3">
                  <div class="plugins mb-5">
                  <h4>Featured Plugins</h4>
                  <div class="d-flex flex-row pt-2">
                    ${solEnv}
                    ${pipelineEnv}
                    ${mythXEnv}
                    ${sourceVerifyEnv}
                    ${debuggerEnv}
                    ${moreEnv}
                  </div>
                </div>
                  <div class="d-flex">
                    <div class="file">
                      <h4>File</h4>
                      <p class="mb-1">
                        <i class="mr-1 far fa-file"></i>
                        <span class="ml-1 mb-1 ${css.text}" onclick=${() => createNewFile()}>New File</span>
                      </p>
                      <p class="mb-1">
                        <i class="mr-1 far fa-file-alt"></i>
                        <label class="ml-1 ${css.labelIt} ${css.bigLabelSize} ${css.text}">
                          Open Files
                          <input title="open file" type="file" onchange="${
                            (event) => {
                              event.stopPropagation()
                              let fileExplorer = globalRegistry.get('fileexplorer/browser').api
                              fileExplorer.uploadFile(event)
                            }
                          }" multiple />
                        </label>
                      </p>
                      <p class="mb-1">
                        <i class="far fa-hdd"></i>
                        <span class="ml-1 ${css.text}" onclick=${() => connectToLocalhost()}>Connect to Localhost</span>
                      </p>
                      <p class="mt-3 mb-0"><label>IMPORT FROM:</label></p>
                      <div class="btn-group">
                        <button class="btn mr-1 btn-secondary" data-id="landingPageImportFromGistButton" onclick="${() => importFromGist()}">Gist</button>
                        <button class="btn mx-1 btn-secondary" onclick="${() => load('Github', 'github URL', ['https://github.com/0xcert/ethereum-erc721/src/contracts/tokens/nf-token-metadata.sol', 'https://github.com/OpenZeppelin/openzeppelin-solidity/blob/67bca857eedf99bf44a4b6a0fc5b5ed553135316/contracts/access/Roles.sol', 'github:OpenZeppelin/openzeppelin-solidity/contracts/ownership/Ownable.sol#v2.1.2'])}">GitHub</button>
                        <button class="btn mx-1 btn-secondary" onclick="${() => load('Swarm', 'bzz-raw URL', ['bzz-raw://<swarm-hash>'])}">Swarm</button>
                        <button class="btn mx-1 btn-secondary" onclick="${() => load('Ipfs', 'ipfs URL', ['ipfs://<ipfs-hash>'])}">Ipfs</button>
                        <button class="btn mx-1 btn-secondary" onclick="${() => load('Https', 'http/https raw content', ['https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-solidity/master/contracts/crowdsale/validation/IndividuallyCappedCrowdsale.sol'])}">https</button>
                        <button class="btn mx-1 btn-secondary  text-nowrap" onclick="${() => load('@resolver-engine', 'resolver-engine URL', ['github:OpenZeppelin/openzeppelin-solidity/contracts/ownership/Ownable.sol#v2.1.2'], yo`<span>please checkout <a class='text-primary' href="https://github.com/Crypto-Punkers/resolver-engine" target='_blank'>https://github.com/Crypto-Punkers/resolver-engine</a> for more information</span>`)}">Resolver-engine</button>
                      </div><!-- end of btn-group -->
                    </div><!-- end of div.file -->
                    <div class="ml-4 pl-4">
                      <h4>Resources</h4>
                      <p class="mb-1">
                        <i class="mr-1 fas fa-book"></i>
                        <a class="${css.text}" target="__blank" href="https://remix-ide.readthedocs.io/en/latest/#">Documentation</a>
                      </p>
                      <p class="mb-1">
                        <i class="mr-1 fab fa-gitter"></i>
                        <a class="${css.text}" target="__blank" href="https://gitter.im/ethereum/remix">Gitter channel</a>
                        </p>
                      <p class="mb-1">
                        <i class="mr-1 fab fa-medium"></i>
                        <a class="${css.text}" target="__blank" href="https://medium.com/remix-ide">Medium Posts</a>
                      </p>
                      <p>
                        <i class="fab fa-ethereum"></i>
                        <span class="ml-2 ${css.text}" onclick=${() => switchToPreviousVersion()}>Old experience</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div><!-- end of hpSections -->
            </div>
            <div class="d-flex flex-column ${css.rightPanel}">
              <div class="d-flex pr-2 py-2 align-self-end"  id="remixIDEMediaPanelsTitle">
                ${this.badgeTwitter}
                ${this.badgeMedium}
              </div>
              <div class="mr-3 d-flex bg-light ${css.panels}" id="remixIDEMediaPanels">
                ${this.mediumPanel}
                ${this.twitterPanel}
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    return container
  }
}
