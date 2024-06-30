//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          sfdx-falcon/validators/type-validator.mjs
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Type validation library. Useful for validating incoming arguments inside functions.
 * @description   Exports basic validation functions for ensuring a variable has the expected type
 *                and/or meets certain basic requirements like not empty, not null, etc.
 * @version       1.0.0
 * @license       BSD-3-Clause
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries & Modules
import * as fs      from "fs-extra";    // Extended set of File System utils.
import { isEmpty }  from "lodash-es";   // Useful function for detecting empty objects.

// Import Internal Classes & Functions
import { SfdxFalconDebug } from "../debug/index.mjs"; // Specialized debug provider for SFDX-Falcon code.
import { SfdxFalconError } from "../error/index.mjs"; // Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.

// Set the File Local Debug Namespace
const dbgNs = 'VALIDATOR:type';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgEmptyNullInvalidArray
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting an empty, null, or invalid array
 *              was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting an empty, null, or invalid array was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgEmptyNullInvalidArray(arg, argName) {
    return `Expected ${getArgumentName(argName)} to be a non-null, non-empty array but got${getNullOrEmpty(arg)}${getObjectNameOrPrimitiveType(arg)} instead.`;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgEmptyNullInvalidObject
 * @param       {unknown} arg            Required. The argument involved in the error.
 * @param       {string}  argName        Required. The variable name of the argument involved in the error.
 * @param       {boolean} [excludeArray] Optional. When `true`, excludes arrays from consideration
 *                                       as valid objects. Defaults to `false`.
 * @returns     {string}  A standardized error message reporting an empty, null, or invalid object
 *              was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting an empty, null, or invalid object was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgEmptyNullInvalidObject(arg, argName, excludeArray=false) {
    return `Expected ${getArgumentName(argName)} to be a non-null, non-empty${excludeArray === true ? ', non-array ' : ' '}object but got${getNullOrEmpty(arg)}${getObjectNameOrPrimitiveType(arg)} instead.`;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgEmptyNullInvalidObjectIterator
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting an empty, null, or invalid object
 *                        that does not implement an iterator was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting an empty, null, or invalid Object that does not implement
 *              an iterator was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgEmptyNullInvalidObjectIterator(arg, argName) {
    return `Expected ${getArgumentName(argName)} to be a non-null, non-empty iterable object but got${getNullOrEmpty(arg)}${getObjectNameOrPrimitiveType(arg)}${getInvalidIterator(arg)} instead.`;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgEmptyNullInvalidIterator
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting an empty, null, or invalid iterator
 *                        was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting an empty, null, or invalid iterator (i.e. Object, Array, String)
 *              was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgEmptyNullInvalidIterator(arg, argName) {
    return `Expected ${getArgumentName(argName)} to be a non-null, non-empty iterable type but got${getNullOrEmpty(arg)}${getObjectNameOrPrimitiveType(arg)}${getInvalidIterator(arg)} instead.`;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgEmptyNullInvalidString
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting an empty, null, or invalid string
 *              was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting an empty, null, or invalid string was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgEmptyNullInvalidString(arg, argName) {
    return `Expected ${getArgumentName(argName)} to be a non-null, non-empty string by got${getNullOrEmpty(arg)}${getObjectNameOrPrimitiveType(arg)} instead.`;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgInvalidArray
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting an invalid array was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting an invalid array was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgInvalidArray(arg, argName) {
    return `Expected ${getArgumentName(argName)} to be an array but got${getObjectNameOrPrimitiveType(arg)} instead.`;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgInvalidBoolean
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting an invalid object was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting an invalid boolean was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgInvalidBoolean(arg, argName) {
    return `Expected ${getArgumentName(argName)} to be a boolean but got${getObjectNameOrPrimitiveType(arg)} instead.`;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgInvalidFunction
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting an invalid object was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting an invalid boolean was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgInvalidFunction(arg, argName) {
    return `Expected ${getArgumentName(argName)} to be a function but got${getNullOrEmpty(arg)}${getObjectNameOrPrimitiveType(arg)} instead.`;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgInvalidInstance
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {ClassConstructor}  classConstructor  Required. Constructor function of the object
 *              that the argument was tested against.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting an object that is not an instance
 *              of the expected class.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting an object that is not an instance of the expected class.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgInvalidInstance(arg, classConstructor, argName) {
    // Figure out the name of the Expected Instance.
    let expectedInstanceOf = 'unknown';
    if (typeof classConstructor !== 'undefined' && classConstructor !== null) {
        if (classConstructor.constructor) {
            expectedInstanceOf = classConstructor.constructor.name;
        }
    }
    // Figure out the name of the Actual Instance.
    let actualInstanceOf = '';
    if (typeof arg !== 'undefined' && arg !== null) {
        if (arg.constructor) {
            actualInstanceOf = arg.constructor.name;
        }
    }
    // Build and return the Error Message.
    return `Expected ${getArgumentName(argName)} to be an instance of '${expectedInstanceOf}'`
        + actualInstanceOf ? ` but got an instance of ${actualInstanceOf} instead` : ``
        + `.`;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgInvalidIterator
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting an invalid iterator was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting an invalid iterator was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgInvalidIterator(arg, argName) {
    return `Expected ${getArgumentName(argName)} to be an iterable type but got${getObjectNameOrPrimitiveType(arg)}${getInvalidIterator(arg)} instead.`;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgInvalidObject
 * @param       {unknown} arg            Required. The argument involved in the error.
 * @param       {string}  argName        Required. The variable name of the argument involved in the error.
 * @param       {boolean} [excludeArray] Optional. When `true`, excludes arrays from consideration
 *                                       as valid objects. Defaults to `false`.
 * @returns     {string}  A standardized error message reporting an invalid object was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting an invalid object was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgInvalidObject(arg, argName, excludeArray=false) {
    return `Expected ${getArgumentName(argName)} to be${excludeArray === true ? ' a non-array' : ' an'} object but got ${getObjectNameOrPrimitiveType(arg)} instead.`;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgInvalidObjectIterator
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting an invalid Object or an Object
 *                        that does not implement an iterator was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting invalid Object or an Object that does not implement an iterator
 *              was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgInvalidObjectIterator(arg, argName) {
    return `Expected ${getArgumentName(argName)} to be an iterable object but got${getObjectNameOrPrimitiveType(arg)}${getInvalidIterator(arg)} instead.`;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgInvalidString
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting an invalid string was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting an invalid string was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgInvalidString(arg, argName) {
    return `Expected ${getArgumentName(argName)} to be a string but got${getObjectNameOrPrimitiveType(arg)} instead.`;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgNonReadablePath
 * @param       {string}  path  Required. The path involved in the Error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting a non-readable path was provided.
 * @description Given a path and the name of an argument associated with that path, returns a
 *              standardized error message reporting a non-existant or inaccessible path.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgNonReadablePath(path, argName) {
    return (`Expected ${getArgumentName(argName)} to reference a readable path, but '${path}' does not exist or is not accessible by the currently running user.`);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgNullInvalidArray
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting a null or invalid array was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting a null or invalid array was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgNullInvalidArray(arg, argName) {
    return `Expected ${getArgumentName(argName)} to be a non-null array but got${getNullOrEmpty(arg)}${getObjectNameOrPrimitiveType(arg)} instead.`;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgNullInvalidBoolean
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting a null or invalid boolean was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting a null or invalid boolean was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgNullInvalidBoolean(arg, argName) {
    return `Expected ${getArgumentName(argName)} to be a non-null boolean but got${getNullOrEmpty(arg)}${getObjectNameOrPrimitiveType(arg)} instead.`;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgNullInvalidInstance
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {ClassConstructor}  classConstructor  Required. Constructor function of the object
 *              that the argument was tested against.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting a null object or an object that
 *              is not an instance of the expected class.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting a null object or an object that is not an instance of the
 *              expected class.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgNullInvalidInstance(arg, classConstructor, argName) {
    // Figure out the name of the Expected Instance.
    let expectedInstanceOf = 'unknown';
    if (typeof classConstructor !== 'undefined' && classConstructor !== null) {
        if (classConstructor.prototype && classConstructor.prototype.constructor) {
            expectedInstanceOf = classConstructor.prototype.constructor.name;
        }
    }
    // Figure out the name of the Actual Instance.
    let actualInstanceOf = '';
    if (typeof arg !== 'undefined' && arg !== null) {
        if (arg.constructor) {
            actualInstanceOf = arg.constructor.name;
        }
    }
    // Build and return the Error Message.
    return `Expected ${getArgumentName(argName)} to be a non-null instance of '${expectedInstanceOf}'` +
        (actualInstanceOf ? ` but got an instance of '${actualInstanceOf}' instead` : ``) +
        `.`;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgNullInvalidIterator
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting a null or invalid iterator was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting a null or invalid iterator (i.e. Object, Array, String) was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgNullInvalidIterator(arg, argName) {
    return `Expected ${getArgumentName(argName)} to be a non-null type that implements an iterator but got${getNullOrEmpty(arg)}${getObjectNameOrPrimitiveType(arg)}${getInvalidIterator(arg)} instead.`;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgNullInvalidObject
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting a null or invalid object was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting a null or invalid object was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgNullInvalidObject(arg, argName) {
    return `Expected ${getArgumentName(argName)} to be a non-null${excludeArray === true ? ', non-array ' : ' '}object but got${getNullOrEmpty(arg)}${getObjectNameOrPrimitiveType(arg)} instead.`;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgNullInvalidObjectIterator
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting a null or invalid object, or an
 *                        Object that does not implement an iterator was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting a null or invalid Object, or an Object that does not implement
 *              an iterator was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgNullInvalidObjectIterator(arg, argName) {
    return `Expected ${getArgumentName(argName)} to be a non-null, iterable object but got${getNullOrEmpty(arg)}${getObjectNameOrPrimitiveType(arg)}${getInvalidIterator(arg)} instead.`;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgNullInvalidString
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting a null or invalid string was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting a null or invalid string was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgNullInvalidString(arg, argName) {
    return `Expected ${getArgumentName(argName)} to be a non-null string but got${getNullOrEmpty(arg)}${getObjectNameOrPrimitiveType(arg)} instead.`;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgNullUndefined
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting a `null` or `undefined` value was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting that a `null` or `undefined` value was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgNullUndefined(arg, argName) {
    return `Expected ${getArgumentName(argName)} to be a non-null, defined type but got${getNullOrEmpty(arg)}${getObjectNameOrPrimitiveType(arg)} instead.`;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isEmptyNullInvalidArray
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT an array, or is a null or empty array.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isEmptyNullInvalidArray(variable) {
    return (Array.isArray(variable) !== true || variable === null || variable.length < 1);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isEmptyNullInvalidIterator
 * @param       {unknown} variable      Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT an iterable type, or is null or empty.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isEmptyNullInvalidIterator(variable) {
    // Check if it's a valid iterator. Includes check for NULL.
    if (isInvalidIterator(variable)) {
        return true;
    }
    // Check if at least iterable value is present. If not, it's EMPTY.
    for (const value of variable) {
        return false;
    }
    // It's a valid iterator, but it's empty.
    return true;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isEmptyNullInvalidString
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT a string, or is a null or empty string.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isEmptyNullInvalidString(variable) {
    return (typeof variable !== 'string' || variable === null || variable === '');
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isEmptyNullInvalidObject
 * @param       {unknown} variable      Required. The variable whose type will be validated.
 * @param       {boolean} excludeArray  Optional. When `true`, excludes arrays from consideration
 *                                      as valid objects. Defaults to `false`.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT an object, or is a null or empty object. When
 *              `excludeArray` is `true`, a variable with the primitive type of `object` will be
 *              considered invalid if it is also an `Array`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isEmptyNullInvalidObject(variable, excludeArray=false) {
    return (isInvalidObject(variable, excludeArray) || variable === null || isEmpty(variable));
}


// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isEmptyNullInvalidObjectIterator
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT an iterable type, or is null or empty, or is not an Object.
 *              Automatically excludes Array objects from consideration as valid iterators.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isEmptyNullInvalidObjectIterator(variable) {
    // Check if a valid Object iterator.
    if (isNullInvalidObjectIterator(variable)) {
        return true;
    }
    // Check if at least iterable value is present.
    for (const value of variable) {
        return false;
    }
    // It's a valid iterator, but it's empty.
    return true;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isInvalidArray
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT an array.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isInvalidArray(variable) {
    return (Array.isArray(variable) !== true);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isInvalidBoolean
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT a boolean.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isInvalidBoolean(variable) {
    return (typeof variable !== 'boolean');
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isInvalidFunction
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT a function.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isInvalidFunction(variable) {
    return (typeof variable !== 'function');
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isInvalidInstance
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @param       {ClassConstructor}  classConstructor  Required. Constructor function of the object
 *              that the variable will be tested against.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT an instance of a the expected class.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isInvalidInstance(variable, classConstructor) {
    return (typeof variable !== 'object' || ((variable instanceof classConstructor) !== true));
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isInvalidIterator
 * @param       {unknown} variable      Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable implements an iterator.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isInvalidIterator(variable) {
    if (isNullInvalidObject(variable)) {
        return true;
    }
    return !(typeof variable[Symbol.iterator] === 'function');
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isInvalidObject
 * @param       {unknown} variable       Required. The variable whose type will be validated.
 * @param       {boolean} [excludeArray] Optional. When `true`, excludes arrays from consideration
 *                                       as valid objects. Defaults to `false`.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT an object. When `excludeArray` is `true`, a
 *              variable with the primitive type of `object` will be considered invalid if it is
 *              also an `Array`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isInvalidObject(variable, excludeArray=false) {
    // Are arrays excluded from being valid?
    if (excludeArray === true && Array.isArray(variable) === true) {
        return true;
    }
    return (typeof variable !== 'object');
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isInvalidObjectIterator
 * @param       {unknown} variable      Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable implements an iterator and is an Object. 
 *              Automatically excludes Array objects from consideration as valid iterators.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isInvalidObjectIterator(variable) { 
    // Check for null/invalid object EXCLUDING arrays.
    if (isNullInvalidObject(variable, true)) {
        return true;
    }
    return isInvalidIterator(variable);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isInvalidString
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT a string.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isInvalidString(variable) {
    return (typeof variable !== 'string');
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNullInvalidArray
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT an array, or if it is null.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNullInvalidArray(variable) {
    return (Array.isArray(variable) !== true || variable === null);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNullInvalidBoolean
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT a boolean, or if it is null.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNullInvalidBoolean(variable) {
    return (typeof variable !== 'boolean' || variable === null);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNullInvalidInstance
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @param       {ClassConstructor}  classConstructor  Required. Constructor function of the object
 *              that the variable will be tested against.
 * @returns     {boolean}
 * @description Checks if the given variable is null or is NOT an instance of the expected class.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNullInvalidInstance(variable, classConstructor) {
    return (typeof variable !== 'object' || variable === null || ((variable instanceof classConstructor) !== true));
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNullInvalidIterator
 * @param       {unknown} variable      Required. The variable whose type will be validated.
 * @description Checks if the given variable is NOT an iterable type, or is null.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNullInvalidIterator(variable) {
    // Null check is always built into isInvalidIterator.
    return isInvalidIterator(variable);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNullInvalidObject
 * @param       {unknown} variable      Required. The variable whose type will be validated.
 * @param       {boolean} excludeArray  Optional. When `true`, excludes arrays from consideration
 *                                      as valid objects. Defaults to `false`.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT an object, or if it is null. When
 *              `excludeArray` is `true`, a variable with the primitive type of `object` will be
 *              considered invalid if it is also an `Array`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNullInvalidObject(variable, excludeArray=false) {
    return (isInvalidObject(variable, excludeArray) || variable === null);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNullInvalidObjectIterator
 * @param       {unknown} variable      Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT an iterable type, or is null, or is not an Object.
 *              Automatically excludes Array objects from consideration as valid iterators.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNullInvalidObjectIterator(variable) {
    // Check for valid non-null object EXCLUDING arrays.
    if (isNullInvalidObject(variable, true)) {
        return true;
    }
    return isInvalidIterator(variable);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNullInvalidString
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT a `string`, or if it is `null`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNullInvalidString(variable) {
    return (typeof variable !== 'string' || variable === null);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNullUndefined
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is `null` or `undefined`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNullUndefined(variable) {
    return (typeof variable === 'undefined' || variable === null);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isReadablePath
 * @param       {string}  path  Required. Path that will be checked for readability.
 * @returns     {boolean}
 * @description Checks if the given path exists AND is readable by the currently running user.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isReadablePath(path) {
    try {
        fs.accessSync(path, fs.constants.R_OK);
    }
    catch (accessError) {
        return false;
    }
    return true;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotEmptyNullInvalidArray
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of isEmptyNullInvalidArray().
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotEmptyNullInvalidArray(variable) {
    return !isEmptyNullInvalidArray(variable);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotEmptyNullInvalidIterator
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of isEmptyNullInvalidIterator().
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotEmptyNullInvalidIterator(variable) {
    return !isEmptyNullInvalidIterator(variable);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotEmptyNullInvalidString
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of isEmptyNullInvalidString().
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotEmptyNullInvalidString(variable) {
    return !isEmptyNullInvalidString(variable);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotEmptyNullInvalidObject
 * @param       {unknown} variable      Required. The variable whose type will be validated.
 * @param       {boolean} excludeArray  Optional. When `true`, excludes arrays from consideration
 *                                      as valid objects. Defaults to `false`.
 * @returns     {boolean}
 * @description Checks for the inverse of isEmptyNullInvalidObject(). When `excludeArray` is `true`,
 *              a variable with the primitive type of `object` will be considered invalid if it is
 *              also an `Array`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotEmptyNullInvalidObject(variable, excludeArray=false) {
    return !isEmptyNullInvalidObject(variable, excludeArray);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotEmptyNullInvalidObjectIterator
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of isEmptyNullInvalidObjectIterator().
 *              Automatically excludes Array objects from consideration as valid iterators.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotEmptyNullInvalidObjectIterator(variable) {
    return !isEmptyNullInvalidObjectIterator(variable);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotNullInvalidArray
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of isNullInvalidArray().
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotNullInvalidArray(variable) {
    return !isNullInvalidArray(variable);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotNullInvalidBoolean
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of isNullInvalidBoolean().
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotNullInvalidBoolean(variable) {
    return !isNullInvalidBoolean(variable);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotNullInvalidInstance
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @param       {ClassConstructor}  classConstructor  Required. Constructor function of the object
 *              that the variable will be tested against.
 * @returns     {boolean}
 * @description Checks for the inverse of isNullInvalidInstance().
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotNullInvalidInstance(variable, classConstructor) {
    return !isNullInvalidInstance(variable, classConstructor);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotNullInvalidIterator
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of isNullInvalidIterator().
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotNullInvalidIterator(variable) {
    return !isNullInvalidIterator(variable);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotNullInvalidObject
 * @param       {unknown} variable      Required. The variable whose type will be validated.
 * @param       {boolean} excludeArray  Optional. When `true`, excludes arrays from consideration
 *                                      as valid objects. Defaults to `false`.
 * @returns     {boolean}
 * @description Checks for the inverse of isNullInvalidObject(). When `excludeArray` is `true`, a
 *              variable with the primitive type of `object` will be considered invalid if it is
 *              also an `Array`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotNullInvalidObject(variable, excludeArray=false) {
    return !isNullInvalidObject(variable,excludeArray);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotNullInvalidObjectIterator
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of isNullInvalidObjectIterator().
 *              Automatically excludes Array objects from consideration as valid iterators.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotNullInvalidObjectIterator(variable) {
    return !isNullInvalidObjectIterator(variable);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotNullInvalidString
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of isNullInvalidString().
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotNullInvalidString(variable) {
    return !isNullInvalidString(variable);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotNullUndefined
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of `isNullUndefined()`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotNullUndefined(variable) {
    return !isNullUndefined(variable);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotReadablePath
 * @param       {string}  path  Required. Path that will be checked for readability.
 * @returns     {boolean}
 * @description Checks for the inverse of isReadablePath().
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotReadablePath(path) {
    return !isReadablePath(path);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isValidArray
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of isInvalidArray().
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isValidArray(variable) {
    return !isInvalidArray(variable);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isValidBoolean
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of isInvalidBoolean().
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isValidBoolean(variable) {
    return !isInvalidBoolean(variable);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isValidFunction
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of isInvalidFunction().
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isValidFunction(variable) {
    return !isInvalidFunction(variable);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isValidInstance
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @param       {ClassConstructor}  classConstructor  Required. Constructor function of the object
 *              that the variable will be tested against.
 * @returns     {boolean}
 * @description Checks for the inverse of isInvalidInstance().
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isValidInstance(variable, classConstructor) {
    return !isInvalidInstance(variable, classConstructor);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isValidIterator
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of isInvalidIterator().
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isValidIterator(variable) {
    return !isInvalidIterator(variable);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isValidObject
 * @param       {unknown} variable      Required. The variable whose type will be validated.
 * @param       {boolean} excludeArray  Optional. When `true`, excludes arrays from consideration
 *                                      as valid objects. Defaults to `false`.
 * @returns     {boolean}
 * @description Checks for the inverse of isInvalidObject(). When `excludeArray` is `true`, a 
 *              variable with the primitive type of `object` will be considered invalid if it is
 *              also an `Array`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isValidObject(variable, excludeArray=false) {
    return !isInvalidObject(variable, excludeArray);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isValidObjectIterator
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of isInvalidObjectIterator().
 *              Automatically excludes Array objects from consideration as valid iterators.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isValidObjectIterator(variable) {
    return !isInvalidObjectIterator(variable);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isValidString
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of isInvalidString().
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isValidString(variable) {
    return !isInvalidString(variable);
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnEmptyNullInvalidArray
 * @param       {unknown} arg Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  [argName] Optional. The variable name of the argument being validated.
 * @returns     {void}
 * @description Given an argument of unknown type, attempts to validate that the argument is a
 *              non-null, non-empty array. Uses the debug namespace of the external caller as the
 *              base of the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnEmptyNullInvalidArray(arg, dbgNsExt, argName) {
    if (isEmptyNullInvalidArray(arg)) {
        throw new SfdxFalconError(errMsgEmptyNullInvalidArray(arg, argName), `TypeError`, `${dbgNsExt}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnEmptyNullInvalidIterator
 * @param       {unknown} arg Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  [argName] Optional. The variable name of the argument being validated.
 * @returns     {void}
 * @description Given an argument of unknown type, attempts to validate that the argument is a
 *              non-null, non-empty iterator (i.e. Object, Array, String). Uses the debug namespace
 *              of the external caller as the base of the "source" string used by the 
 *              thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnEmptyNullInvalidIterator(arg, dbgNsExt, argName) {
    if (isEmptyNullInvalidIterator(arg)) {
        throw new SfdxFalconError(errMsgEmptyNullInvalidIterator(arg, argName), `TypeError`, `${dbgNsExt}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnEmptyNullInvalidObject
 * @param       {unknown} arg            Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt       Required. The debug namespace of the external caller.
 * @param       {string}  [argName]      Optional. The variable name of the argument being validated.
 * @param       {boolean} [excludeArray] Optional. When `true`, excludes arrays from consideration
 *                                       as valid objects. Defaults to `false`.
 * @returns     {void}
 * @description Given an argument of unknown type, attempts to validate that the argument is a
 *              non-null, non-empty object. When `excludeArray` is `true`, a variable with the 
 *              primitive type of `object` will be considered invalid if it is also an `Array`. 
 *              Uses the debug namespace of the external caller as the base of the "source" string
 *              used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnEmptyNullInvalidObject(arg, dbgNsExt, argName, excludeArray=false) {
    // Handle caller using 2 or 3 arguments instead of all four.
    if (typeof argName !== 'string') {
        argName = '';
    }
    if (typeof excludeArray !== 'boolean') {
        excludeArray = false;
    }
    // Run the check.
    if (isEmptyNullInvalidObject(arg, excludeArray)) {
        throw new SfdxFalconError(errMsgEmptyNullInvalidObject(arg, argName, excludeArray), `TypeError`, `${dbgNsExt}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnEmptyNullInvalidObjectIterator
 * @param       {unknown} arg Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  [argName] Optional. The variable name of the argument being validated.
 * @returns     {void}
 * @description Given an argument of unknown type, attempts to validate that the argument is a
 *              non-null, non-empty iterator of type Object. Uses the debug namespace
 *              of the external caller as the base of the "source" string used by the 
 *              thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnEmptyNullInvalidObjectIterator(arg, dbgNsExt, argName) {
    if (isEmptyNullInvalidObjectIterator(arg)) {
        throw new SfdxFalconError(errMsgEmptyNullInvalidObjectIterator(arg, argName), `TypeError`, `${dbgNsExt}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnEmptyNullInvalidString
 * @param       {unknown} arg Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  [argName] Optional. The variable name of the argument being validated.
 * @returns     {void}
 * @description Given an argument of unknown type, attempts to validate that the argument is a
 *              non-null, non-empty string. Uses the debug namespace of the external caller as the
 *              base of the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnEmptyNullInvalidString(arg, dbgNsExt, argName) {
    if (isEmptyNullInvalidString(arg)) {
        throw new SfdxFalconError(errMsgEmptyNullInvalidString(arg, argName), `TypeError`, `${dbgNsExt}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnInvalidArray
 * @param       {unknown} arg Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  [argName] Optional. The variable name of the argument being validated.
 * @returns     {void}
 * @description Given an argument of unknown type, attempts to validate that the argument is an
 *              array. Uses the debug namespace of the external caller as the base of
 *              the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnInvalidArray(arg, dbgNsExt, argName) {
    if (isInvalidArray(arg)) {
        throw new SfdxFalconError(errMsgInvalidArray(arg, argName), `TypeError`, `${dbgNsExt}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnInvalidBoolean
 * @param       {unknown} arg Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  [argName] Optional. The variable name of the argument being validated.
 * @returns     {void}
 * @description Given an argument of unknown type, attempts to validate that the argument is a
 *              boolean. Uses the debug namespace of the external caller as the base of
 *              the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnInvalidBoolean(arg, dbgNsExt, argName) {
    if (isInvalidBoolean(arg)) {
        throw new SfdxFalconError(errMsgInvalidBoolean(arg, argName), `TypeError`, `${dbgNsExt}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnInvalidFunction
 * @param       {unknown} arg Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  [argName] Optional. The variable name of the argument being validated.
 * @returns     {void}
 * @description Given an argument of unknown type, attempts to validate that the argument is a
 *              function. Uses the debug namespace of the external caller as the base of
 *              the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnInvalidFunction(arg, dbgNsExt, argName) {
    if (isInvalidFunction(arg)) {
        throw new SfdxFalconError(errMsgInvalidFunction(arg, argName), `TypeError`, `${dbgNsExt}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnInvalidInstance
 * @param       {unknown} arg Required. The argument whose type will be validated.
 * @param       {ClassConstructor}  classConstructor  Required. Constructor function of the object
 *              that the argument will be tested against.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  [argName] Optional. The variable name of the argument being validated.
 * @returns     {void}
 * @description Given an argument of unknown type, attempts to validate that the argument is an
 *              object that's an instace of the specified class. Uses the debug namespace of the
 *              external caller as the base of the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnInvalidInstance(arg, classConstructor, dbgNsExt, argName) {
    if (isInvalidInstance(arg, classConstructor)) {
        throw new SfdxFalconError(errMsgInvalidInstance(arg, classConstructor, argName), `TypeError`, `${dbgNsExt}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnInvalidIterator
 * @param       {unknown} arg Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  [argName] Optional. The variable name of the argument being validated.
 * @returns     {void}
 * @description Given an argument of unknown type, attempts to validate that the argument is a
 *              valid iterator (i.e. Object, Array, String). Uses the debug namespace of the
 *              external caller as the base of the "source" string used by the 
 *              thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnInvalidIterator(arg, dbgNsExt, argName) {
    if (isInvalidIterator(arg)) {
        throw new SfdxFalconError(errMsgInvalidIterator(arg, argName), `TypeError`, `${dbgNsExt}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnInvalidObject
 * @param       {unknown} arg            Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt       Required. The debug namespace of the external caller.
 * @param       {string}  [argName]      Optional. The variable name of the argument being validated.
 * @param       {boolean} [excludeArray] Optional. When `true`, excludes arrays from consideration
 *                                       as valid objects. Defaults to `false`.
 * @returns     {void}
 * @description Given an argument of unknown type, attempts to validate that the argument is an
 *              object. When `excludeArray` is `true`, a variable with the primitive type of
 *              `object` will be considered invalid if it is also an `Array`. Uses the debug
 *              namespace of the external caller as the base of the "source" string used by
 *              the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnInvalidObject(arg, dbgNsExt, argName, excludeArray=false) {
    // Handle caller using 2 or 3 arguments instead of all four.
    if (typeof argName !== 'string') {
        argName = '';
    }
    if (typeof excludeArray !== 'boolean') {
        excludeArray = false;
    }
    // Run the check.
    if (isInvalidObject(arg, excludeArray)) {
        throw new SfdxFalconError(errMsgInvalidObject(arg, argName, excludeArray), `TypeError`, `${dbgNsExt}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnInvalidObjectIterator
 * @param       {unknown} arg Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  [argName] Optional. The variable name of the argument being validated.
 * @returns     {void}
 * @description Given an argument of unknown type, attempts to validate that the argument is a
 *              valid iterator of type Object. Automatically excludes variables whose primitive type
 *              is `object` if they are also an `Array`. Uses the debug namespace of the
 *              external caller as the base of the "source" string used by the 
 *              thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnInvalidObjectIterator(arg, dbgNsExt, argName) {
    if (isInvalidObjectIterator(arg)) {
        throw new SfdxFalconError(errMsgInvalidObjectIterator(arg, argName), `TypeError`, `${dbgNsExt}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnInvalidString
 * @param       {unknown} arg Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  [argName] Optional. The variable name of the argument being validated.
 * @returns     {void}
 * @description Given an argument of unknown type, attempts to validate that the argument is a
 *              string. Uses the debug namespace of the external caller as the base of
 *              the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnInvalidString(arg, dbgNsExt, argName) {
    if (isInvalidString(arg)) {
        throw new SfdxFalconError(errMsgInvalidString(arg, argName), `TypeError`, `${dbgNsExt}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnNullInvalidArray
 * @param       {unknown} arg Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  [argName] Optional. The variable name of the argument being validated.
 * @returns     {void}
 * @description Given an argument of unknown type, attempts to validate that the argument is a
 *              non-null array. Uses the debug namespace of the external caller as the base of
 *              the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnNullInvalidArray(arg, dbgNsExt, argName) {
    if (isNullInvalidArray(arg)) {
        throw new SfdxFalconError(errMsgNullInvalidArray(arg, argName), `TypeError`, `${dbgNsExt}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnNullInvalidBoolean
 * @param       {unknown} arg Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  [argName] Optional. The variable name of the argument being validated.
 * @returns     {void}
 * @description Given an argument of unknown type, attempts to validate that the argument is a
 *              non-null boolean. Uses the debug namespace of the external caller as the base of
 *              the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnNullInvalidBoolean(arg, dbgNsExt, argName) {
    if (isNullInvalidBoolean(arg)) {
        throw new SfdxFalconError(errMsgNullInvalidBoolean(arg, argName), `TypeError`, `${dbgNsExt}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnNullInvalidInstance
 * @param       {unknown} arg Required. The argument whose type will be validated.
 * @param       {ClassConstructor}  classConstructor  Required. Constructor function of the object
 *              that the argument will be tested against.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  argName Required. The variable name of the argument being validated.
 * @returns     {void}
 * @description Given an argument of unknown type, attempts to validate that the argument is a
 *              non-null object that's an instace of the specified class. Uses the debug namespace
 *              of the external caller as the base of the "source" string used by the thrown
 *              `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnNullInvalidInstance(arg, classConstructor, dbgNsExt, argName) {
    if (isNullInvalidInstance(arg, classConstructor)) {
        throw new SfdxFalconError(errMsgNullInvalidInstance(arg, classConstructor, argName), `TypeError`, `${dbgNsExt}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnNullInvalidIterator
 * @param       {unknown} arg Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  [argName] Optional. The variable name of the argument being validated.
 * @returns     {void}
 * @description Given an argument of unknown type, attempts to validate that the argument is a
 *              valid, non-null iterator (i.e. Object, Array, String). Uses the debug namespace
 *              of the external caller as the base of the "source" string used by the 
 *              thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnNullInvalidIterator(arg, dbgNsExt, argName) {
    if (isNullInvalidIterator(arg)) {
        throw new SfdxFalconError(errMsgNullInvalidIterator(arg, argName), `TypeError`, `${dbgNsExt}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnNullInvalidObject
 * @param       {unknown} arg            Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt       Required. The debug namespace of the external caller.
 * @param       {string}  [argName]      Optional. The variable name of the argument being validated.
 * @param       {boolean} [excludeArray] Optional. When `true`, excludes arrays from consideration
 *                                       as valid objects. Defaults to `false`.
 * @returns     {void}
 * @description Given an argument of unknown type, attempts to validate that the argument is a
 *              non-null object. When `excludeArray` is `true`, a variable with the primitive type
 *              of `object` will be considered invalid if it is also an `Array`. Uses the debug
 *              namespace of the external caller as the base of the "source" string used by the 
 *              thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnNullInvalidObject(arg, dbgNsExt, argName, excludeArray=false) {
    // Handle caller using 2 or 3 arguments instead of all four.
    if (typeof argName !== 'string') {
        argName = '';
    }
    if (typeof excludeArray !== 'boolean') {
        excludeArray = false;
    }
    // Run the check.
    if (isNullInvalidObject(arg, excludeArray)) {
        throw new SfdxFalconError(errMsgNullInvalidObject(arg, argName, excludeArray), `TypeError`, `${dbgNsExt}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnNullInvalidObjectIterator
 * @param       {unknown} arg Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  [argName] Optional. The variable name of the argument being validated.
 * @returns     {void}
 * @description Given an argument of unknown type, attempts to validate that the argument is a
 *              valid, non-null iterator of type Object. Automatically excludes variables with a
 *              primitive type of `object` if they are also `Array`. Uses the debug namespace
 *              of the external caller as the base of the "source" string used by the 
 *              thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnNullInvalidObjectIterator(arg, dbgNsExt, argName) {
    if (isNullInvalidObjectIterator(arg)) {
        throw new SfdxFalconError(errMsgNullInvalidObjectIterator(arg, argName), `TypeError`, `${dbgNsExt}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnNullInvalidString
 * @param       {unknown} arg Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  [argName] Optional. The variable name of the argument being validated.
 * @returns     {void}
 * @description Given an argument of unknown type, attempts to validate that the argument is a
 *              non-null string. Uses the debug namespace of the external caller as the base of
 *              the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnNullInvalidString(arg, dbgNsExt, argName) {
    if (isNullInvalidString(arg)) {
        throw new SfdxFalconError(errMsgNullInvalidString(arg, argName), `TypeError`, `${dbgNsExt}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnNullUndefined
 * @param       {unknown} arg Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  [argName] Optional. The variable name of the argument being validated.
 * @returns     {void}
 * @description Given an argument of `unknown` type, attempts to validate that the argument is a
 *              not `null` nor `undefined`. Uses the debug namespace of the external caller as the
 *              base of the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnNullUndefined(arg, dbgNsExt, argName) {
    if (isNullUndefined(arg)) {
        throw new SfdxFalconError(errMsgNullUndefined(arg, argName), `TypeError`, `${dbgNsExt}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnNonReadablePath
 * @param       {string}  path  Required. Path that will be checked for readability.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  [argName] Optional. The variable name of the argument being validated.
 * @returns     {void}
 * @description Given a string containing a filesystem path, attempts to validate that the path is
 *              readable by the running user. Uses the debug namespace of the external caller as the
 *              base of the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnNonReadablePath(path, dbgNsExt, argName) {
    if (isNotReadablePath(path)) {
        throw new SfdxFalconError(errMsgNonReadablePath(path, argName), `PathError`, `${dbgNsExt}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    getObjectNameOrPrimitiveType
 * @param       {unknown} variable  Required. The variable whose prototype or primitive we'll get.
 * @returns     {String}  The name of the prototype or a primitive if a prototype can't be found.
 * @description Inspects the `variable` and tries to identify the prototype name, e.g. `Array`. If
 *              a prototype can't be found, returns the primitive type.
 * @private
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
function getObjectNameOrPrimitiveType(variable) {
    if (typeof variable === 'object' && variable !== null) {
        return ` ${variable.constructor.name}`;
    }
    return ` ${typeof variable}`;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    getArgumentName
 * @param       {unknown} variable  Required. The variable being tested.
 * @returns     {String}  A string fragment containing either the argument name or 'the argument'.
 * @description Inspects `variable` and detects it is anything other than a non-empty `string`.
 *              Returns a default value of 'the argument' if a non-empty string was not provided.
 * @private
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
function getArgumentName(argName) {
    if (isEmptyNullInvalidString(argName)) {
        return 'the argument';
    }
    return argName;
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    getNullOrEmpty
 * @param       {unknown} variable  Required. The variable being tested.
 * @returns     {String}  A string fragment indicating whether the variable was null or empty.
 * @description Inspects `variable` and detects it is `null` or empty, then returns a sentence
 *              fragment that can be injected into an error message string. The `isEmpty()` function
 *              treats numbers as empty even if they have values. For this reason, only `object`,
 *              `string`, and `symbol` types are tested using `isEmpty()`.
 * @private
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
function getNullOrEmpty(variable) {
    // Null
    if (variable === null) {
        return ' a NULL';
    }
    // Empty (but only for Objects, Strings, and Symbols)
    if ((typeof variable === 'object' || typeof variable === 'string' || typeof variable === 'symbol') && isEmpty(variable)) {
        return ' an empty';
    }
    // Everything else
    return '';
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    getInvalidIterator
 * @param       {unknown} variable  Required. The variable being tested.
 * @returns     {String}  A string fragment indicating whether the variable is iterable.
 * @description Inspects `variable` and detects it implements the iterable protocol, then returns a
 *              sentence fragment that can be injected into an error message string.
 * @private
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
function getInvalidIterator(variable) {
    // Iterable type
    if (isInvalidIterator(variable)) {
        return ' that does not implement the iterable protocol';
    }
    // Everything else
    return '';
}
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    validateTheValidator
 * @returns     {void}
 * @description Ensures that the three expected arguments (unknown[], string, and string[]) were
 *              provided to a "validator" function. Who watches the watchers? The same one who
 *              validates the validators! :-)
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function validateTheValidator() {
    const localDbgNs = `${dbgNs}:validateTheValidator`;
    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${localDbgNs}:arguments`, arguments);
    // Validate "args". Throw on null or invalid Array.
    throwOnNullInvalidArray(arguments[0], localDbgNs, 'args');
    // Validate "dbgNsExt". Throw on null, invalid, or empty String.
    throwOnEmptyNullInvalidString(arguments[1], localDbgNs, 'dbgNsExt');
    // Validate "argNames". Throw on null or invalid Array.
    throwOnNullInvalidArray(arguments[2], localDbgNs, 'argNames');
}