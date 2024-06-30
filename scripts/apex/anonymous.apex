/**
 * All `.apex` files can be used to run anonymous apex code from VS Code.
 * 
 * There are three ways to run anonymous apex code:
 * 
 * 1. Highlight the code you want to run, then click `Execute` in the top
 *    left corner of the editor, above this comment block. This will run
 *    only the highlighted code.
 * 2. Ensure nothing is highlighted, then click `Execute` in the top left
 *    corner of the editor, above this comment block.  This will run the
 *    entire file.
 * 3. From the CLI, run `sf apex run -f scripts/apex/anonymous.apex`. 
 *    This will run the entire file.
 */

 string tempvar = 'Enter_your_name_here';
 System.debug('Hello World!');
 System.debug('My name is ' + tempvar);