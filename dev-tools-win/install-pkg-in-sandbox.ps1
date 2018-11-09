#!/bin/bash
####################################################################################################
#
# FILENAME:     install-pkg-in-sandbox
#
# PURPOSE:      Installs a 04t package into a sandbox org
#
# DESCRIPTION:  TODO: Write descritption
#
# INSTRUCTIONS: Execute the following command relative to your project's root directory:  
#               ./dev-tools/install-pkg-in-sandbox
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
confirmScriptExecution "Do you want to INSTALL a package into the specified sandbox org?"
#
#
#### CREATE LOCAL VARIABLES ########################################################################
#
# No local variables are used by this script.
#
#
#### INSTALL PACKAGE INTO SANDBOX ##################################################################
#
#### 0. Reset the Step Message counter and set the TOTAL STEPS to 2.
resetStepMsgCounter 2

#### 1. Attempt to install the specified package into the target subscriber org.
echoStepMsg "Attempt to install package $PACKAGE_VERSION_ID into the org aliased as $SUBSCRIBER_SANDBOX_ALIAS"
echo \
"Executing sfdx force:package:install \\
                --id $PACKAGE_VERSION_ID \\
                --wait 15 \\
                --publishwait 10 \\
                --targetusername $SUBSCRIBER_SANDBOX_ALIAS \\
                --loglevel error\n"
(Set-Location $PROJECT_ROOT) 
if ($? -ne 0) {
  sfdx force:package:install `
    --id $PACKAGE_VERSION_ID `
    --wait 15 `
    --publishwait 10 `
    --targetusername $SUBSCRIBER_SANDBOX_ALIAS `
    --loglevel error
}

echo $?
# Check if the previous command executed successfully. If not, abort this script.
if ( $? -ne 0 ){
  echoErrorMsg "Package installation was not successful."
}

#### 2. List all of the packages installed in the target subscriber org.
echoStepMsg "List all packages installed in $SUBSCRIBER_SANDBOX_ALIAS"
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
echoScriptCompleteMsg "Package installation script complete"

##END##