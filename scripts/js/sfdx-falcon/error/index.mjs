//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          sfdx-falcon/error/index.mjs
 * @copyright     Vivek M. Chawla - 2018
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Provides specialized error structures for SFDX-Falcon modules.
 * @description   Provides specialized error structures for SFDX-Falcon modules.  Wraps SfdxError
 *                by adding additional SFDX-Falcon specific stack information as well as customized
 *                rendering capabilities to show formatted output via the console.
 * @version       1.0.0
 * @license       BSD-3-Clause
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Modules
import  { isEmpty }     from "lodash-es";           // Useful function for detecting empty objects.
import  chalkTemplate   from "chalk-template";      // Required for chalk templates.
import  util            from "util";                // Provides access to the "inspect" function to help output objects via console.log.


// Import Local Modules
import { findJson }     from "../utilities/json.mjs";   // Helps find JSON in an abitrary string.

// Require Modules
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       SfdxFalconError
 * @extends     SfdxError
 * @description Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class SfdxFalconError extends Error {
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @method      renderError
     * @param       {Error}   errorToRender  Required. Any object that is a child
     *              of Error.
     * @param       {number}  [childInspectDepth] Optional. Sets how deep the
     *              object inpsection goes when rendering "child" objects.
     * @param       {number}  [detailInspectDepth]  Optional. Sets how deep the
     *              object inpsection goes when rendering "detail" objects.
     * @param       {number}  [errorInspectDepth] Optional. Sets how deep the
     *              object inpsection goes when rendering "error" objects.
     * @returns     {string}
     * @description Generates a string of completely formatted output that's ready
     *              for display to the user via console.log() or debug(). Relies
     *              on the caller to decide how to actually display to the user.
     * @public @static
     */
    //───────────────────────────────────────────────────────────────────────────┘
    static renderError(errorToRender, childInspectDepth = 2, detailInspectDepth = 4, errorInspectDepth = 1) {
        // Setup the options that will be used
        const renderOptions = {
            headerColor: `yellow`,
            labelColor: `blue`,
            errorLabelColor: `red`,
            valueColor: `reset`,
            childInspectDepth: childInspectDepth || 2,
            detailInspectDepth: detailInspectDepth || 4,
            errorInspectDepth: errorInspectDepth || 1
        };
        // If what we got is NOT any type of Error, render as UNKNOWN
        if ((errorToRender instanceof Error) !== true) {
            return SfdxFalconError.renderUnknownDetail(errorToRender, renderOptions);
        }
        // Render the BASE error info.
        let renderOutput = SfdxFalconError.renderBaseDetail(errorToRender, renderOptions);
        // Render details for SfdxCliError objects.
        if (errorToRender instanceof SfdxCliError) {
            renderOutput += SfdxFalconError.renderSfdxCliErrorDetail(errorToRender, renderOptions);
        }
        // Render details for ShellError objects.
        if (errorToRender instanceof ShellError) {
            renderOutput += SfdxFalconError.renderShellErrorDetail(errorToRender, renderOptions);
        }
        // All done. Return the rendered output to caller.
        return renderOutput;
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @method      wrap
     * @param       {Error|unknown} error  Required. The Error object to wrap. If
     *              something other than an Error object is provided, its data
     *              will be attached to a new SfdxFalconError object.
     * @param       {string}  source  Required. Identifies the source of the
     *              error, typically a reference to the debug address of the
     *              code where this is being called from.
     * @description Given an instance of Error, wraps it as SFDX-Falcon Error and
     *              returns the result.
     * @public @static
     */
    //───────────────────────────────────────────────────────────────────────────┘
    static wrap(error, source) {
        // If this is already an SfdxFalconError, just return it.
        if (error instanceof SfdxFalconError) {
            return error;
        }
        // Create a new instance of SFDX-Falcon Error.
        let sfdxFalconError;
        if (error instanceof Error) {
            sfdxFalconError = new SfdxFalconError(error.message, error.name, source);
            if (sfdxFalconError.stack) {
                sfdxFalconError.stack = sfdxFalconError.stack.replace(`${error.name}: ${error.message}`, `Outer stack:`);
                sfdxFalconError.stack = `${error.stack}\n${sfdxFalconError.stack}`;
            }
        }
        else {
            sfdxFalconError = new SfdxFalconError(`Additional error detail saved to the SfdxFalconError.data Object.`, `UnknownError`);
            sfdxFalconError.data = { unknownObj: error };
        }
        // Return the new Falcon Error
        return sfdxFalconError;
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @method      renderBaseDetail
     * @param       {SfdxFalconError} errorToRender  Required. Should be an
     *              SfdxFalconError, but could be any instanceof Error.
     * @param       {SfdxFalconErrorRenderOptions}  options  Required. Rendering
     *              options that determine colors and inspection depth.
     * @returns     {string}
     * @description Generates the baseline set of completely formatted output
     *              that is relevant to ALL Errors.
     * @private @static
     */
    //───────────────────────────────────────────────────────────────────────────┘
    static renderBaseDetail(errorToRender, options) {
        // Lay down the core information.
        let renderOutput = chalkTemplate `\n{${options.errorLabelColor} Error Name:}    {${options.valueColor} ${errorToRender.name}}`
            + chalkTemplate `\n{${options.errorLabelColor} Error Message:} {${options.valueColor} ${errorToRender.message}}`;
        // Add SfdxError Actions.
        if (errorToRender.actions && (isEmpty(errorToRender.actions) === false)) {
            renderOutput += chalkTemplate `\n{${options.errorLabelColor} SfdxError Actions (Depth ${options.childInspectDepth}):}\n{reset ${util.inspect(errorToRender.actions, { depth: options.childInspectDepth, colors: true })}}`;
        }
        // Add SfdxFalconError Source and Error Stack.
        renderOutput +=
            chalkTemplate `\n{${options.errorLabelColor} Error Source:}  {${options.valueColor} ${errorToRender.source}}`
                + chalkTemplate `\n{${options.errorLabelColor} Error Stack:} \n{${options.valueColor} ${errorToRender.stack}}`;
        // Add SfdxFalconError Result Stack.
        if (errorToRender.resultStack && (isEmpty(errorToRender.resultStack) === false)) {
            renderOutput += chalkTemplate `\n{${options.errorLabelColor} Result Stack:}\n${errorToRender.resultStack}`;
        }
        // Add SfdxFalconError Detail.
        if (errorToRender.detail && (isEmpty(errorToRender.detail) === false)) {
            renderOutput += chalkTemplate `\n{${options.errorLabelColor} Error Detail:}\n{reset ${util.inspect(errorToRender.detail, { depth: 10, colors: true })}}`;
        }
        // Add SfdxError Data.
        if (errorToRender.data && (isEmpty(errorToRender.data) === false)) {
            renderOutput += chalkTemplate `\n{${options.errorLabelColor} Error Data (Depth ${options.errorInspectDepth}):}\n{reset ${util.inspect(errorToRender.data, { depth: options.errorInspectDepth, colors: true })}}`;
        }
        return renderOutput;
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @method      renderSfdxCliErrorDetail
     * @param       {SfdxCliError}  errorToRender  Required. Any object that is
     *              a child of Error.
     * @param       {SfdxFalconErrorRenderOptions}  options  Required. Rendering
     *              options that determine colors and inspection depth.
     * @returns     {string}
     * @description Generates an extended set of completely formatted output
     *              that is relevant only to SfdxCliError objects.
     * @private @static
     */
    //───────────────────────────────────────────────────────────────────────────┘
    static renderSfdxCliErrorDetail(errorToRender, options) {
        let renderOutput = '';
        if (isEmpty(errorToRender.cliError.command) === false) {
            renderOutput += chalkTemplate `\n{${options.errorLabelColor} CLI Command:}       ${errorToRender.cliError.command}`;
        }
        if (isEmpty(errorToRender.cliError.name) === false) {
            renderOutput += chalkTemplate `\n{${options.errorLabelColor} CLI Error Name:}    ${errorToRender.cliError.name}`;
        }
        if (isEmpty(errorToRender.cliError.message) === false) {
            renderOutput += chalkTemplate `\n{${options.errorLabelColor} CLI Error Message:} ${errorToRender.cliError.message}`;
        }
        if (isEmpty(errorToRender.cliError.status) === false) {
            renderOutput += chalkTemplate `\n{${options.errorLabelColor} CLI Error Status:}  ${errorToRender.cliError.status}`;
        }
        if (isEmpty(errorToRender.cliError.stdout) === false) {
            renderOutput += chalkTemplate `\n{${options.errorLabelColor} CLI Error StdOut:}  ${errorToRender.cliError.stdout}`;
        }
        if (isEmpty(errorToRender.cliError.stderr) === false) {
            renderOutput += chalkTemplate `\n{${options.errorLabelColor} CLI Error StdErr:}  ${errorToRender.cliError.stderr}`;
        }
        // Render any "actions" as straight string output so newlines are respected in the output.
        if (Array.isArray(errorToRender.cliError.actions)) {
            renderOutput += chalkTemplate `\n{${options.errorLabelColor} CLI Error Actions:}`;
            for (const action of errorToRender.cliError.actions) {
                renderOutput += chalkTemplate `\n{green ${action}}`;
            }
        }
        if (isEmpty(errorToRender.cliError.warnings) === false) {
            renderOutput += chalkTemplate `\n{${options.errorLabelColor} CLI Error Warnings:}\n${util.inspect(errorToRender.cliError.warnings, { depth: options.childInspectDepth, colors: true })}`;
        }
        // Only display the CLI Error Stack if Child Inspect Depth is set to 5 or higher.
        if (isEmpty(errorToRender.cliError.stack) === false && options.childInspectDepth >= 5) {
            renderOutput += chalkTemplate `\n{${options.errorLabelColor} CLI Error Stack:}   \n${errorToRender.cliError.stack}`;
        }
        // Only display the CLI Error's "raw result" if the Child Inspect Depth is set to 2 or higher.
        if (isEmpty(errorToRender.cliError.result) === false && options.childInspectDepth >= 2) {
            const cliRawResultDepth = 10;
            renderOutput += chalkTemplate `\n{${options.errorLabelColor} CLI Error Raw Result: (Depth ${cliRawResultDepth})}\n${util.inspect(errorToRender.cliError.result, { depth: cliRawResultDepth, colors: true })}`;
        }
        return renderOutput;
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @method      renderShellErrorDetail
     * @param       {ShellError}  errorToRender  Required. Any object that is
     *              a child of Error.
     * @param       {SfdxFalconErrorRenderOptions}  options  Required. Rendering
     *              options that determine colors and inspection depth.
     * @returns     {string}
     * @description Generates an extended set of completely formatted output
     *              that is relevant only to ShellError objects.
     * @private @static
     */
    //───────────────────────────────────────────────────────────────────────────┘
    static renderShellErrorDetail(errorToRender, options) {
        let renderOutput = '';
        if (isEmpty(errorToRender.shellError.command) === false) {
            renderOutput += chalkTemplate `\n{${options.errorLabelColor} ShellError Command:} ${errorToRender.shellError.command}`;
        }
        if (errorToRender.shellError.code) {
            renderOutput += chalkTemplate `\n{${options.errorLabelColor} ShellError Code:}    ${errorToRender.shellError.code}`;
        }
        if (isEmpty(errorToRender.shellError.signal) === false) {
            renderOutput += chalkTemplate `\n{${options.errorLabelColor} ShellError Signal:}  ${errorToRender.shellError.signal}`;
        }
        if (isEmpty(errorToRender.shellError.message) === false) {
            renderOutput += chalkTemplate `\n{${options.errorLabelColor} ShellError Message:} ${errorToRender.shellError.message}`;
        }
        if (isEmpty(errorToRender.shellError.stderr) === false) {
            renderOutput += chalkTemplate `\n{${options.errorLabelColor} ShellError StdErr:}\n${errorToRender.shellError.stderr}`;
        }
        if (isEmpty(errorToRender.shellError.stdout) === false) {
            renderOutput += chalkTemplate `\n{${options.errorLabelColor} ShellError StdOut:}\n${errorToRender.shellError.stdout}`;
        }
        return renderOutput;
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @method      renderUnknownDetail
     * @param       {unknown} unknownObject  Required. Will be generally rendered.
     * @param       {SfdxFalconErrorRenderOptions}  options  Required. Rendering
     *              options that determine colors and inspection depth.
     * @returns     {string}
     * @description Given an unknown object, will render it in a general way.
     * @private @static
     */
    //───────────────────────────────────────────────────────────────────────────┘
    static renderUnknownDetail(unknownObject, options) {
        const renderOutput = chalkTemplate `\n{${options.errorLabelColor} Error Name:}    {${options.valueColor} UNKNOWN}`
            + chalkTemplate `\n{${options.errorLabelColor} Error Message:} {${options.valueColor} The object provided is not of type 'Error'}`
            + chalkTemplate `\n{${options.errorLabelColor} Error Stack:}   {${options.valueColor} Not Available}`
            + chalkTemplate `\n{${options.errorLabelColor} Raw Object: (Depth ${options.childInspectDepth})}\n${util.inspect(unknownObject, { depth: options.childInspectDepth, colors: true })}`;
        return renderOutput;
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @constructs  SfdxFalconError
     * @param       {string}  message Required. Message for the error.
     * @param       {string}  [name]  Optional. Defaults to SfdxFalconError.
     * @param       {string}  [source]  Optional. Defaults to UNKNOWN.
     * @param       {Error}   [cause] Optional. Error object causing this error.
     * @param       {string[]}  [actions] Optional. Array of action messages.
     * @param       {number}  [exitCode]  Optional. Code passed to the CLI.
     * @description Extension of the SfdxError object. Adds special SFDX-Falcon
     *              specific stack and detail properties.
     * @public
     */
    //───────────────────────────────────────────────────────────────────────────┘
    constructor(message, name, source = 'Unhandled Exception', cause, actions, exitCode) {
        // Set a default for name
        const thisName = name || 'SfdxFalconError';
        // Call the parent constructor
        super(message, thisName, actions || [], exitCode || 1, cause);
        // Initialize member vars
        this.data = {};
        this.source = source;
        this._detail = {};
        this._userInfo = new SfdxFalconErrorInfo();
        this._debugInfo = new SfdxFalconErrorInfo();
        this._devInfo = new SfdxFalconErrorInfo();
        // Copy the Result Stack from any Child (cause) Error.
        if (cause) {
            const causeError = cause;
            this._resultStack = causeError.resultStack || ``;
        }
        else {
            this._resultStack = ``;
        }
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @method      addToStack
     * @param       {string}  stackItem Required. Custom message to add to stack.
     * @returns     {void}
     * @description Given a message string, adds that message to a custom "stack"
     *              that we can use to give a history of the internal actions that
     *              SFDX-Falcon code is taking.
     * @public
     */
    //───────────────────────────────────────────────────────────────────────────┘
    addToStack(stackItem) {
        const indent = `    `;
        if (this._resultStack) {
            this._resultStack = `${indent}${stackItem}\n${this._resultStack}`;
        }
        else {
            this._resultStack = `${indent}${stackItem}`;
        }
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @property    detail
     * @returns     {unknown}
     * @description Gets the current Detail object.
     * @public
     */
    //───────────────────────────────────────────────────────────────────────────┘
    get detail() {
        return this._detail;
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @property    debugInfo
     * @returns     {SfdxFalconErrorInfo}
     * @description Gets the current Debug Information object.
     * @public
     */
    //───────────────────────────────────────────────────────────────────────────┘
    get debugInfo() {
        return this._debugInfo;
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @property    devInfo
     * @returns     {SfdxFalconErrorInfo}
     * @description Gets the current Developer Information object.
     * @public
     */
    //───────────────────────────────────────────────────────────────────────────┘
    get devInfo() {
        return this._devInfo;
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @property    resultStack
     * @returns     {string}
     * @description Gets the current Falcon Result Stack.
     * @public
     */
    //───────────────────────────────────────────────────────────────────────────┘
    get resultStack() {
        return this._resultStack;
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @property    rootCause
     * @returns     {SfdxFalconError}
     * @description Gets the "root" Error objec in the cause chain of this Error.
     * @public
     */
    //───────────────────────────────────────────────────────────────────────────┘
    get rootCause() {
        let rootCause = this;
        while (rootCause.cause && (isEmpty(rootCause.cause) === false)) {
            rootCause = rootCause.cause;
        }
        // No child (cause) Errors left, so we've found the Root Cause.
        return rootCause;
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @property    userInfo
     * @returns     {SfdxFalconErrorInfo}
     * @description Gets the current User Information object.
     * @public
     */
    //───────────────────────────────────────────────────────────────────────────┘
    get userInfo() {
        return this._userInfo;
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @method      setDetail
     * @param       {unknown} detail  Required. Detail to be set to this Error.
     * @returns     {this}  Returns this to allow for chaining.
     * @description Additional detail related to this object, provided in addition
     *              to what might be attached to the SfdxError.data property.
     * @public
     */
    //───────────────────────────────────────────────────────────────────────────┘
    setDetail(detail) {
        this._detail = detail;
        return this;
    }
}
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       SfdxFalconErrorInfo
 * @description Stores detailed error information & messages for display to multiple user personas.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class SfdxFalconErrorInfo {
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @constructs  SfdxFalconErrorInfo
     * @description Stores detailed error information & messages for display to
     *              multiple user personas.
     * @public
     */
    //───────────────────────────────────────────────────────────────────────────┘
    constructor() {
        this.title = 'UNKNOWN ERROR';
        this.message = 'An unknown error has occured';
        this.actions = [];
    }
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @method      addAction
     * @param       {string}  actionItem Required. Action that the user can take
     *              to recover from whatever caused this error.
     * @returns     {void}
     * @description Adds a new string to the "actions" array.
     * @public
     */
    //───────────────────────────────────────────────────────────────────────────┘
    addAction(actionItem = '') {
        this.actions.push(actionItem);
    }
}
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       SfdxCliError
 * @extends     SfdxFalconError
 * @description Extends SfdxFalconError to provide specialized error handling of error results
 *              returned from CLI commands run via shell exec.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class SfdxCliError extends SfdxFalconError {
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @constructs  SfdxCliError
     * @param       {string}  cliCommandString  Required. Command string that
     *              was executed by the CLI.
     * @param       {string}  stdoutBuffer  Required. Contents of stdout from a
     *              failed CLI command. Typically a string containing parseable
     *              JSON, but may be an unparseable string response.
     * @param       {string}  stderrBuffer  Required. Contents of stderr, ideally
     *              unchanged from whatever form it was in after shell execution.
     * @param       {string}  [message] Optional. Sets the SfdxFalconError message.
     * @param       {string}  [source]  Optional. Sets the SfdxFalconError source.
     * @description Given a string (typically the contents of a stderr buffer),
     *              returns an SfdxFalconError object with a specialized
     *              "cliError" object property.
     * @public
     */
    //───────────────────────────────────────────────────────────────────────────┘
    constructor(sfdxCommandString, stdoutBuffer, stderrBuffer, message = 'Unknown CLI Error', source = '') {
        // Initialize the cliError member var and helper vars.
        const cliError = {};
        let actions = new Array();
        // Try to parse cliResponseBuffer into an object, then try to copy over the standard SFDX CLI error details
        try {
            const parsedError = JSON.parse(stdoutBuffer);
            cliError.command = sfdxCommandString || `Command String Not Provided`;
            cliError.stdout = stdoutBuffer || '';
            cliError.stderr = stderrBuffer || '';
            cliError.name = parsedError.name || `UnknownCliError`;
            cliError.message = parsedError.message || `Unknown CLI Error (see 'cliError.result.rawResult' for original CLI response)`;
            cliError.status = (isNaN(parsedError.status)) ? 1 : parsedError.status;
            // Figuring out "actions" is a little complicated because it may be "actions" or "action"
            // (or not even there) in the JSON retured from the CLI. Try to handle all possibilities.
            if (Array.isArray(parsedError.actions)) {
                actions = actions.concat(parsedError.actions);
            }
            if (parsedError.action) {
                actions.push(parsedError.action);
            }
            cliError.actions = actions;
            cliError.warnings = parsedError.warnings || [];
            cliError.stack = parsedError.stack || '';
            // Set the CLI error's "result" from the parsed error, or search for it in the parsedError stack.
            if (parsedError.result) {
                cliError.result = parsedError.result;
            }
            else {
                // Search for a JSON result inside of the parsedError stack.
                const parsedStack = findJson(parsedError.stack);
                if (parsedStack) {
                    parsedError.stack = parsedStack;
                }
                cliError.result = { rawResult: parsedError };
            }
        }
        catch (parsingError) {
            cliError.command = sfdxCommandString || `Command String Not Provided`;
            cliError.stdout = stdoutBuffer || '';
            cliError.stderr = stderrBuffer || '';
            cliError.name = `UnparseableCliError`;
            cliError.message = `Unparseable CLI Error (see 'cliError.result.rawResult' for raw error)`;
            cliError.status = 999;
            cliError.actions = [];
            cliError.warnings = [];
            cliError.stack = `Unparseable CLI Error (see 'cliError.result.rawResult' for raw error)`;
            cliError.result = { rawResult: stdoutBuffer };
        }
        // Call the parent constructor to get our baseline SfdxFalconError object.
        super(`${message}. ${cliError.message}`, 'SfdxCliError', source);
        // Attach the cliError variable to this SfdxCliError object.
        this.cliError = cliError;
        // Pull any "actions" out of the CLI Error and attach them to the SfdxError.actions property.
        if (isEmpty(cliError.actions) === false) {
            this.actions = cliError.actions;
        }
        return;
    }
}
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       ShellError
 * @extends     SfdxFalconError
 * @description Extends SfdxFalconError to provide specialized error handling of error results
 *              returned by failed shell commands which may or may not provide a JSON structure as
 *              part of their error message.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class ShellError extends SfdxFalconError {
    //───────────────────────────────────────────────────────────────────────────┐
    /**
     * @constructs  ShellError
     * @param       {string}  command Required. The shell command whose execution
     *              resulted in this ShellError.
     * @param       {number}  code  Required. Exit code provided by the Shell.
     *              If NULL, then signal must have a value.
     * @param       {string}  signal  Required. Signal which caused the Shell to
     *              terminate. If NULL, then code must have a value.
     * @param       {string}  stdErrBuffer  Required. Contents of stderr when the
     *              shell was terminated.
     * @param       {string}  [stdOutBuffer]  Optional. Contents of stdout when the
     *              shell was terminated.
     * @param       {string}  [source]  Optional. Sets the SfdxFalconError source.
     * @param       {string}  [message] Optional. Message that the caller would
     *              like the user to see. If not provided, will default to the
     *              contents of stderr.
     * @description Returns an SfdxFalconError object with a specialized set of
     *              information in the "shellError" object property.
     * @public
     */
    //───────────────────────────────────────────────────────────────────────────┘
    constructor(command, code, signal, stdErrBuffer, stdOutBuffer = null, source = '', message = '') {
        // Set the message to be either what the caller provided, the first line of stdErrBuffer, or a default message.
        if (!message) {
            if (typeof stdErrBuffer === 'string' && stdErrBuffer) {
                message = stdErrBuffer.substring(0, stdErrBuffer.indexOf('\n'));
            }
            else if (typeof stdOutBuffer === 'string' && stdOutBuffer) {
                message = stdOutBuffer.substring(0, stdOutBuffer.indexOf('\n'));
            }
            else {
                // Set a default "Unknown Shell Error" message.
                message = `Unknown Shell Error (code=${code}, signal=${signal})`;
            }
        }
        // Call the parent constructor to get our baseline Error.
        super(`${message}`, 'ShellError', source);
        // Initialize the shellError member var.
        this.shellError = {};
        // Copy over all of the Shell Error details
        this.shellError.command = command;
        this.shellError.code = code;
        this.shellError.signal = signal;
        this.shellError.stdout = stdOutBuffer;
        this.shellError.stderr = stdErrBuffer;
        this.shellError.message = message;
        // Add a detail line to the Falcon Stack.
        //this.addToStack(`at ${this.shellError.code}: ${this.shellError.message}`);
        return;
    }
}