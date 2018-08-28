#!/bin/bash
####################################################################################################
#
# FILENAME:     uninstall-pkg-from-sandbox.ps1
#
# PURPOSE:      Uninstalls a 04t package from a sandbox org
#
# DESCRIPTION:  TODO: Write descritption
#
# INSTRUCTIONS: Execute the following command relative to your project's root directory:  
#               . ./dev-tools/uninstall-pkg-from-sandbox.ps1
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
else{
    Write-Output "FATAL ERROR: Could not load $PROJECT_ROOT/dev-tools-win/lib/shared-functions.ps1  File not found."
    return
}
#. '/lib/shared-functions.ps1'
. "$PROJECT_ROOT/dev-tools-win/lib/shared-functions.ps1"
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
echo `
"Executing sfdx force:package:uninstall \\
                --id $PACKAGE_VERSION_ID \\
                --wait 15 \\
                --targetusername $SUBSCRIBER_SANDBOX_ALIAS \\
                --loglevel error"
(Set-Location $PROJECT_ROOT) 
if ($? -ne 0) {
  sfdx force:package:uninstall `
    --id $PACKAGE_VERSION_ID `
    --wait 15 `
    --targetusername $SUBSCRIBER_SANDBOX_ALIAS `
    --loglevel error
}

# Check if the previous command executed successfully. If not, abort this script.
if ( $? -ne 'True' ){
  echoErrorMsg "Package removal from $SUBSCRIBER_SANDBOX_ALIAS was not successful."
}

#### 2. List all of the packages installed in the target subscriber org.
echoStepMsg "List all packages that remain in $SUBSCRIBER_SANDBOX_ALIAS"
echo "List of packages currently installed in $SUBSCRIBER_SANDBOX_ALIAS."
(Set-Location $PROJECT_ROOT) 
if ($? -ne 0) {
  sfdx force:package:installed:list `
    --targetusername $SUBSCRIBER_SANDBOX_ALIAS `
    --loglevel error
}
#
#
#### ECHO CLOSING SUCCESS MESSAGE ##################################################################
#
echoScriptCompleteMsg "Package removal script complete"


##END##