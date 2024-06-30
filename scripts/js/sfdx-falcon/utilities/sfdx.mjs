//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          sfdx-falcon/utilities/sfdx.mjs
 * @copyright     Vivek M. Chawla - 2023
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Utility functions for working with SFDX projects.
 * @description   Utility functions for working with SFDX projects.
 * @version       1.0.0
 * @license       BSD-3-Clause
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types.
import   * as path                        from 'path';
import { v4 as uuid }                     from "uuid";                            // Generates a timestamp-based UUID.
import { createRequire }                  from 'module';

// Import Internal Modules, Classes, and Functions.
import { SfdxFalconDebug }                from '../debug/index.mjs';
import { SfdxFalconError }                from '../error/index.mjs';
import { isEmptyNullInvalidObject }       from '../validators/type-validator.mjs';
import { throwOnEmptyNullInvalidObject, 
         throwOnEmptyNullInvalidString }  from '../validators/type-validator.mjs';

// Set the File Local Debug Namespace
const dbgNs = 'UTIL:SFDX';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
/**
 * RegEx used to identify Salesforce CLI command strings. Tests `true` if either `sf` or `sfdx` is
 * the first word in a string, regardless of leading whitespace.
 */
export const sfCliCommandRegEx  = /^ *(?:sf |sfdx )/i;
/**
 * RegEx used to identify well-formed Salesforce IDs. Tests `true` for both 15 and 18-character IDs.
 * Note: A successful match does not mean the ID points to something, only that it's well-formed.
 */
export const sfIdPattern = /^[a-zA-Z0-9]{15}(?:[A-Z0-5]{3}$)?$/;
/**
 * Modification of the `sfIdPattern` RegEx. Only tests `true` for well-formed Salesforce IDs that
 * have the `04t` prefix. This is the prefix for Salesforce Package Version IDs.
 */
export const packageVersionIdPattern = /^04t[a-zA-Z0-9]{12}(?:[A-Z0-5]{3}$)?$/;
/**
 * Modification of the `sfIdPattern` RegEx. Only tests `true` for well-formed Salesforce IDs that
 * have the `0Ho` prefix. This is the prefix for Salesforce Package2 IDs.
 */
export const package2IdPattern = /^0Ho[a-zA-Z0-9]{12}(?:[A-Z0-5]{3}$)?$/;



