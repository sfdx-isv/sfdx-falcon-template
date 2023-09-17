//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          sfdx-falcon/build-dev-env.mjs
 * @copyright     Vivek M. Chawla - 2023
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Implements a series of CLI commands that build the DEV environment for this project.
 * @description   When an SFDX Toolbelt users seclect the option to build a DEV environment, the 
 *                `buildDevEnv()` function is called to perform the teardown/setup actions.
 * @version       1.0.0
 * @license       BSD-3-Clause
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries & Modules

// Import Internal Classes & Functions
import { devOrgAlias, 
         devOrgConfigFile, 
         packageDependencies }  from './toolbelt.mjs';
import { TaskRunner }           from './sfdx-falcon/task-runner/index.mjs';
import { SfdxTask }             from './sfdx-falcon/task-runner/sfdx-task.mjs';
import { SfdxFalconError }      from './sfdx-falcon/error/index.mjs';
import { SfdxFalconDebug }      from './sfdx-falcon/debug/index.mjs';

// Set the File Local Debug Namespace
const dbgNs = 'BuildDevEnv';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
//─────────────────────────────────────────────────────────────────────────────────────────────────┘

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    buildDevEnv
 * @returns     {Promise<void>} 
 * @summary     Builds a scratch org-based development environment.
 * @description Executes multiple Salesforce CLI commands which typically include deleting the 
 *              previous dev scratch org, creating a new scratch org, installing package
 *              dependencies, pushing source, loading test data, and performing any other post
 *              deploy/install configuration changes required by developers.
 * @public
 * @example
 * ```
 * await buildDevEnv();
 * ```
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function buildDevEnv() {

  const ctx = {};
  const tr  = TaskRunner.getInstance();
  tr.ctx    = ctx;

  //*
  // STEP ONE: Delete the existing scratch org (if present).
  tr.addTask(new SfdxTask(
    `Delete existing scratch org`,
    `sf org delete scratch -p -o ${devOrgAlias}`,
    {suppressErrors: true}
  ));
  //*/
  //*
  // STEP TWO: Create a new scratch org.
  tr.addTask(new SfdxTask(
    `Create new scratch org`,
    `sf org create scratch -d -a ${devOrgAlias} -f config/${devOrgConfigFile}`,
    {suppressErrors: false, renderStdioOnError: true}
  ));
  //*/
  /*
  // STEP THREE: Install package dependendencies in the new scratch org.
  //*/
    // TODO: Add implementation
  //*
  // STEP FOUR: Push project source to the new scratch org.
  tr.addTask(new SfdxTask(
    `Deploy project source to the new scratch org`,
    `sf project deploy start`,
    {suppressErrors: false, renderStdioOnError: true}
  ));
  //*/
  // STEP FIVE: Assign "All Access" permission sets to the Dev/Test admin user.
  tr.addTask(new SfdxTask(
    `Assign "All Access" permission sets to the Dev/Test admin user`,
    `sf org assign permset -n All_Access_DEV_TEST`,
    {suppressErrors: false, renderStdioOnError: true}
  ));
  //*/
  //*
  // STEP SIX: Run data generation scripts in the new scratch org.
  tr.addTask(new SfdxTask(
    `Generate dev/test data in the new scratch org`,
    `sf apex run -f scripts/apex/create-test-data.apex`,
    {suppressErrors: true}
  ));
  //*/
  //*
  // STEP SEVEN: Open the new scratch org in Firefox.
  tr.addTask(new SfdxTask(
    `Open the new scratch org in Firefox`,
    `sf org open -b firefox`,
    {suppressErrors: true}
  ));
  //*/

  // Run the tasks.
  try {
    return tr.runTasks();
  } catch (ListrRuntimeError) {
    console.error(SfdxFalconError.renderError(ListrRuntimeError));
  }
}