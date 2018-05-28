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
if [ ! -r `dirname $0`/lib/shared-functions.sh ]; then
  echo "\nFATAL ERROR: `tput sgr0``tput setaf 1`Could not load dev-tools/lib/shared-functions.sh.  File not found.\n"
  exit 1
fi
source `dirname $0`/lib/shared-functions.sh
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
echo \
"Executing force:apex:test:run \\
            --targetusername $SCRATCH_ORG_ALIAS \\
            --testlevel RunLocalTests \\
            --outputdir ./temp/apex-test-results \\
            --resultformat human \\
            --synchronous \\
            --codecoverage \\
            --loglevel error)\n"
(cd $PROJECT_ROOT && exec sfdx force:apex:test:run \
                                --targetusername $SCRATCH_ORG_ALIAS \
                                --testlevel RunLocalTests \
                                --outputdir ./temp/apex-test-results \
                                --resultformat human \
                                --codecoverage \
                                --wait 15 \
                                --loglevel error)


# TODO: Need to add a check to see if force:source:convert worked.

# Check if the previous command executed successfully. If not, abort this script.
if [ $? -ne 0 ]; then
  echoErrorMsg "The previous command did not execute as expected. Aborting script"
  exit 1
fi

#### ECHO CLOSING SUCCESS MESSAGE ##################################################################
#
echoScriptCompleteMsg "Tests complete.  Test results should be available in $PROJECT_ROOT/temp/apex-test-results"

##END##