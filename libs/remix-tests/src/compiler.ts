import fs from './fileSystem'
import async from 'async'
import path from 'path'
import Log from './logger'
const logger = new Log()
const log = logger.logger
import { Compiler as RemixCompiler } from '@remix-project/remix-solidity'
import { SrcIfc, CompilerConfiguration, CompilationErrors } from './types'

function regexIndexOf (inputString: string, regex: RegExp, startpos = 0) {
    const indexOf = inputString.substring(startpos).search(regex)
    return (indexOf >= 0) ? (indexOf + (startpos)) : indexOf
}

function writeTestAccountsContract (accounts: string[]) {
    const testAccountContract = require('../sol/tests_accounts.sol')
    let body = `address[${accounts.length}] memory accounts;`
    if (!accounts.length) body += ';'
    else {
        accounts.map((address, index) => {
            body += `\naccounts[${index}] = ${address};\n`
        })
    }
    return testAccountContract.replace('>accounts<', body)
}

/**
 * @dev Check if path includes name of a remix test file
 * @param path file path to check
 */

function isRemixTestFile(path: string) {
    return ['tests.sol', 'remix_tests.sol', 'remix_accounts.sol'].some(name => path.includes(name))
}

/**
 * @dev Process file to prepare sources object to be passed in solc compiler input
 * 
 * See: https://solidity.readthedocs.io/en/latest/using-the-compiler.html#input-description
 * 
 * @param filePath path of file to process
 * @param sources existing 'sources' object in which keys are the "global" names of the source files and 
 *                value is object containing content of corresponding file with under key 'content'
 * @param isRoot True, If file is a root test contract file which is getting processed, not an imported file
 */