//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       PackageDependency
 * @summary     Represents a single package dependency as defined in `sfdx-project.json`.
 * @description Includes properties for human-readable names and `04t` Package Version IDs.
 * @example
 * ```
 * const pd = new PackageDependency('Apex Utilities', '04tB0000000IB1EIAW');
 * console.log(pd.packageVersionId);
 * ```
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class PackageDependency {
  constructor(name, packageVersionId) {
    this.name = name;
    this.packageVersionId = packageVersionId;
  }
}
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    getPackageDependencies
 * @param       {Object} sfdxProjectJson JSON representation of `sfdx-project.json`
 * @returns     {Array<PackageDependency>}  The ordered list of packages that must be installed
 *                                          in an org before the source in `packageDirectories`
 *                                          can be pushed to an org.
 * @summary     Builds an array of `PackageDependency` objects based on the contents of `sfdx-project.json`.
 * @description Iterates over the `packageDirectories` array in `sfdx-project.json`, inspecting
 *              each `dependencies` array to identify all packages that must be installed in
 *              a scratch org before the source in the `packageDirectories` can be pushed. The 
 *              elements of the returned `Array` are sorted by the required order of packge
 *              installation.
 * @example
 * ```
 * const packageDependencies = getPackageDependencies(sfdxProjectJson);
 * console.log(packageDependencies);
 * ```
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export function getPackageDependencies(sfdxProjectJson) {
  const localDbgNs = `${dbgNs}:getPackageDependencies`;

  throwOnEmptyNullInvalidObject(sfdxProjectJson, `${localDbgNs}`, 'sfdxProjectJson');
  throwOnEmptyNullInvalidObject(sfdxProjectJson.packageDirectories, `${localDbgNs}`, 'sfdxProjectJson.packageDirectories');

  SfdxFalconDebug.obj(`${localDbgNs}:sfdxProjectJson.packageDirectories`, sfdxProjectJson.packageDirectories);

  const packageDependencies = new Array;
  for (const packageDirectory of sfdxProjectJson.packageDirectories) {
    SfdxFalconDebug.obj(`${localDbgNs}:packageDirectory`, packageDirectory);
    if (packageDirectory.dependencies instanceof Array ) {
      for (const dependency of packageDirectory.dependencies) {
        SfdxFalconDebug.obj(`${localDbgNs}:dependency`, dependency);
        if (typeof dependency.package === "string") {
          SfdxFalconDebug.str(`${localDbgNs}:dependency.package`, dependency.package);
          if (isPackageVersionId(dependency.package)) {
            // The value in the "package" key is a "04t" Package Version ID.
            packageDependencies.push(new PackageDependency(`Unnamed Package (${dependency.package})`, dependency.package));
          } else {
            // The value in the "package" key is a package alias.
            // Ensure the alias maps to a "04t" Package Version ID.  If not, 
            // it means the alias most likely points to an "0Ho" Package2 ID.
            const idFromAlias = getIdFromPackageAlias(sfdxProjectJson, dependency.package);
            if (isPackageVersionId(idFromAlias)) {
              packageDependencies.push(new PackageDependency(dependency.package, idFromAlias));
            } else {
              // The alias likely points to an "0Ho" ID.
              // Continue to the next dependency.
              continue;
            }
          }
        }
      }
    }
  }
  SfdxFalconDebug.obj(`${localDbgNs}:packageDependencies`, packageDependencies);
  return packageDependencies;
}
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    getSfdxProjectJson
 * @returns     {object} Contents of `sfdx-project.json`.
 * @summary     Returns the contents of `sfdx-project.json` from the current working directory.
 * 
 * @description If `sfdx-project.json` is not present in the current working directory,
 *              script execution will be terminated with a non-zero exit code.
 * @example
 * ```
 * const sfdxProjectJson = getSfdxProjectJson();
 * ```
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export function getSfdxProjectJson() {
  const localDbgNs = `${dbgNs}:getSfdxProjectJson`;
  const workingDir = process.cwd();
  const sfdxProjectJsonPath = path.join(workingDir, 'sfdx-project.json');
  SfdxFalconDebug.str(`${localDbgNs}:sfdxProjectJsonPath`, sfdxProjectJsonPath);
  try {
    const require = createRequire(import.meta.url);
    return require(sfdxProjectJsonPath);
  } catch (error) {
    SfdxFalconDebug.obj(`${localDbgNs}:error`, error);
    throw new SfdxFalconError(`The current working directory "${workingDir}" does not contain sfdx-project.json.`,
                              `Missing SFDX Project Configuration File`,
                              `${dbgNs}:getSfdxProjectJson`);
  }
}
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    getPackageAliases
 * @param       {Object} sfdxProjectJson JSON representation of `sfdx-project.json`
 * @returns     {Object} The object defined by the `packageAliases` key in `sfdx-project.json`
 *                       or an empty object `{}` if this key is not present.
 * @summary     Gets the object defined by the `packageAliases` key in `sfdx-project.json`.
 * @description Provides a shortcut to the `packageAliases` object defined in the
 *              `sfdx-project.json` file in the directory where the toolbelt was run.
 *              Returns an empty object literal `{}` if the `packageAliases` key 
 *              is not defined in `sfdx-projec.json`.
 * @example
 * ```
 * const packageAliases = getPackageAliases();
 * console.log(packageAliases["My Package@2.4.0.1"]);
 * ```
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export function getPackageAliases(sfdxProjectJson) {
  // Ensure a `packageAliases` key was defined in `sfdx-project.json`.
  if (typeof sfdxProjectJson !== 'undefined' && typeof sfdxProjectJson.packageAliases === 'object' && sfdxProjectJson.packageAliases !== null && !Array.isArray(sfdxProjectJson.packageAliases)) {
    return sfdxProjectJson.packageAliases;
  } else {
    // The `packageAliases` key was not defined in `sfdx-project.json`. Return an empty
    // object literal `{}` so later calls won't get stopped by an `undefined` value.
    return {};
  }
}
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    getIdFromPackageAlias
 * @param       {Object}  sfdxProjectJson JSON representation of `sfdx-project.json`
 * @param       {String}  packageAlias A key within `packageAliases` inside `sfdx-project.json`.
 * @returns     {String}  The well-formed Salesforce ID matching the provided alias.
 * @throws      {SfdxFalconError} If the provided alias does not point to a well-formed Salesforce ID.
 * @summary     Gets the well-formed Salesforce ID matching the specified alias.
 * @description Attempts to match the provided alias with a key on the `packageAliases`
 *              object and return a well-formed Salesforce ID. This ID should only ever be a `04t` 
 *              Package Version ID or a `0Ho` Package2 ID. Throws an error if a match can't be found
 *              or the value returned by the alias is not a well-formed Salesforce ID.
 * @example
 * ```
 * const salesforceId = getIdFromPackageAlias("My Package@2.4.0.1");
 * console.log(salesforceId);
 * ```
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export function getIdFromPackageAlias(sfdxProjectJson, packageAlias) {
  // Set local debug namespace.
  const localDbgNs = `${dbgNs}:getIdFromPackageAlias`;

  // Validate and debug arguments.
  throwOnEmptyNullInvalidObject(sfdxProjectJson, `${localDbgNs}`, 'sfdxProjectJson');
  throwOnEmptyNullInvalidString(packageAlias,    `${localDbgNs}`, 'packageAlias');
  SfdxFalconDebug.obj(`${localDbgNs}:sfdxProjectJson`, sfdxProjectJson);
  SfdxFalconDebug.str(`${localDbgNs}:packageAlias`, packageAlias);

  // Get package aliases from sfdx-project.json.
  const packageAliases = getPackageAliases(sfdxProjectJson);
  SfdxFalconDebug.obj(`${localDbgNs}:packageAliases`, packageAliases);

  // Ensure `packageAliases` exist.
  if (isEmptyNullInvalidObject(packageAliases)) {
    throw new SfdxFalconError(`There are no package aliases defined in sfdx-project.json.`);
  }
  // Ensure the specified alias was defined.
  if ((`${packageAlias}` in packageAliases) !== true) {
    throw new SfdxFalconError(`Package alias "${packageAlias}" is not defined in sfdx-project.json.`);
  }
  // Get the value from the specified key.
  const id = packageAliases[packageAlias];

  // Ensure the value is a well-formed Salesforce ID.
  if (isSalesforceId(id)) {
    return id;
  } 
  else {
    throw new Error(`Package alias "${packageAlias}" points to a value that is not a well-formed Salesforce ID.`);
  }
}
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    getSfdxProjectName
 * @param       {Object}  sfdxProjectJson JSON representation of `sfdx-project.json`
 * @returns     {string}  Name of the SFDX project or a placeholder if the name is `undefined`.
 * @summary     Gets the SFDX project name defined by `sfdx-project.json` in the current directory.
 * @description If `sfdx-project.json` has an empty string or `undefined` value in the `name` key,
 *              create a placeholder project name. All non-alphanumeric characters in the name will
 *              be replaced with hyphens. Groups of consecutive non-alphanumeric characters are
 *              replaced with a single `-` character.
 * @example
 * ```
 * const sfdxProjectName = getSfdxProjectName(sfdxProjectJson);
 * console.log(sfdxProjectName);
 * ```
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export function getSfdxProjectName(sfdxProjectJson) {
  // Set local debug namespace.
  const localDbgNs = `${dbgNs}:getSfdxProjectName`;

  // Validate and debug arguments.
  throwOnEmptyNullInvalidObject(sfdxProjectJson, `${localDbgNs}`, 'sfdxProjectJson');
  SfdxFalconDebug.obj(`${localDbgNs}:sfdxProjectJson`, sfdxProjectJson);

  // Determine project name.
  let sfdxProjectName = '';
  if (typeof sfdxProjectJson.name !== 'string' || sfdxProjectJson.name === '') {
    sfdxProjectName = "packaging-project";
  } else {
    sfdxProjectName = sfdxProjectJson.name.trim().replace(/[\W_]+/g,'-');
  }
  // Return project name.
  SfdxFalconDebug.str(`${localDbgNs}:sfdxProjectName`, sfdxProjectName);
  return sfdxProjectName;
}
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isPackage2Id
 * @param       {String} stringToTest The string to test as a `0Ho` Package2 ID.
 * @returns     {Boolean} True if `stringToTest` is a well-formed `0Ho` Package2 ID.
 * @summary     Checks if the specified string is a `0Ho` Package2 ID.
 * @description Tests the specified `String` and returns `true` ONLY if it's a well-formed
 *              `0Ho` Package2 ID. 
 * @example
 * ```
 * console.log(isPackageVersionId("0Ho8X000000oLktSAE")); // Returns TRUE
 * console.log(isPackageVersionId("04tB0000000IB1EIAW")); // Returns FALSE
 * console.log(isPackageVersionId("0HoB0000000IB1E"));    // Returns TRUE
 * console.log(isPackageVersionId("xxxxxxxxx"));          // Returns FALSE 
 * ```
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isPackage2Id(stringToTest) {
  const localDbgNs = `${dbgNs}:isPackage2Id`;
  SfdxFalconDebug.str(`${localDbgNs}:stringToTest`, stringToTest);
  return package2IdPattern.test(stringToTest);
}
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isPackageVersionId
 * @param       {String} stringToTest The string to test as a `04t` Package Version ID.
 * @returns     {Boolean} True if `stringToTest` is a well-formed `04t` Package Version ID.
 * @summary     Checks if the specified string is a `04t` Package Version ID.
 * @description Tests the specified `String` and returns `true` ONLY if it's a well-formed
 *              `04t` Package Version ID. 
 * @example
 * ```
 * console.log(isPackageVersionId("04tB0000000IB1EIAW")); // Returns TRUE
 * console.log(isPackageVersionId("04tB0000000IB1E"));    // Returns TRUE
 * console.log(isPackageVersionId("0Ho8X000000oLktSAE")); // Returns FALSE
 * console.log(isPackageVersionId("xxxxxxxxx"));          // Returns FALSE 
 * ```
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isPackageVersionId(stringToTest) {
  const localDbgNs = `${dbgNs}:isPackageVersionId`;
  SfdxFalconDebug.str(`${localDbgNs}:stringToTest`, stringToTest);
  return packageVersionIdPattern.test(stringToTest);
}
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isSalesforceId
 * @param       {String} stringToTest The string to test as a well-formed Salesforce ID.
 * @returns     {Boolean} True if `stringToTest` is a well-formed Salesforce ID.
 * @summary     Checks if the specified string is a well-formed Salesforce ID.
 * @description Tests the specified `String` and returns `true` if it's a well-formed
 *              Salesforce ID. Works with both 15 and 18 character IDs.
 * @example
 * ```
 * console.log(isSalesforceId("04tB0000000IB1EIAW")); // Returns TRUE
 * console.log(isSalesforceId("04tB0000000IB1E"));    // Returns TRUE
 * console.log(isSalesforceId("0Ho8X000000oLktSAE")); // Returns TRUE
 * console.log(isSalesforceId("00Dxxxxxxxxx"));       // Returns FALSE 
 * ```
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isSalesforceId(stringToTest) {
  const localDbgNs = `${dbgNs}:isSalesforceId`;
  SfdxFalconDebug.str(`${localDbgNs}:stringToTest`, stringToTest);
  return sfIdPattern.test(stringToTest);
}
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isSfCliCommandString
 * @param       {String} stringToTest The string to test as a Salesforce CLI command string.
 * @returns     {Boolean} True if `stringToTest` begins with the word `sf` or `sfdx`.
 * @summary     Checks if the specified string is a Salesforce CLI command string.
 * @description Tests the specified `String` and returns `true` if the first word of the string,
 *              regardless of leading whitespace, is `sf` or `sfdx`.
 * @example
 * ```
 * console.log(isSfCliCommandString("sf org create scratch -d -a MyScratchOrg ")); // Returns TRUE
 * console.log(isSfCliCommandString(" sfdx force:org:create -d -a MyScratchOrg")); // Returns TRUE
 * console.log(isSfCliCommandString("cat sfdx-project.json"));                     // Returns FALSE
 * console.log(isSfCliCommandString("which sf"));                                  // Returns FALSE
 * ```
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isSfCliCommandString(stringToTest) {
  const localDbgNs = `${dbgNs}:isSfCliCommandString`;
  SfdxFalconDebug.str(`${localDbgNs}:stringToTest`, stringToTest);
  return sfCliCommandRegEx.test(stringToTest);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    createUniqueUsername
 * @param       {string}  baseUsername  The starting point for the username.  It should already be
 *                                      in the form of an email, eg 'name@domain.org'.
 * @returns     {string}  Returns the baseUsername with a pseudo-uuid appended to the end.
 * @description Given a base username to start with (eg. 'name@domain.org'), returns what should be
 *              a globally unique username with a pseudo-uuid appended the end of the username base.
 * @version     1.0.0
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function createUniqueUsername(baseUsername) {
  const usernameMaxLength = 35;
  if (typeof baseUsername === 'undefined')
      throw new SfdxFalconError(`Function createUniqueUsername() expects a value for baseUsername but got undefined`, `InvalidArgument`);
  if (baseUsername.length > usernameMaxLength)
      throw new SfdxFalconError(`Username can not be longer than ${usernameMaxLength} chars to keep room for appending a UUID`, `InvalidUsername`);
  return baseUsername + uuid();
}