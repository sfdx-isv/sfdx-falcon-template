//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          sfdx-falcon/debug/index.mjs
 * @copyright     Vivek M. Chawla - 2018
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Provides custom debugging/logging services.
 * @description   Provides custom debugging/logging services.
 * @version       1.0.0
 * @license       BSD-3-Clause
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
import debug from 'debug';
import chalk from 'chalk';
import chalkTemplate from 'chalk-template';
import util  from 'util';

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       SfdxFalconDebug
 * @summary     Provides custom "debugging" services (ie. debug-style info to console.log()).
 * @description Provides custom "debugging" services (ie. debug-style info to console.log()).
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class SfdxFalconDebug {
    // Public getters
    static get enabledDebugNamespaceCount() {
        return SfdxFalconDebug.enabledDebugNamespaces.size;
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @method      checkEnabled
     * @param       {string}  namespace Required. The "namespace" of a debug object.
     * @returns     {boolean} Returns TRUE if the namespace has been enabled.
     * @description Given a "namespace", check the internal map of "enabled"
     *              namespaces and return true if a match is found.
     * @public @static
     * @example
     * ```
     * if (SfdxFalconDebug.checkEnabled('SomeNamespace')) {
     *   // Does something if "SomeNamespace" is enabled.
     *   doSomething();
     * }
     * ```
     */
    //───────────────────────────────────────────────────────────────────────────┘
    static checkEnabled(namespace) {
        // Split the provided namespace into sections on ":"
        const namespaceGroups = namespace.split(':');
        let namespaceToTest = '';
        // Check the namespace from top level to last level.
        for (const namespaceGroup of namespaceGroups) {
            namespaceToTest += namespaceGroup;
            if (SfdxFalconDebug.enabledDebugNamespaces.get(namespaceToTest)) {
                return true;
            }
            namespaceToTest += ':';
        }
        // No single or combined groupings in the provided namespace match an enabled namespace.
        return false;
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @method      enableDebuggers
     * @param       {Array<string>} namespaces  Required. An array of strings,
     *              each representing a namespace that should be enabled.
     * @param       {number}  [debugDepth]  Optional. The number of levels "deep"
     *              that the nested contents of an Object will be rendered during
     *              certain display operations.
     * @returns     {void}
     * @description Given an Array of strings, add an entry in the Enabled Debuggers
     *              map.  This means that when debug code is reached during execution
     *              any enabled debug messages will be displayed to the user.
     * @public @static
     * @example
     * ```
     * SfdxFalconDebug.enableDebuggers(['Namespace1', 'Namespace2'], 3);
     * ```
     */
    //───────────────────────────────────────────────────────────────────────────┘
    static enableDebuggers(namespaces, debugDepth = 2) {
        for (const namespace of namespaces) {
            SfdxFalconDebug.enabledDebugNamespaces.set(namespace.trim(), true);
        }
        SfdxFalconDebug.debugDepth = debugDepth;
        if (SfdxFalconDebug.enabledDebugNamespaces.size > 0) {
            console.log(chalkTemplate `\n{blue The Following Debug Namesapces are Enabled (Debug Depth = ${debugDepth}):}\n%O\n`, namespaces);
        }
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @method      init
     * @param       {Object} argv  Required. Flags/arguments passed by the user
     *              when executing a CLI command. Flags are contained in an array
     *              with underscore `_` as its key. Arguments are contained in
     *              members with the argument name as the key.
     * @param       {number}  [debugDepth]  Optional. The number of levels "deep"
     *              that the nested contents of an `Object` will be rendered during
     *              certain display operations.
     * @returns     {void}
     * @description Parses an object containing flags/arguments passed by the user 
     *              when they run a command, then calls `enableDebuggers()` to
     *              stand up the debug environment. If no debug namespaces are
     *              provided, the `debugAll` option will be set to `true`.
     * @public @static
     * @example
     * ```
     * SfdxFalconDebug.init(argv, 3);
     * ```
     */
    //───────────────────────────────────────────────────────────────────────────┘
    static init(argv, debugDepth = 2) {
        if (argv['sfdx-falcon-debug'] && typeof argv['sfdx-falcon-debug'] === 'string') {
            // The --sfdx-falcon-debug flag was provided WITH specified debug namespaces.
            const namespaces = argv['sfdx-falcon-debug'].split(',').map(function(item) {
                return item.trim();
            });
            SfdxFalconDebug.enableDebuggers(namespaces, debugDepth);
            return;
        }
        if (argv['sfdx-falcon-debug'] && typeof argv['sfdx-falcon-debug'] === 'boolean') {
            // The --sfdx-falcon-debug flag was provided WITHOUT specifying debug namespaces.
            // In this case we debug everything.
            SfdxFalconDebug.debugAll = true;        
        }
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @method      debugMessage
     * @param       {string}  namespace Required.
     * @param       {string}  message  Required.
     * @returns     {void}
     * @description Given a debug namespace and a string containing a message,
     *              outputs that message to the console.
     * @public @static
     * @example
     * ```
     * SfdxFalconDebug.debugMessage('MyNamespace', 'A debug message');
     * ```
     */
    //───────────────────────────────────────────────────────────────────────────┘
    static debugMessage(namespace, message) {
        const debugFunc = SfdxFalconDebug.getDebugger(namespace);
        debugFunc(`\n${chalk.blue(message)}\n`);
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @method      debugObject
     * @param       {string}  namespace Required.
     * @param       {object}  objToDebug  Required.
     * @param       {string}  [strLead] Optional
     * @param       {string}  [strTail] Optional
     * @returns     {void}
     * @description Given a debug namespace, an object to debug, and optionally
     *              leading and trailing strings to included in the output, sends
     *              the debug output to the console.
     * @public @static
     * @example
     * ```
     * SfdxFalconDebug.debugObject('MyNamespace', someObjectVar, 'Contents of someObjectVar:', 'All done!');
     * ```
     */
    //───────────────────────────────────────────────────────────────────────────┘
    static debugObject(namespace, objToDebug, strLead = '', strTail = '') {
        const debugFunc = SfdxFalconDebug.getDebugger(namespace);
        debugFunc(`\n${chalk.yellow(strLead)}\n` +
            `${util.inspect(objToDebug, { depth: 8, colors: true })}` +
            `${SfdxFalconDebug.printLineBreaks()}`);
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @method      debugString
     * @param       {string}  namespace Required.
     * @param       {string}  strToDebug  Required.
     * @param       {string}  [strLead] Optional
     * @param       {string}  [strTail] Optional
     * @returns     {void}
     * @description Given a debug namespace, a string to debug, and optionally
     *              leading and trailing strings to included in the output, sends
     *              the debug output to the console.
     * @public @static
     * @example
     * ```
     * SfdxFalconDebug.debugString('MyNamespace', someStringValue, '--->', '<---');
     * ```
     */
    //───────────────────────────────────────────────────────────────────────────┘
    static debugString(namespace, strToDebug, strLead = '', strTail = '') {
        const debugFunc = SfdxFalconDebug.getDebugger(namespace);
        debugFunc(`-\n${chalk.blue(strLead)}${strToDebug}${chalk.blue(strTail)}${SfdxFalconDebug.printLineBreaks()}`);
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @method      disableDebuggers
     * @param       {string[]} namespaces  Required.
     * @returns     {void}
     * @description Given an array of debug namespaces, iterates over each and
     *              sets them to FALSE in the Enabled Debugger Namespace map.
     * @public @static
     * @example
     * ```
     * SfdxFalconDebug.disableDebuggers(['Namespace1', 'Namespace2']);
     * ```
     */
    //───────────────────────────────────────────────────────────────────────────┘
    static disableDebuggers(namespaces) {
        for (const namespace of namespaces) {
            SfdxFalconDebug.enabledDebugNamespaces.set(namespace, false);
        }
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @method      getDebugger
     * @param       {string}  namespace Required
     * @returns     {DebugFunc} Returns the debugger with the appropriate namespace.
     * @description Given a debug namespace (eg. "UTILITY:sfdx:executeCommand:"),
     *              attempts to find a match for an existing Debugger object. If
     *              one can't be found, creates a new Debugger, enables it, then
     *              returns it to the caller.
     * @public @static
     * @example
     * ```
     * const myDebug = SfdxFalconDebug.getDebugger('MyNamespace');
     * myDebug('Some debug message');
     * ```
     */
    //───────────────────────────────────────────────────────────────────────────┘
    static getDebugger(namespace) {
        if (SfdxFalconDebug.debuggers.has(namespace)) {
            return SfdxFalconDebug.debuggers.get(namespace);
        }
        else {
            const newDebugger = debug(namespace);
            newDebugger.enabled = true;
            SfdxFalconDebug.debuggers.set(namespace, newDebugger);
            return newDebugger;
        }
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @method      msg
     * @param       {string}  namespace Required.
     * @param       {string}  message  Required.
     * @returns     {void}
     * @description Given a debug namespace and a string containing a message,
     *              outputs that message to the console but ONLY if the specified
     *              namespace was enabled by the user via the `--sfdx-falcon-debug`
     *              flag.
     * @public @static
     * @example
     * ```
     * SfdxFalconDebug.msg('MyNamespace', 'Some debug message');
     * ```
     */
    //───────────────────────────────────────────────────────────────────────────┘
    static msg(namespace, message) {
        if (SfdxFalconDebug.checkEnabled(namespace) || SfdxFalconDebug.debugAll === true) {
            SfdxFalconDebug.debugMessage(namespace, message);
        }
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @method      obj
     * @param       {string}  namespace Required.
     * @param       {object}  objToDebug  Required.
     * @param       {string}  [strLead] Optional
     * @param       {string}  [strTail] Optional
     * @returns     {void}
     * @description Given a debug namespace, an object to debug, and optionally
     *              leading and trailing strings to included in the output, sends
     *              the debug output to the console but ONLY if the specified
     *              namespace was enabled by the user via the --falcondebug flag.
     * @public @static
     * @example
     * ```
     * SfdxFalconDebug.obj('MyNamespace', someObjectVar, 'Contents of someObjectVar:', 'All done!');
     * ```
     */
    //───────────────────────────────────────────────────────────────────────────┘
    static obj(namespace, objToDebug, strLead = '', strTail = '') {
        if (SfdxFalconDebug.checkEnabled(namespace) || SfdxFalconDebug.debugAll === true) {
            SfdxFalconDebug.debugObject(namespace, objToDebug, strLead, strTail);
        }
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @method      str
     * @param       {string}  namespace Required.
     * @param       {string}  strToDebug  Required.
     * @param       {string}  [strLead] Optional
     * @param       {string}  [strTail] Optional
     * @returns     {void}
     * @description Given a debug namespace, a string to debug, and optionally
     *              leading and trailing strings to included in the output, sends
     *              the debug output to the console but ONLY if the specified
     *              namespace was enabled by the user via the --falcondebug flag.
     * @public @static
     * @example
     * ```
     * SfdxFalconDebug.str('MyNamespace', someStringValue, '--->', '<---');
     * ```
     */
    //───────────────────────────────────────────────────────────────────────────┘
    static str(namespace, strToDebug, strLead = '', strTail = '') {
        if (SfdxFalconDebug.checkEnabled(namespace) || SfdxFalconDebug.debugAll === true) {
            SfdxFalconDebug.debugString(namespace, strToDebug, strLead, strTail);
        }
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @method      toConsole
     * @param       {string}  message Required. Message to send to console.log().
     * @description Sends a message to console.log that's pre and post-pended
     *              with newline breaks to help the output be easy to see.
     * @public @static
     * @example
     * ```
     * SfdxFalconDebug.toConsole('A message sent to the console');
     * ```
     */
    //───────────────────────────────────────────────────────────────────────────┘
    static toConsole(message) {
        console.log(`${SfdxFalconDebug.printLineBreaks()}` +
            `\n${chalk.yellow(message)}\n` +
            `${SfdxFalconDebug.printLineBreaks()}`);
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @method      printLineBreaks
     * @description Returns a string containing the number of newline chars as
     *              specified in the lineBreaks public static member variable.
     * @private @static
     * @example
     * ```
     * SfdxFalconDebug.printLineBreaks();
     * ```
     */
    //───────────────────────────────────────────────────────────────────────────┘
    static printLineBreaks() {
        return '\n-'.repeat(SfdxFalconDebug.lineBreaks);
    }
} // ENDOF class SfdxFalconDebug
// Public members
SfdxFalconDebug.lineBreaks = 5;
SfdxFalconDebug.debugDepth = 2;
// Private members
SfdxFalconDebug.debuggers = new Map();
SfdxFalconDebug.enabledDebugNamespaces = new Map();
SfdxFalconDebug.debugAll = false;