function processFile(filePath: string, sources: SrcIfc, isRoot = false) {
    const importRegEx = /import ['"](.+?)['"];/g;
    let group: RegExpExecArray| null = null;
    const isFileAlreadyInSources: boolean = Object.keys(sources).includes(filePath)

    // Return if file is a remix test file or already processed
    if(isRemixTestFile(filePath) || isFileAlreadyInSources)
        return

    let content: string = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const testFileImportRegEx = /^(import)\s['"](remix_tests.sol|tests.sol)['"];/gm

    // import 'remix_tests.sol', if file is a root test contract file and doesn't already have it 
    if (isRoot && filePath.endsWith('_test.sol') && regexIndexOf(content, testFileImportRegEx) < 0) {
        const includeTestLibs = '\nimport \'remix_tests.sol\';\n'
        content = includeTestLibs.concat(content)
    }
    sources[filePath] = {content};
    importRegEx.exec(''); // Resetting state of RegEx

    // Process each 'import' in file content
    while ((group = importRegEx.exec(content))) {
        const importedFile: string = group[1];
        const importedFilePath: string = path.join(path.dirname(filePath), importedFile);
        processFile(importedFilePath, sources)
    }
}

const userAgent = (typeof (navigator) !== 'undefined') && navigator.userAgent ? navigator.userAgent.toLowerCase() : '-'
const isBrowser = !(typeof (window) === 'undefined' || userAgent.indexOf(' electron/') > -1)

/**
 * @dev Compile file or files before running tests (used for CLI execution)
 * @param filename Name of file
 * @param isDirectory True, if path is a directory
 * @param opts Options
 * @param cb Callback
 * 
 * TODO: replace this with remix's own compiler code
 */

export function compileFileOrFiles(filename: string, isDirectory: boolean, opts: any, cb): void {
    let compiler: any
    const accounts: string[] = opts.accounts || []
    const sources: SrcIfc = {
        'tests.sol': { content: require('../sol/tests.sol') },
        'remix_tests.sol': { content: require('../sol/tests.sol') },
        'remix_accounts.sol': { content: writeTestAccountsContract(accounts) }
    }
    const filepath: string = (isDirectory ? filename : path.dirname(filename))
    try {
        if(!isDirectory && fs.existsSync(filename)) {
            if (filename.split('.').pop() === 'sol') {
                processFile(filename, sources, true)
            } else {
                throw new Error('Not a solidity file')
            }
        } else {
            // walkSync only if it is a directory
            let testFileCount = 0;
            fs.walkSync(filepath, (foundpath: string) => {
                // only process .sol files
                if (foundpath.split('.').pop() === 'sol' && foundpath.endsWith('_test.sol')) {
                    testFileCount++;
                    processFile(foundpath, sources, true)
                }
            })
            if(testFileCount > 0) {
                log.info(`${testFileCount} Solidity test file${testFileCount===1?'':'s'} found`)
            }
            else {
                log.error(`No Solidity test file found. Make sure your test file ends with '_test.sol'`)
                process.exit()
            }
        }
        
    } catch (e) { // eslint-disable-line no-useless-catch
        throw e
    } finally {
        async.waterfall([
            function loadCompiler(next) {
                compiler = new RemixCompiler()
                compiler.onInternalCompilerLoaded()
                // compiler.event.register('compilerLoaded', this, function (version) {
                next()
                // });
            },
            function doCompilation(next) {
                // @ts-ignore
                compiler.event.register('compilationFinished', this, (success, data, source) => {
                    next(null, data)
                })
                compiler.compile(sources, filepath)
            }
        ], function (err: Error | null | undefined, result: any) {
            const error: Error[] = []
            if (result.error) error.push(result.error)
            const errors = (result.errors || error).filter((e) => e.type === 'Error' || e.severity === 'error')
            if (errors.length > 0) {
                if (!isBrowser) require('signale').fatal(errors)
                return cb(new CompilationErrors(errors))
            }
            cb(err, result.contracts, result.sources) //return callback with contract details & ASTs
        })
    }
}

/**
 * @dev Compile contract source before running tests (used for IDE tests execution)
 * @param sources sources
 * @param compilerConfig current compiler configuration
 * @param importFileCb Import file callback
 * @param opts Options
 * @param cb Callback
 */
export function compileContractSources(sources: SrcIfc, compilerConfig: CompilerConfiguration, importFileCb: any, opts: any, cb): void {
    let compiler, filepath: string
    const accounts: string[] = opts.accounts || []
    // Iterate over sources keys. Inject test libraries. Inject test library import statements.
    if (!('remix_tests.sol' in sources) && !('tests.sol' in sources)) {
        sources['tests.sol'] = { content: require('../sol/tests.sol.js') }
        sources['remix_tests.sol'] = { content: require('../sol/tests.sol.js') }
        sources['remix_accounts.sol'] = { content: writeTestAccountsContract(accounts) }
    }
    const testFileImportRegEx = /^(import)\s['"](remix_tests.sol|tests.sol)['"];/gm

    const includeTestLibs = '\nimport \'remix_tests.sol\';\n'
    for (const file in sources) {
        const c: string = sources[file].content
        if (file.endsWith('_test.sol') && c && regexIndexOf(c, testFileImportRegEx) < 0) {
            sources[file].content = includeTestLibs.concat(c)
        }
    }

    async.waterfall([
        function loadCompiler (next) {
            const {currentCompilerUrl, evmVersion, optimize, usingWorker} = compilerConfig
            compiler = new RemixCompiler(importFileCb)
            compiler.set('evmVersion', evmVersion)
            compiler.set('optimize', optimize)
            compiler.loadVersion(usingWorker, currentCompilerUrl)
            // @ts-ignore
            compiler.event.register('compilerLoaded', this, (version) => {
                next()
            })
        },
        function doCompilation (next) {
            // @ts-ignore
            compiler.event.register('compilationFinished', this, (success, data, source) => {
                next(null, data)
            })
            compiler.compile(sources, filepath)
        }
    ], function (err: Error | null | undefined , result: any) {
        const error: Error[] = []
        if (result.error) error.push(result.error)
        const errors = (result.errors || error).filter((e) => e.type === 'Error' || e.severity === 'error')
        if (errors.length > 0) {
            if (!isBrowser) require('signale').fatal(errors)
            return cb(new CompilationErrors(errors))
        }
        cb(err, result.contracts, result.sources) // return callback with contract details & ASTs
    })
}
