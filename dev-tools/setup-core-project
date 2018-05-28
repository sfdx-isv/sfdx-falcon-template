#!/bin/bash
####################################################################################################
#
# FILENAME:     setup-core-project
#
# PURPOSE:      Guides a release manager through the process of setting up this project.
#
# DESCRIPTION:  When a Salesforce DX project is first created from the SFDX-Falcon template, the
#               first thing a release manager must do is customize the environment variables in
#               the local-config-template.sh file to reflect specific choices for their project.  
#
#               These variables must be set properly to ensure that SFDX-Falcon dev-tools scripts
#               work correctly when individaul developers clone the project's repository and 
#               initialize it for development in their local environment.
#
# INSTRUCTIONS: Execute the following command from inside your project's root directory:  
#               ./dev-tools/setup-core-project
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
# Suppress the load of LOCAL_CONFIG variables.  If you don't do this
# the script will error out because it's very likely that there is no
# local-config.sh file when this script is being executed.
SUPPRESS_LOCAL_CONFIG="true"

# Load shared functions library.
if [ ! -r `dirname $0`/lib/shared-functions.sh ]; then
  echo "\nFATAL ERROR: `tput sgr0``tput setaf 1`Could not load dev-tools/lib/shared-functions.sh.  File not found.\n"
  exit 1
fi
source `dirname $0`/lib/shared-functions.sh

##
#### CONFIRM SCRIPT EXECUTION ######################################################################
##
echoWarningMsg "This script should only be run by your team's Release Manager or Lead Developer. \n
`tput setaf 7`IMPORTANT:`tput sgr0` If you are a developer and need to initialize this project for your local
environment you should abort this script and run dev-tools/initialize-project instead."

confirmScriptExecution "Do you want to start the project setup wizard?"
#
#
#### CREATE LOCAL VARIABLES ########################################################################
#
# Initialize to FALSE. Remains false until the user accepts config vars.
CONFIG_VARS_ACCEPTED="false"

# Use the findProjectRoot function to detect the current Project Root.
DETECTED_PROJECT_ROOT=""
findProjectRoot DETECTED_PROJECT_ROOT

# Set the path to the local-config template file.
LOCAL_CONFIG_TEMPLATE_FILEPATH="$DETECTED_PROJECT_ROOT/dev-tools/templates/local-config-template.sh.ejs"

