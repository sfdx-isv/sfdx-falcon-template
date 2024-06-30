//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          sfdx-falcon/task-runner/sfdx-task.mjs
 * @copyright     Vivek M. Chawla - 2023
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Wraps a `Listr` task with helpful tools to work with Salesforce CLI commands.
 * @description   Makes it easier to work with `Listr` tasks when automating Salesforce CLI commands.
 * @version       1.0.0
 * @license       BSD-3-Clause
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries & Modules
import { $, chalk }                       from "zx";
import { isEmpty }                        from "lodash-es";

// Import Internal Classes & Functions
import { SfdxFalconError }                from "../error/index.mjs";
import { SfdxFalconDebug }                from "../debug/index.mjs";
import { throwOnNullInvalidObject, 
         throwOnEmptyNullInvalidString, 
         throwOnEmptyNullInvalidObject,
         throwOnInvalidFunction}          from "../validators/type-validator.mjs";
import { isSfCliCommandString }           from "../utilities/sfdx.mjs";
import { stdioToJson }                    from "../utilities/json.mjs";

// Set the File Local Debug Namespace
const dbgNs = 'TaskRunner:SfdxTask';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
//─────────────────────────────────────────────────────────────────────────────────────────────────┘


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       SfdxTask
 * @description Defines a CLI task that specifically uses the `sf` or `sfdx` base command.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class SfdxTask {
  /**
   * @type      {String}
   * @summary   Title of the SfdxTask. Appears in the `Listr` task list while tasks are running.
   */
  title = null;
  /**
   * @type      {String}
   * @summary   The `sf` or `sfdx` command that will be executed when this task is run.
   */
  commandString = null;
  /**
   * @type      {Object}
   * @summary   Options object for this `SfdxTask`. Not directly transferrable to `Listr` options.
   */
  options = null;
  /**
   * @type        {function}
   * @summary     Async handler function that's executed upon successful command execution.
   * @description The specified handler function should take three arguments.
   *              1. `processPromise` for the result returned by `ZX` when the command was run.
   *              2. `ctx` for the `Listr` context object.
   *              3. `task` for the `Listr` task that contained the command. 
   * @example
   * ```
   * this.onSuccess = async (processPromise, ctx, task) => {
   *   // Implementation
   * }
   * ```
   */
  onSuccess = null;
  /**
   * @type        {function}
   * @summary     Async handler function that's executed upon unsuccessful command execution.
   * @description The specified handler function should take three arguments.
   *              1. `processError` for the result returned by `ZX` when the command failed.
   *              2. `ctx` for the `Listr` context object.
   *              3. `task` for the `Listr` task that contained the command. 
   * @example
   * ```
   * this.onError = async (processError, ctx, task) => {
   *   // Implementation
   * }
   * ```
   */
  onError = null;
  /**
   * @type        {boolean}
   * @summary     Prevents a caught CLI error from being re-thrown to the `Listr` task engine.
   * @description Stops any errors caught from the CLI command execution from being re-thrown to
   *              the `Listr` task engine. Does not stop execution of the `onError` handler
   *              function (if defined). 
   */
  suppressErrors = null;
  /**
   * @type        {boolean}
   * @summary     Renders `stderr` and `stdout` before throwing to the `Listr` task engine.
   * @description If `suppressErrors` is `true`, renders the output from `stderr` and `stdout` 
   *              immediately following execution of the `onError` handler function (if defined),
   *              and right before throwing to the `Listr` task engine. 
   */
  renderStdioOnError = null;
  /**
   * @type        {boolean}
   * @summary     Indicates the `Listr` task engine should run this task concurrently with other
   *              tasks marked as concurrent.
   */
  concurrent = null;
  /**
   * @summary     A `Listr` task constructed using the values passed to the `constructor`.
   */
  lisrTask = null;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructor
   * @param       {String} title      Required. The text that will appear in
   *                                  the task list while the tasks are running.
   * @param       {String} commandString  Required. The `sf` or `sfdx` command
   *                                      that will be executed via ZX.
   * @param       {Object} [options]  Optional. Object containing options for 
   *                                  this task. Not directly trasnsferrable to
   *                                  `Listr` task options.
   * @returns     {SfdxTask}
   * @description Instantiates an `SfdxTask` object which wraps a `Listr` task
   *              object and adds specialized logic for processing the results
   *              from `sf` and `sfdx` CLI commands.
   * @public
   * @example
   * ```
   * const sfdxTask = new SfdxTask(
   *   `Delete existing scratch org`,
   *   `sf org delete scratch -p -o ${devOrgAlias}`,
   *   {suppressErrors: false}
   * );
   * ```
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(title, commandString, options={}) {
    // Set local debug namespace.
    const localDbgNs = `${dbgNs}:constructor`;

    // Debug arguments.
    SfdxFalconDebug.msg(`${localDbgNs}`, `Arguments Upon Entering the Constructor`);
    SfdxFalconDebug.str(`${localDbgNs}:title`, title);
    SfdxFalconDebug.str(`${localDbgNs}:commandString`, commandString);
    SfdxFalconDebug.obj(`${localDbgNs}:options`, options);

    // Validate arguments.
    throwOnEmptyNullInvalidString(title,          `${localDbgNs}`, 'title');
    throwOnEmptyNullInvalidString(commandString,  `${localDbgNs}`, 'commandString');
    throwOnNullInvalidObject     (options,        `${localDbgNs}`, 'options', true);
    if (options.onSuccess) throwOnInvalidFunction(options.onSuccess,  `${localDbgNs}`, 'options.onSuccess');
    if (options.onError)   throwOnInvalidFunction(options.onError,    `${localDbgNs}`, 'options.onError');
    if (isSfCliCommandString(commandString) !== true) {
      throw new SfdxFalconError(`Invalid Command String: |-->${commandString}<--|   SfdxTask objects can only be constructed with 'sf' or 'sfdx' command strings. For other commands, please construct a CliTask object.`,
                                `Invalid SFDX Command String`,
                                `${localDbgNs}`);
    }

    // Initialze member variables.
    this.title                = title;
    this.commandString        = commandString.trim() + ' --json'; // Always request JSON output
    this.options              = {...{
                                  suppressErrors: false,
                                  renderStdioOnError: false,
                                  concurrent: false,
                                  onSuccess: null,
                                  onError: null
                                },
                                ...options};
    this.onSuccess            = this.options.onSuccess;
    this.onError              = this.options.onError;
    this.suppressErrors       = this.options.suppressErrors ? true : false;       // Ensure "truthy" values become TRUE.
    this.renderStdioOnError   = this.options.renderStdioOnError ? true : false;   // Ensure "truthy" values become TRUE.
    this.concurrent           = this.options.concurrent ? true : false;           // Ensure "truthy" values become TRUE.
    this.lisrTask             = buildListrTask(this);

    // Debug member variables.
    SfdxFalconDebug.msg(`${localDbgNs}`, `Instance Members After Initialization`);
    SfdxFalconDebug.str(`${localDbgNs}:this.title`,           this.title);
    SfdxFalconDebug.str(`${localDbgNs}:this.commandString`,   this.commandString);
    SfdxFalconDebug.obj(`${localDbgNs}:this.options`,         this.options);
    SfdxFalconDebug.obj(`${localDbgNs}:this.onSuccess`,       this.onSuccess);
    SfdxFalconDebug.obj(`${localDbgNs}:this.onError`,         this.onError);
    SfdxFalconDebug.obj(`${localDbgNs}:this.suppressErrors`,  this.suppressErrors);
    SfdxFalconDebug.obj(`${localDbgNs}:this.lisrTask`,        this.lisrTask);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    buildListrTask
 * @param       {SfdxTask} sfdxTask   Required. The SfdxTask used to build a `Listr` task.
 * @returns     {ListrTask}           A fully-formed `Listr` task object.
 * @summary     Takes an `SfdxTask` and builds a `Listr` task from it.
 * @description Creates a single `Listr` task using the information from a an `SfdxTask` object.
 * @private
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
function buildListrTask(sfdxTask) {
  // Set local debug namespace.
  const localDbgNs = `${dbgNs}:buildListrTask`;

  // Validate and debug arguments.
  throwOnEmptyNullInvalidObject(sfdxTask, `${localDbgNs}:sfdxTask`, sfdxTask, true);
  SfdxFalconDebug.obj(`${localDbgNs}:sfdxTask`, sfdxTask);

  // Define the Listr task.
  const newListrTask = {
    title:        sfdxTask.title,
    concurrent:   sfdxTask.concurrent,
    task: async (ctx, task) => { 
      SfdxFalconDebug.str(`ASYNC:${localDbgNs}`, sfdxTask.commandString, `About to Execute SFDX Command String:\n`);

      // Use ZX to execute the Salesfoce CLI command.
      try {
        const processPromise = await $`${sfdxTask.commandString}`;

        // Convert any JSON found in stdout/stderr buffers to actual objects.
        processPromise.stderrJson = stdioToJson(processPromise.stderr);
        processPromise.stdoutJson = stdioToJson(processPromise.stdout);

        // Debug.
        SfdxFalconDebug.msg(`ASYNC:${localDbgNs}`, `Salesforce CLI Command Execution Success`);
        SfdxFalconDebug.obj(`ASYNC:${localDbgNs}`, processPromise, `processPromise:`);
        SfdxFalconDebug.obj(`ASYNC:${localDbgNs}`, processPromise.stdoutJson, `STDOUT_JSON:`);
        SfdxFalconDebug.obj(`ASYNC:${localDbgNs}`, processPromise.stderrJson, `STDERR_JSON:`);
        SfdxFalconDebug.str(`ASYNC:${localDbgNs}`, processPromise.stdout, `STDOUT:`);
        SfdxFalconDebug.str(`ASYNC:${localDbgNs}`, processPromise.stderr, `STDERR:`);

        // Call success handler, if present.
        if (typeof sfdxTask.onSuccess === 'function') {
          await sfdxTask.onSuccess(processPromise, ctx, task);
        }
      } catch (processError) {
        SfdxFalconDebug.msg(`ASYNC:${localDbgNs}`, `Salesforce CLI Command Execution Failure`);
        SfdxFalconDebug.obj(`ASYNC:${localDbgNs}`, processError, `processError:`);
        // Call error handler, if present.
        if (typeof sfdxTask.onError === 'function') {
          await sfdxTask.onError(processError, ctx, task);
        }  
        // Throw error if errors are not suppressed for this task.
        if (sfdxTask.suppressErrors === false) {
          // Convert any JSON found in stdout/stderr buffers to actual objects.
          processError.stderrJson = stdioToJson(processError.stderr);
          processError.stdoutJson = stdioToJson(processError.stdout);

          // Optionally render STDERR and STDOUT.
          if (sfdxTask.renderStdioOnError === true) {
            SfdxFalconDebug.debugMessage(`SfdxTask:ERROR`,    chalk.red(`Salesforce CLI command terminated with errors (Exit Code=${processError.exitCode}).`) +
                                                              `\nThe command and the contents of STDERR and STDOUT are rendered below.`);
            SfdxFalconDebug.debugString(`SfdxTask:COMMAND`,   sfdxTask.commandString);
            if (isEmpty(processError.stderrJson)) {
              SfdxFalconDebug.debugString(`SfdxTask:STDERR`,  processError.stderr);
            } else {
              SfdxFalconDebug.debugObject(`SfdxTask:STDERR`,  processError.stderrJson);
            }
            if (isEmpty(processError.stdoutJson)) {
              SfdxFalconDebug.debugString(`SfdxTask:STDOUT`,  processError.stdout);
            } else {
              SfdxFalconDebug.debugObject(`SfdxTask:STDOUT`,  processError.stdoutJson);
            }
          }

          // Debug.
          SfdxFalconDebug.msg(`ASYNC:${localDbgNs}`, `Errors are not suppressed for this SfdxTask`);
          SfdxFalconDebug.str(`ASYNC:${localDbgNs}`, `CommandString:\n${sfdxTask.commandString}`);
          SfdxFalconDebug.obj(`ASYNC:${localDbgNs}`, processError.stderr, `STDERR:`);
          SfdxFalconDebug.obj(`ASYNC:${localDbgNs}`, processError.stdout, `STDOUT:`);
          SfdxFalconDebug.obj(`ASYNC:${localDbgNs}`, processError.stderrJson, `STDERR_JSON:`);
          SfdxFalconDebug.obj(`ASYNC:${localDbgNs}`, processError.stdoutJson, `STDOUT_JSON:`);

          throw new SfdxFalconError(`Salesforce CLI command execution failed.`,
                                    `SFDX CLI Command Failed`,
                                    `${localDbgNs}`,
                                    processError);
        }
      }
    }
  }
  SfdxFalconDebug.obj(`${localDbgNs}:newListrTask`, newListrTask);
  return newListrTask;
}