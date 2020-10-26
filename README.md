
# Remix

Remix is a browser-based compiler and IDE that enables users to build **contracts with Solidity language** and to debug transactions.



## Offline Usage

The `gh-pages` branch has always the latest stable build of Remix. It also contains a ZIP file with the entire build. Download it to use offline.

Note: It contains the latest release of Solidity available at the time of the packaging. No other compiler versions are supported.


## INSTALLATION:

Install **npm** and **node.js** (see https://docs.npmjs.com/getting-started/installing-node), then
install [Nx CLI](https://nx.dev/react/cli/overview) globally to enable running **nx executable commands**.
```bash
npm install -g @nrwl/cli
```

clone the github repository (`wget` need to be installed first) :

```bash
git clone https://github.com/ethereum/remix-project.git

cd remix-project
npm install
nx build remix-ide --with-deps
nx serve
```


## DEVELOPING:

Run `nx serve` and open `http://127.0.0.1:8080` in your browser.

Then open your `text editor` and start developing.
The browser will automatically refresh when files are saved.

### Troubleshooting building

Some things to consider if you have trouble building the package:

- Make sure that you have the correct version of `node`, `npm` and `nvm`. Also ensure you have [Nx CLI](https://nx.dev/react/cli/overview) installed globally. You can find the version that is tested on Travis CI by looking at the log in the [build results](https://travis-ci.org/ethereum/remix-ide).

Run:

```bash
node --version
npm --version
nvm --version
```

- In Debian based OS such as Ubuntu 14.04LTS you may need to run `apt-get install build-essential`. After installing `build-essential` run `npm rebuild`.

## Unit Testing

Run the unit tests via: `nx test <project-name>`
```bash
    nx test remix-analyzer
```

Running unit tests via `nx test` requires at least node v10.0.0

## Browser Testing

To run the Selenium tests via Nightwatch:

 - Build Remix IDE and serve it: `nx build remix-ide --with-deps && nx serve` # starts web server at localhost:8080
 - Make sure Selenium is installed `npm run selenium-install` # don't need to repeat
 - Run a selenium server `npm run selenium`
 - Run all the tests `npm run nightwatch_local_firefox` or `npm run nightwatch_local_chrome`
 - Or run a specific test case: 
 
		- npm run nightwatch_local_ballot

        - npm run nightwatch_local_usingWorker
		
		- npm run nightwatch_local_libraryDeployment
		
		- npm run nightwatch_local_solidityImport
		
		- npm run nightwatch_local_recorder
		
		- npm run nightwatch_local_transactionExecution
		
		- npm run nightwatch_local_staticAnalysis
		
		- npm run nightwatch_local_signingMessage

        - npm run nightwatch_local_specialFunctions

        - npm run nightwatch_local_solidityUnitTests

        - npm run nightwatch_local_remixd # remixd needs to be run

		- npm run nightwatch_local_terminal

        - npm run nightwatch_local_gist

        - npm run nightwatch_local_workspace

        - npm run nightwatch_local_defaultLayout

        - npm run nightwatch_local_pluginManager

        - npm run nightwatch_local_publishContract

        - npm run nightwatch_local_generalSettings

        - npm run nightwatch_local_fileExplorer

        - npm run nightwatch_local_debugger

        - npm run nightwatch_local_editor

        - npm run nightwatch_local_compiler

        - npm run nightwatch_local_txListener

        - npm run nightwatch_local_fileManager

        - npm run nightwatch_local_runAndDeploy
		
        
**NOTE:**

- **the `ballot` tests suite** requires to run `ganache-cli` locally.

- **the `remixd` tests suite** requires to run `remixd` locally.

- **the `gist` tests suite** requires specifying a github access token in **.env file**. 
```
    gist_token = <token>
```
**note that this token should have permission to create a gist.**


## Documentation

To see details about how to use Remix for developing and/or debugging Solidity contracts, please see [our documentation page](https://remix-ide.readthedocs.io/en/latest/)