# These are set during the interview process.
NAMESPACE_PREFIX=""
PACKAGE_NAME=""
METADATA_PACKAGE_ID=""
PACKAGE_VERSION_ID=""
GIT_REMOTE_URI=""
#
#
#### FUNCTION: clearConfigVariables ################################################################
#
function clearConfigVariables () {
  NAMESPACE_PREFIX=""
  PACKAGE_NAME=""
  METADATA_PACKAGE_ID=""
  PACKAGE_VERSION_ID=""
  GIT_REMOTE_URI=""
}
#
#### FUNCTION: projectSetupInterview ###############################################################
#
function projectSetupInterview () {

  # Specify the total number of questions in the interview
  resetQuestionCounter 5

  #
  # QUESTION 1: Ask for the NAMESPACE_PREFIX value
  #
  echoQuestion "Specify the namespace prefix used by your package"
  askUserForStringValue NAMESPACE_PREFIX \
      "IMPORTANT: If you are not developing code for a managed package, use the following value:
      \n\nNAMESPACE_PREFIX: force-app
      \n\nIf you ARE developing for a managed package, specify the namespace here."

  #
  # QUESTION 2: Ask for the PACKAGE_NAME value
  #
  echoQuestion "Specify the name of your package"
  askUserForStringValue PACKAGE_NAME \
    "`tput bold`Important:`tput sgr0` This value must be entered exactly as specified in your packaging org.
    \nIf you do not enter this correctly, MDAPI validate/deploy scripts to packaging orgs will fail.
    \n\nYou can find the name of your package on the Package Details page in your packaging org.
    \n\nExample: My Package
    \n\n`tput bold`Note:`tput sgr0` If you are not building a package, just enter UNPACKAGED here."

  #
  # QUESTION 3: Ask for the METADATA_PACKAGE_ID value
  #
  echoQuestion "Specify the Metadata Package ID of your managed package"
  suggestDefaultValue \
      METADATA_PACKAGE_ID \
      "033000000000000" \
      "If you do not know the Metadata Package ID for your managed package, it is
      \nOK to accept the placeholder value \"033000000000000\" as suggested, below."

  if [ $? -ne 0 ]; then
    askUserForStringValue \
        METADATA_PACKAGE_ID \
        "`tput bold`\nPlease specify a value for your METADATA_PACKAGE_ID config variable.`tput sgr0`
        \n\n`tput bold`Important:`tput sgr0` Metadata Package ID values always begin with 033.
        \n\nExample: 033000000000000"
  fi

  #
  # QUESTION 4: Ask for the PACKAGE_VERSION_ID value
  #
  echoQuestion "Specify the Package Version ID of your managed package's most recent release"
  suggestDefaultValue \
      PACKAGE_VERSION_ID \
      "04t000000000000" \
      "If you do not know the Package Version ID for the most recent release of your managed
      \npackage, it is OK to accept the placeholder value \"04t000000000000\" as suggested, below."

  if [ $? -ne 0 ]; then
    askUserForStringValue \
        PACKAGE_VERSION_ID \
        "`tput bold`\nPlease specify a value for your PACKAGE_VERSION_ID config variable.`tput sgr0`
        \n\n`tput bold`Important:`tput sgr0` Package Version ID values always begin with 04t.
        \n\nExample: 04t000000000000"
  fi

  #
  # QUESTION 5: Ask for the GIT_REMOTE_URI value
  #
  echoQuestion "Specify the URI of your remote repository"
  askUserForStringValue GIT_REMOTE_URI \
    "Please specify either an SSH or HTTPS URI for the remote Git repository
    \nthat your local repo should be configured to track against.
    \n\nExample: https://github.com/MyCompany/my-remote-repo.git"

}
#
#### FUNCTION: confirmConfigVariables ##############################################################
#
function confirmConfigVariables () {
  # Final validation message
  echo "\n`tput setaf 7``tput bold`Local Configuration Variables:`tput sgr0`"

  # Show all the vars that will be set
  echoUserSuppliedConfigVars

  # Ask the user to confirm their variables.
  echo "Update dev-tools/templates/local-config-template.sh with the above values?\n"
  read -p "(type YES to accept,  NO to begin again) " CONFIRM_EXECUTION
  if [ "$CONFIRM_EXECUTION" = "YES" ]; then
    CONFIG_VARS_ACCEPTED="true"
  fi

  return 0
}
#
#### FUNCTION: echoUserSuppliedConfigVars ##########################################################
#
function echoUserSuppliedConfigVars () {
  echo ""
  echo "`tput setaf 7`NAMESPACE_PREFIX ---------->`tput sgr0` " $NAMESPACE_PREFIX
  echo "`tput setaf 7`PACKAGE_NAME -------------->`tput sgr0` " $PACKAGE_NAME
  echo "`tput setaf 7`METADATA_PACKAGE_ID ------->`tput sgr0` " $METADATA_PACKAGE_ID
  echo "`tput setaf 7`PACKAGE_VERSION_ID -------->`tput sgr0` " $PACKAGE_VERSION_ID
  echo "`tput setaf 7`GIT_REMOTE_URI ------------>`tput sgr0` " $GIT_REMOTE_URI
  echo ""
}
#
#### FUNCTION: setLocalConfigTemplateFileVariable ##################################################
#
function setLocalConfigTemplateFileVariable () {
  # Create a local variable to store the value of 
  # the variable provided by the first argument.
  local ENV_VAR_NAME=$1
  eval "local ENV_VAR_VALUE=\$$1"

  # Use PERLs in-place find-and-replace to find the key specified by
  # argument 1 (the ENV VAR) and replace it with the KEY+VALUE specified
  # by argument 2.  In other words...
  # NAMESPACE_PREFIX=SomePreviousString 
  #   becomes....
  # NAMESPACE_PREFIX="SomeNewString"
  perl -pi -e "s/^${ENV_VAR_NAME}=.*/${ENV_VAR_NAME}=\"${ENV_VAR_VALUE}\"/g;" "$LOCAL_CONFIG_TEMPLATE_FILEPATH"

}
#
#### FUNCTION: updateProjectFiles ##################################################################
#
function updateSfdxProjectJson () {
  # Use PERLs in-place find-and-replace to modify the line in 
  # sfdx-project.json where the default package directory is set
  # by argument 1.  In other words...
  #     { "path": "sfdx-source/my_ns_prefix", "default": true },
  #   becomes....
  #     { "path": "sfdx-source/new_ns_prefix_value", "default": true },
  perl -pi -e "s#.*\"default\": true.*#    { \"path\": \"sfdx-source/${1}\", \"default\": true },#g;" "$DETECTED_PROJECT_ROOT/sfdx-project.json"

  # If the namespace provided is "force-app", delete the line in
  # sfdx-project.json where the "namespace" key-value pair is set.
  # If we find this, return from the function immediately.
  if [ "${1}" = "force-app" ]; then
    perl -ni -e "/.*\"namespace\":.*/ || print" "$DETECTED_PROJECT_ROOT/sfdx-project.json"
    return 0
  fi

  # Use the same PERL mechanism to modify the "namespace" key-value pair.  Example...
  #     "namespace": "my_ns_prefix",
  #   becomes...
  #     "namespace": "new_ns_prefix_value",
  perl -pi -e "s#.*\"namespace\":.*#  \"namespace\": \"${1}\",#g;" "$DETECTED_PROJECT_ROOT/sfdx-project.json"  

}
#
#### FUNCTION: updateProjectFiles ##################################################################
#
function updateProjectFiles () {
  # Prep the GIT_REMOTE_URI values to make sure we escape forward slashes
  # that are likely present in the paths stored by those vars.
  GIT_REMOTE_URI="${GIT_REMOTE_URI//\//\/}"

  # Write the values discovered during the Setup Interview to the 
  # local-config-template.sh file.  Note that we're passing the names
  # of the variables rather than their values.  This is intentional and
  # lets the function find the right line to modify in local-config-template.sh
  setLocalConfigTemplateFileVariable NAMESPACE_PREFIX
  setLocalConfigTemplateFileVariable PACKAGE_NAME
  setLocalConfigTemplateFileVariable METADATA_PACKAGE_ID
  setLocalConfigTemplateFileVariable PACKAGE_VERSION_ID
  setLocalConfigTemplateFileVariable GIT_REMOTE_URI

  # Update sfdx-project.json with the value specified in NAMESPACE_PREFIX
  updateSfdxProjectJson $NAMESPACE_PREFIX
}

####################################################################################################
## MAIN EXECUTION BODY
####################################################################################################
#
# Launch the Project Setup Interview.  If the user does not accept the list of
# config variables that 
while [ "$CONFIG_VARS_ACCEPTED" != "true" ]; do
  clearConfigVariables
  projectSetupInterview
  confirmConfigVariables
done

# If we get here, it means that the user has specified values for all of the
# environment variables and confirmed that they are the ones that should be
# saved to local-config-template.sh.  Now we need to make that happen.
updateProjectFiles

####################################################################################################
## CLOSING MESSAGE
####################################################################################################
#
# Echo the closing message.
echoScriptCompleteMsg  "SFDX-Falcon project setup complete. \n
`tput setaf 7`IMPORTANT:`tput sgr0` Commit and push dev-tools/templates/local-config-template.sh to your VCS to ensure
that your developers can initialize their projects using the values you've specified."

##END##