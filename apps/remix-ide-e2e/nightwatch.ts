import * as fs from 'fs'

const crxFile = fs.readFileSync('apps/remix-ide-e2e/src/extensions/chrome/metamask.crx')
const metamaskExtension = Buffer.from(crxFile).toString('base64')

module.exports = {
  'src_folders': ['dist/apps/remix-ide-e2e/src/tests'],
  'output_folder': './reports/tests',
  'custom_commands_path': ['dist/apps/remix-ide-e2e/src/commands'],
  'custom_assertions_path': '',
  'page_objects_path': '',
  'globals_path': '',

  'test_settings': {
    'default': {
      'selenium_port': 4444,
      'selenium_host': 'localhost',
      'globals': {
        'waitForConditionTimeout': 10000,
        'asyncHookTimeout': 100000
      },
      'screenshots': {
        'enabled': true,
        'path': './reports/screenshots',
        'on_failure': true,
        'on_error': true
      },
      'desiredCapabilities': {
        'browserName': 'firefox',
        'javascriptEnabled': true,
        'acceptSslCerts': true
      },
      'exclude': ['dist/apps/remix-ide-e2e/src/tests/runAndDeploy.js']
    },

    'chrome': {
      'desiredCapabilities': {
        'browserName': 'chrome',
        'javascriptEnabled': true,
        'acceptSslCerts': true,
        'goog:chromeOptions': {
          'args': ['window-size=2560,1440', 'start-fullscreen']
        }
      }
    },

    'chrome-runAndDeploy': {
      'desiredCapabilities': {
        'browserName': 'chrome',
        'javascriptEnabled': true,
        'acceptSslCerts': true,
        'goog:chromeOptions': {
          'args': ['window-size=2560,1440', 'start-fullscreen'],
          'extensions': [metamaskExtension]
        }
      }
    },

    'safari': {
      'desiredCapabilities': {
        'browserName': 'safari',
        'javascriptEnabled': true,
        'acceptSslCerts': true
      }
    },

    'ie': {
      'desiredCapabilities': {
        'browserName': 'internet explorer',
        'javascriptEnabled': true,
        'acceptSslCerts': true
      }
    },

    'firefox': {
      'desiredCapabilities': {
        'browserName': 'firefox',
        'javascriptEnabled': true,
        'acceptSslCerts': true
      }
    }
  }
}
