//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          sfdx-falcon/utilities/general.mjs
 * @copyright     Vivek M. Chawla - 2018
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       SFDX-Falcon Utility Module
 * @description   Exports functions that provide common, helpful utility logic.
 * @version       1.0.0
 * @license       BSD-3-Clause
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types.

// Import Internal Modules, Classes, and Functions.
import { SfdxFalconDebug }  from "../debug/index.mjs";              // Internal debug module.

// Set the File Local Debug Namespace
const dbgNs = 'UTILITY:general';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);

//TODO: Consider deleting this file if no general utilities are added.