#!/bin/bash
####################################################################################################
#
# FILENAME:     deploy-mdapi-source.sh
#
# PURPOSE:      Convert SFDX source to MDAPI format and DEPLOY to the packaging org.
#
# DESCRIPTION:  TODO: Write desription
#
# INSTRUCTIONS: Execute the following command relative to your project's root directory:  
#               . ./dev-tools/deploy-mdapi-source.sh
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
confirmScriptExecution "Do you want to DEPLOY the contents of sfdx-source/$DEFAULT_PACKAGE_DIR_NAME to your packaging org?"
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

# 1. Ensure that the SFDX Package Directory specified by $DEFAULT_PACKAGE_DIR_NAME exists.
echoStepMsg "Looking for SFDX Package Directory named \"sfdx-source/$DEFAULT_PACKAGE_DIR_NAME\""
if [ -d "$PROJECT_ROOT/sfdx-source/$DEFAULT_PACKAGE_DIR_NAME" ]; then
  echo "SFDX Package directory found at: $PROJECT_ROOT/sfdx-source/$DEFAULT_PACKAGE_DIR_NAME"
else
  echoErrorMsg "No SFDX Package Directory named \"sfdx-source/$DEFAULT_PACKAGE_DIR_NAME\" found. Aborting script."
  exit 1
fi


# 2. If there is a matching folder in the project's mdapi-source directory, delete any existing files.
echoStepMsg "Removing stale files from  \"mdapi-source/$DEFAULT_PACKAGE_DIR_NAME\""
if [ -d "$PROJECT_ROOT/mdapi-source/$DEFAULT_PACKAGE_DIR_NAME" ]; then
  (cd $PROJECT_ROOT && exec rm -rf ./mdapi-source/$DEFAULT_PACKAGE_DIR_NAME \
                    && exec mkdir  ./mdapi-source/$DEFAULT_PACKAGE_DIR_NAME)
  echo "Directory $PROJECT_ROOT/mdapi-source/$DEFAULT_PACKAGE_DIR_NAME has been cleaned and is ready for updated metadata."
else
  echo "Directory $PROJECT_ROOT/mdapi-source/$DEFAULT_PACKAGE_DIR_NAME does not exist. It will be created by the SFDX source conversion process."
fi


# 3. Convert the SFDX source into MDAPI source.
echoStepMsg "Converting SFDX source from Package Directory \"$DEFAULT_PACKAGE_DIR_NAME\". Output folder is \"mdapi-source/$DEFAULT_PACKAGE_DIR_NAME\""
echo \
"Executing force:source:convert \\
            --rootdir     ./sfdx-source/$DEFAULT_PACKAGE_DIR_NAME \\
            --outputdir   ./mdapi-source/$DEFAULT_PACKAGE_DIR_NAME \\
            --packagename \"$PACKAGE_NAME\" \\
            --loglevel    error\n"
(cd $PROJECT_ROOT && exec sfdx force:source:convert \
                                --rootdir     ./sfdx-source/$DEFAULT_PACKAGE_DIR_NAME \
                                --outputdir   ./mdapi-source/$DEFAULT_PACKAGE_DIR_NAME \
                                --packagename "$PACKAGE_NAME" \
                                --loglevel    error)

# Check if the previous command executed successfully. If not, abort this script.
if [ $? -ne 0 ]; then
  echoErrorMsg "SFDX source conversion to MDAPI format failed. Aborting script."
  exit 1
fi


# 4. Attempt to deploy the MDAPI source to the packaging org.
echoStepMsg "Attempt to deploy the MDAPI source to the packaging org"
echo \
"Executing force:mdapi:deploy \\
            --deploydir ./mdapi-source/$DEFAULT_PACKAGE_DIR_NAME \\
            --testlevel RunLocalTests \\
            --targetusername $PACKAGING_ORG_ALIAS \\
            --wait 15\n"
(cd $PROJECT_ROOT && exec sfdx force:mdapi:deploy \
                                --deploydir ./mdapi-source/$DEFAULT_PACKAGE_DIR_NAME \
                                --testlevel RunLocalTests \
                                --targetusername $PACKAGING_ORG_ALIAS \
                                --wait 15)

# Check if the previous command executed successfully. If not, abort this script.
if [ $? -ne 0 ]; then
  echoErrorMsg "Deployment to the Packaging Org failed. Terminating script."
  exit 1
fi


# Provide a closing message telling the user where to find all the generated files.
echoScriptCompleteMsg "Deployment of MDAPI source to the Packaging Org was successful."

exit 0
##END##