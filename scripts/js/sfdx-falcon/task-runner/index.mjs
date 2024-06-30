//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          sfdx-falcon/task-runner/index.mjs
 * @copyright     Vivek M. Chawla - 2023
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       A facade for `Listr` to simplify multi-step task execution in SFDX projects.
 * @description   Makes it easier for developers to build multi-step task runners for their SFDX
 *                projets.  Part of the SFDX-Falcon Toolkit.
 * @version       1.0.0
 * @license       BSD-3-Clause
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
import { $, chalk, path }                 from "zx";
import { Listr }                          from "listr2";
import { SfdxTask }                       from "./sfdx-task.mjs";
import { SfdxFalconError }                from "../error/index.mjs";
import { SfdxFalconDebug }                from "../debug/index.mjs";
import { throwOnEmptyNullInvalidObject,
         throwOnEmptyNullInvalidString }  from "../validators/type-validator.mjs";

// Set the File Local Debug Namespace
const dbgNs = 'TaskRunner';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
//─────────────────────────────────────────────────────────────────────────────────────────────────┘

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       TaskRunner
 * @description Defines a CLI task.
 * @public
 * @example
 * ```
 * const tr = new TaskRunner(optionsObject);
 * ```
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class TaskRunner {
  /**
   * @static
   * @type    {TaskRunner}
   * @summary Singleton instance of `TaskRunner` in the current process space.
   */
  static trInstance = null;
  /**
   * @static
   * @type        {function}
   * @summary     Instance of ZX, the shell command execution module.
   */
  static zx = null;
  /**
   * @type        {Object}
   * @summary     Context object provided to `Listr`. 
   * @description Allows a shared context to be maintained across `Listr` tasks
   *              as they are executed.
   */
  ctx = null;
  /**
   * @type        {Object}
   * @summary     Options provided to the main `Listr` instance.
   */
  options = null;
  /**
   * @type        {Listr}
   * @summary     The `Listr` object that will execute tasks added to `TaskRunner`.
   */
  tasks = null;
  /**
   * @type        {Boolean}
   * @summary     Indicates whether the `Listr` object is currently running tasks.
   */
  isRunning = null;


  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructor
   * @param       {Object} options  Optional. Object containing options that
   *              will be passed to the Listr constructor.
   * @returns     {TaskRunner}
   * @description Instantiates a `TaskRunner` object which contains a Listr
   *              object and additional specialized code for running tasks 
   *              specifically tied to the Salesforce CLI.
   * @public
   * @example
   * ```
   * const tr = new TaskRunner(optionsObject);
   * ```
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(options) {
    // Throw an error if an instance already exists
    if (TaskRunner.trInstance !== null) {
      throw new SfdxFalconError(`An instance of TaskRunner already exists. Use TaskRunner.getInstance() instead of new TaskRunner().`,
                                `TaskRunner Error`);
    }
    // Initialize a Listr Context object.
    this.ctx = {commandStrings:[]};
    // Set default options.
    this.options = options ?? { concurrent:false, exitOnError:true, collectErrors: 'minimal', forceColor:true, forceTTY:true };
    // Add the member Context variable to the options.
    this.options = {...this.options, ...{ctx:this.ctx}};
    // Instantiate a empty Listr object.
    this.tasks = new Listr([], this.options);
    // Initialize isRunning.
    this.isRunning = false;
    // Set the trInstance static variable.
    TaskRunner.trInstance = this;
  }
  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      TaskRunner.getInstance
   * @returns     {TaskRunner}  A singleton instance of `TaskRunner`.
   * @description Factory method for getting a singleton instance of `TaskRunner`.
   * @public @static
   * @example
   * ```
   * const tr = TaskRunner.getInstance();
   * ```
   */
  //───────────────────────────────────────────────────────────────────────────┘
  static getInstance() {
    if (TaskRunner.trInstance === null) {
      return new TaskRunner();
    }
    return TaskRunner.trInstance;
  }
  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      addTask
   * @param       {Object} taskToAdd  Required. Can be a 
   * @returns     {TaskRunner}
   * @description Instantiates a `TaskRunner` object which contains a Listr
   *              object and additional specialized code for running tasks.
   * @public
   * @example
   * ```
   * const tr = TaskRunner.getInstance();
   * tr.addTask(new CliTask(
   *   `Delete scratch org`,
   *   `sf org delete scratch -p -o ScratchOrgAlias`
   *   {suppressErrors: true}
   * ));
   * ```
   */
  //───────────────────────────────────────────────────────────────────────────┘
  addTask(taskToAdd) {
    const localDbgNs = `${dbgNs}:addTask`;
    throwOnEmptyNullInvalidObject(taskToAdd, `${localDbgNs}`, taskToAdd, true);
    SfdxFalconDebug.obj(`${localDbgNs}:taskToAdd`, taskToAdd);

    // Add SFDX Task to Listr.
    if (taskToAdd instanceof SfdxTask) {
      SfdxFalconDebug.str(`${localDbgNs}:commandString`, taskToAdd.commandString, `Found an SfdxTask with Command String:\n`);

      // Keep a record of command strings for debug purposes.
      if (this.ctx?.commandStrings && Array.isArray(this.ctx.commandStrings)) {
        this.ctx.commandStrings.push(taskToAdd.commandString);
      } else {
        this.ctx.commandStrings = new Array().push(taskToAdd.commandString);
      }
      // Add the embedded Listr task to Listr's task list.
      this.tasks.add([taskToAdd.lisrTask]);
      return taskToAdd.lisrTask;
    }

    // Add CLI Task to Listr.
    /*
    if (taskToAdd instanceof CliTask) {
      SfdxFalconDebug.str(`${localDbgNs}:commandString`, taskToAdd.commandString, `Found a CliTask with Command String:\n`);

      //TODO: Add implementation.

      // Add the embedded Listr task to Listr's task list.
      this.tasks.add([taskToAdd.lisrTask]);
      return taskToAdd.lisrTask;
    }
    //*/

    // Add task directly to Listr
    try {
      SfdxFalconDebug.msg(`${localDbgNs}`, `taskToAdd was neither an SfdxTask or a CliTask.\nAttempting to add directly to Listr.`);
      this.tasks.add(taskToAdd);
      return taskToAdd;
    } catch (listrError) {
      SfdxFalconDebug.obj(`${localDbgNs}:listrError`, listrError, `Caught error trying to add a task directly to Listr.`);
      throw new SfdxFalconError(`Caught error while adding raw task to Listr.`,
                                `SFDX TaskRunner Error`,
                                `${localDbgNs}`,
                                listrError);
    }
  }
  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      runTasks
   * @returns     {TaskRunner}
   * @description Instantiates a `TaskRunner` object which contains a Listr
   *              object and additional specialized code for running tasks.
   * @public
   * @example
   * ```
   * const tr = TaskRunner.getInstance();
   * tr.addTask(someTask);
   * await tr.runTasks();
   * ```
   */
  //───────────────────────────────────────────────────────────────────────────┘
  async runTasks() {
    const localDbgNs = `${dbgNs}:runTasks`;
    try {
      return await this.tasks.run();
    } catch (runError) {
      SfdxFalconDebug.obj(`${localDbgNs}:runError`, runError, `Error thrown by the Listr task engine runtime:`);
      throw new SfdxFalconError(`Error thrown at runtime by a Listr task.`,
                                `TaskRunner Runtime Error`,
                                `${localDbgNs}`,
                                runError);
    }
  }
}
