#!/bin/bash
####################################################################################################
#
# FILENAME:     run_all_tests
#
# PURPOSE:      ##ADD_PURPOSE_HERE##
#
# DESCRIPTION:  ##ADD_DESCRIPTIION_HERE##
#
# INSTRUCTIONS: Execute the following command relative to your project's root directory:  
#               ./dev-tools/run_all_tests
#
# RELATED DOCS: TODO: ?????
#               └─ https://???.???.com
#
#               TODO: ?????
#               ├─ https://www.????.com
#               └─ https://www.????.com
#
#### LOAD SHARED FUNCTIONS LIBRARY #################################################################
#
$PROJECT_ROOT = (Split-Path $PSScriptRoot -Parent)
if (Test-Path "$PROJECT_ROOT/dev-tools-win/lib/shared-functions.ps1") {}
else {
    Write-Output "FATAL ERROR: Could not load $PROJECT_ROOT/dev-tools-win/lib/shared-functions.ps1.  File not found."
    return
}
#. '/lib/shared-functions.ps1'
. "$PROJECT_ROOT/dev-tools-win/lib/shared-functions.ps1"
#
#
#### CONFIRM SCRIPT EXECUTION ######################################################################
#
confirmScriptExecution "Do you want to run all tests currently deployed to your scratch org?"
#
#
#### CREATE LOCAL VARIABLES ########################################################################
#
# No local variables are used by this script.
#
#
#### RUN ALL TESTS IN THE SCRATCH ORG ##############################################################
#
# 0. Reset the Step Message counter and set the TOTAL STEPS to 1.
resetStepMsgCounter 1

# 1. Run all tests as human readable, with final output made to the temp directory.
echoStepMsg "Run all tets currently deployed to $SCRATCH_ORG_ALIAS"
echo `
"Executing force:apex:test:run \\
            --targetusername $SCRATCH_ORG_ALIAS \\
            --testlevel RunLocalTests \\
            --outputdir ./temp/apex-test-results \\
            --resultformat human \\
            --synchronous \\
            --codecoverage \\
            --loglevel error)"
(Set-Location $PROJECT_ROOT) 
if ($? -ne 0) {
  sfdx force:apex:test:run `
    --targetusername $SCRATCH_ORG_ALIAS `
    --testlevel RunLocalTests `
    --outputdir .\temp\apex-test-results `
    --resultformat human `
    --codecoverage `
    --wait 15 `
    --loglevel error
}


# TODO: Need to add a check to see if force:source:convert worked.
echo $?
# Check if the previous command executed successfully. If not, abort this script.
if ( $? -ne 'True' ) {
  echoErrorMsg "The previous command did not execute as expected. Aborting script"
  exit 1
}

#### ECHO CLOSING SUCCESS MESSAGE ##################################################################
#
echoScriptCompleteMsg "Tests complete.  Test results should be available in $PROJECT_ROOT/temp/apex-test-results"

##END##