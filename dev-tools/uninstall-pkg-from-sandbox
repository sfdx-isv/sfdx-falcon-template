#!/bin/bash
####################################################################################################
#
# FILENAME:     uninstall-pkg-from-sandbox.sh
#
# PURPOSE:      Uninstalls a 04t package from a sandbox org
#
# DESCRIPTION:  TODO: Write descritption
#
# INSTRUCTIONS: Execute the following command relative to your project's root directory:  
#               . ./dev-tools/uninstall-pkg-from-sandbox.sh
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
confirmScriptExecution "Do you want to UNINSTALL a package from the specified sandbox org?"
#
#
#### CREATE LOCAL VARIABLES ########################################################################
#
# No local variables are used by this script.
#
#
#### UNINSTALL PACKAGE FROM SANDBOX ##################################################################
#
#### 0. Reset the Step Message counter and set the TOTAL STEPS to 2.
resetStepMsgCounter 2

#### 1. Attempt to uninstall the specified package from the target subscriber sandbox org.
echoStepMsg "Attempt to uninstall package $PACKAGE_VERSION_ID from the org aliased as $SUBSCRIBER_SANDBOX_ALIAS"
echo \
"Executing sfdx force:package:uninstall \\
                --id $PACKAGE_VERSION_ID \\
                --wait 15 \\
                --targetusername $SUBSCRIBER_SANDBOX_ALIAS \\
                --loglevel error\n"
(cd $PROJECT_ROOT && exec sfdx force:package:uninstall \
                                --id $PACKAGE_VERSION_ID \
                                --wait 15 \
                                --targetusername $SUBSCRIBER_SANDBOX_ALIAS \
                                --loglevel error)

# Check if the previous command executed successfully. If not, abort this script.
if [ $? -ne 0 ]; then
  echoErrorMsg "Package removal from $SUBSCRIBER_SANDBOX_ALIAS was not successful."
fi

#### 2. List all of the packages installed in the target subscriber org.
echoStepMsg "List all packages that remain in $SUBSCRIBER_SANDBOX_ALIAS"
echo "List of packages currently installed in $SUBSCRIBER_SANDBOX_ALIAS.\n"
(cd $PROJECT_ROOT && exec sfdx force:package:installed:list \
                                --targetusername $SUBSCRIBER_SANDBOX_ALIAS \
                                --loglevel error)
#
#
#### ECHO CLOSING SUCCESS MESSAGE ##################################################################
#
echoScriptCompleteMsg "Package removal script complete"


##END##