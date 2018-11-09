#!/bin/bash
####################################################################################################
#
# FILENAME:     deploy-mdapi-source.ps1
#
# PURPOSE:      Convert SFDX source to MDAPI format and DEPLOY to the packaging org.
#
# DESCRIPTION:  TODO: Write desription
#
# INSTRUCTIONS: Execute the following command relative to your project's root directory:  
#               . ./dev-tools/deploy-mdapi-source.ps1
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
confirmScriptExecution "Do you want to DEPLOY the contents of sfdx-source to your packaging org?"
#
#
#### CREATE LOCAL VARIABLES ########################################################################
#
# No local variables are used by this script.
#
#
#### REBUILD MDAPI SOURCE FILES AND FOLDERS ########################################################
#
# 0. Reset the Step Message counter and set the TOTAL STEPS to 4.
resetStepMsgCounter 4

# 1. Ensure that the SFDX Package Directory specified exists.
echoStepMsg "Looking for SFDX Package Directory named `"sfdx-source/$DEFAULT_PACKAGE_DIR_NAME`""
if ( Test-Path "$PROJECT_ROOT/sfdx-source/$DEFAULT_PACKAGE_DIR_NAME" ){
  echo "SFDX Package directory found at: $PROJECT_ROOT/sfdx-source/$DEFAULT_PACKAGE_DIR_NAME"
} else {
  echoErrorMsg "No SFDX Package Directory named `"sfdx-source/$DEFAULT_PACKAGE_DIR_NAME`" found. Aborting script."
  exit 1
}


# 2. If there is a matching folder in the project's mdapi-source directory, delete any existing files.
echoStepMsg "Removing stale files from  `"mdapi-source/$DEFAULT_PACKAGE_DIR_NAME`""
if ( Test-Path "$PROJECT_ROOT/mdapi-source/$DEFAULT_PACKAGE_DIR_NAME" ){
  (Set-Location $PROJECT_ROOT) 
  if ($? -ne 0) {
    rmdir .\mdapi-source\$DEFAULT_PACKAGE_DIR_NAME 
    if ($? -ne 0) { mkdir  .\mdapi-source\$DEFAULT_PACKAGE_DIR_NAME }
  }
  echo "Directory $PROJECT_ROOT/mdapi-source/$DEFAULT_PACKAGE_DIR_NAME has been cleaned and is ready for updated metadata."
} else {
  echo "Directory $PROJECT_ROOT/mdapi-source/$DEFAULT_PACKAGE_DIR_NAME does not exist. It will be created by the SFDX source conversion process."
}


# 3. Convert the SFDX source into MDAPI source.
echoStepMsg "Converting SFDX source from Package Directory `"$DEFAULT_PACKAGE_DIR_NAME`". Output folder is `"mdapi-source/$DEFAULT_PACKAGE_DIR_NAME`""
echo `
"Executing force:source:convert \\
            --rootdir   ./sfdx-source/$DEFAULT_PACKAGE_DIR_NAME \\
            --outputdir ./mdapi-source/$DEFAULT_PACKAGE_DIR_NAME\n"
(Set-Location $PROJECT_ROOT) 
if ($? -ne 0) {
  sfdx force:source:convert `
    --rootdir   .\sfdx-source\$DEFAULT_PACKAGE_DIR_NAME `
    --outputdir .\mdapi-source\$DEFAULT_PACKAGE_DIR_NAME
}

# Check if the previous command executed successfully. If not, abort this script.
if ( $? -ne 0 ) {
  echoErrorMsg "SFDX source conversion to MDAPI format failed. Aborting script."
  exit 1
}


# 4. Attempt to deploy the MDAPI source to the packaging org.
echoStepMsg "Attempt to deploy the MDAPI source to the packaging org"
echo \
"Executing force:mdapi:deploy \\
            --deploydir ./mdapi-source \\
            --testlevel RunLocalTests \\
            --targetusername $PACKAGING_ORG_ALIAS \\
            --wait 15\n"

(Set-Location $PROJECT_ROOT) 
if ($? -ne 0) {
  sfdx force:mdapi:deploy `
    --deploydir .\mdapi-source\$DEFAULT_PACKAGE_DIR_NAME `
    --testlevel RunLocalTests `
    --targetusername $PACKAGING_ORG_ALIAS `
    --wait 15
}

# Check if the previous command executed successfully. If not, abort this script.

if ( $? -ne 'True' ){
  echoErrorMsg "Deployment to the Packaging Org failed. Terminating script."
  exit 1
}


# Provide a closing message telling the user where to find all the generated files.
echoScriptCompleteMsg "Deployment of MDAPI source to the Packaging Org was successful."

exit 0
##END##