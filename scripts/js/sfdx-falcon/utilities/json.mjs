//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          sfdx-falcon/utilities/json.mjs
 * @copyright     Vivek M. Chawla - 2023
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       SFDX-Falcon Utility Module
 * @description   Exports functions that provide common, helpful utility logic.
 * @version       1.0.0
 * @license       BSD-3-Clause
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries & Modules
import   stripAnsi          from 'strip-ansi';

// Import Internal Modules, Classes, and Functions.
import * as tv              from '../validators/type-validator.mjs' // Library of SFDX Helper functions specific to SFDX-Falcon.
import { SfdxFalconDebug }  from '../debug/index.mjs';              // Internal debug module.

// Set the File Local Debug Namespace
const dbgNs = 'UTILITY:json';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);
//─────────────────────────────────────────────────────────────────────────────────────────────────┐
//─────────────────────────────────────────────────────────────────────────────────────────────────┘

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    findJson
 * @param       {string} contentToSearch  Required. A string buffer that may contain JSON.
 * @returns     {JsonMap}  A parsed JavaScript object found in the string buffer, or NULL.
 * @description Given any string buffer, search that buffer to find a single JSON object. If
 *              a parseable object is found, it is returned as an object. Otherwise returns NULL.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function findJson(contentToSearch) {
  SfdxFalconDebug.str(`${dbgNs}findJson:contentToSearch:`, contentToSearch, `contentToSearch: `);
  const possibleJson = contentToSearch.substring(contentToSearch.indexOf('{'), contentToSearch.lastIndexOf('}') + 1);
  let foundJson = safeParse(possibleJson);
  if (foundJson.hasOwnProperty('unparsed')) {
      foundJson = null;
  }
  return foundJson;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    stdioToJson
 * @param       {string} ioBuffer  Required. A string buffer that may contain JSON.
 * @returns     {object}  A parsed JavaScript object found in the string buffer, or NULL.
 * @description Given a string buffer, strips any ANSI escape sequences then searches the buffer
 *              to find a single JSON object. If a parseable object is found, it is returned as-is.
 *              If no parseable JSON is found, return NULL.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function stdioToJson(ioBuffer) {
  const localDbgNs = `${dbgNs}:stdioToJson`;
  SfdxFalconDebug.str(`${localDbgNs}:ioBuffer`, ioBuffer);

  // Strip ANSI escape codes from the buffer.
  const cleanBuffer = stripAnsi(ioBuffer);
  SfdxFalconDebug.str(`${localDbgNs}:cleanBuffer`, cleanBuffer);

  // Try to find JSON.
  const foundJson = findJson(cleanBuffer);
  SfdxFalconDebug.obj(`${localDbgNs}:foundJson`, foundJson);

  // Return the result.
  return foundJson;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    safeParse
 * @param       {any} contentToParse  Required. The content to be parsed.
 * @returns     {object}  A JavaScript object based on the content to parse.
 * @description Given any content to parse, returns a JavaScript object based on that content. If
 *              the content is not parseable, it is returned as an object with one key: unparsed.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function safeParse(contentToParse) {
  SfdxFalconDebug.obj(`${dbgNs}safeParse:contentToParse:`, { contentToParse: contentToParse }, `contentToParse: `);
  if (contentToParse === '') {
      contentToParse = '{}';
  }
  try {
      return JSON.parse(contentToParse);
  }
  catch (e) {
      return { unparsed: `${contentToParse}` };
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    convertPropertyToBoolean
 * @param       {object}  targetObject Object containing the property the caller wants to convert.
 * @param       {string}  targetKey Key for the property the caller wants to convert.
 * @param       {boolean} [retainUnconvertedValues=true] Determines whether or not values that
 *              can not be successfully converted to Boolean should be kept as-is or should be
 *              assigned as `undefined` since that's how they come out of the `valueToBoolean()`
 *              function.
 * @returns     {void}
 * @description Given a target object and key that the caller wants to convert, attempts to coerce
 *              a `boolean` value based on the intent of the value currently in that property.
 *              Will have no effect on target properties that are `undefined`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function convertPropertyToBoolean(targetObject, targetKey, retainUnconvertedValues = true) {
  const dbgNsLocal = `${dbgNs}convertPropertyToBoolean`;
  tv.throwOnNullInvalidObject(targetObject, `${dbgNsLocal}`, `targetObject`);
  tv.throwOnEmptyNullInvalidString(targetKey, `${dbgNsLocal}`, `targetKey`);
  if (typeof targetObject[targetKey] === 'string' || typeof targetObject[targetKey] === 'number') {
      const convertedValue = valueToBoolean(targetObject[targetKey]);
      if (typeof convertedValue === 'undefined' && retainUnconvertedValues === true) {
          return;
      }
      targetObject[targetKey] = convertedValue;
  }
  else {
      if (retainUnconvertedValues === false) {
          targetObject[targetKey] = undefined;
      }
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
* @function    convertPropertyToNumber
* @param       {object}  targetObject Object containing the property the caller wants to convert.
* @param       {string}  targetKey Key for the property the caller wants to convert.
* @param       {boolean} [retainUnconvertedValues=true] Determines whether or not values that
* @returns     {void}
* @description Given a target object and key that the caller wants to convert, attempts to coerce
*              a `number` value based on the intent of the value currently in that property, then
*              stores that `number` in the same object property that was tested. Will have no
*              effect on target properties that are `undefined` or `null`.
* @public
*/
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function convertPropertyToNumber(targetObject, targetKey, retainUnconvertedValues = true) {
  const dbgNsLocal = `${dbgNs}convertPropertyToNumber`;
  tv.throwOnNullInvalidObject(targetObject, `${dbgNsLocal}`, `targetObject`);
  tv.throwOnEmptyNullInvalidString(targetKey, `${dbgNsLocal}`, `targetKey`);
  if (typeof targetObject[targetKey] === 'string' || typeof targetObject[targetKey] === 'number' || targetObject[targetKey] === 'boolean') {
      const convertedValue = valueToNumber(targetObject[targetKey]);
      if (typeof convertedValue === 'undefined' && retainUnconvertedValues === true) {
          return;
      }
      targetObject[targetKey] = convertedValue;
  }
  else {
      if (retainUnconvertedValues === false) {
          targetObject[targetKey] = undefined;
      }
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
* @function    valueToBoolean
* @param       {unknown} valueToParse  An `unknown` value to parse. Normally this should be a
*              `string`, though it's possible that unexpected types will enter this function.
* @returns     {boolean} Returns a `boolean` ONLY if the intent of the caller can be determined, and
*              returns `undefined` otherwise.
* @description Given an `unknown` value to parse, tries to determine what the boolean intent of the
*              value is. For example, the string `'TrUe'` would result in boolean `true` being returned.
*              On the other hand, `'random string'`, though true in a traditional boolean sense,
*              would result in the return of `undefined`.
* @public
*/
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function valueToBoolean(valueToParse) {
  if (typeof valueToParse === 'undefined' || typeof valueToParse === 'boolean' || valueToParse === null) {
      return valueToParse;
  }
  if (typeof valueToParse === 'number') {
      return valueToParse === 0 ? false : true;
  }
  if (typeof valueToParse === 'string') {
      switch (valueToParse.toLowerCase().trim()) {
          case 'true':
          case 'yes':
          case '1': return true;
          case 'false':
          case 'no':
          case '0': return false;
          case '': return null;
      }
  }
  return undefined;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
* @function    valueToNumber
* @param       {unknown} valueToParse  An `unknown` value to parse. Normally this should be a
*              `string`, though it's possible that unexpected types will enter this function.
* @returns     {boolean} Returns a `number` ONLY if the intent of the caller can be determined, and
*              returns `undefined` otherwise.
* @description Given an `unknown` value to parse, tries to determine what the numeric intent of the
*              value is. For example, the string `'7'` would result in the number `7` being returned.
*              On the other hand, `'random string'` would return `undefined`.
* @public
*/
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function valueToNumber(valueToParse, radix = 10) {
  if (typeof valueToParse === 'undefined' || typeof valueToParse === 'number' || valueToParse === null) {
      return valueToParse;
  }
  if (typeof valueToParse === 'boolean') {
      return valueToParse ? 1 : 0;
  }
  if (typeof valueToParse === 'string') {
      const parsedNumber = parseInt(valueToParse, (isNaN(radix) ? 10 : radix));
      if (isNaN(parsedNumber) === false) {
          return parsedNumber;
      }
  }
  return undefined;
}