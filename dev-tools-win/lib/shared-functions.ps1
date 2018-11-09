#!/bin/bash
####################################################################################################
#
# FILENAME:     shared-functions.ps1
#
# PURPOSE:      Common header file for all dev-tools-win scripts. Contains shared functions.
#
# DESCRIPTION:  Contains shared functions used by all of the dev-tools-win shell scripts.
#
# INSTRUCTIONS: This script should be sourced at the top of all dev-tools-win shell scripts.
#               Do not source this script manually from the command line. If you do, all of the
#               shell variables set by this script (including those from local-config.ps1) will be
#               set in the user's shell, and any changes to local-config.ps1 may not be picked up
#               until the user manually exits their shell and opens a new one.
#
#
####################################################################################################
#
##
###
#### PREVENT RELOAD OF THIS LIBRARY ################################################################
###
##
#
$global:PROJECT_ROOT=""                                       # Path to the root of this SFDX project
$global:LOCAL_CONFIG_FILE_NAME="dev-tools-win/lib/local-config.ps1"# Name of the file that contains local config variables
$global:CURRENT_STEP=1                                        # Used by echoStepMsg() to indicate the current step
$global:TOTAL_STEPS=0                                         # Used by echoStepMsg() to indicate total num of steps
$global:CURRENT_QUESTION=1                                    # Used by echoQuestion() to indicate the current question
$global:TOTAL_QUESTIONS=1                                     # Used by echoQuestion() to indicate total num of questions

if ("$SFDX_FALCON_FRAMEWORK_SHELL_VARS_SET" -eq "true" ){
  # The SFDX_FALCON_FRAMEWORK_SHELL_VARS_SET variable is defined as part of 
  # this project's local configuration script (local-config.ps1).  If this 
  # variable holds the string "true" then it means that local-config.ps1 has
  # already been sourced (loaded).  Since this is exactly what THIS script
  # (shared-functions.ps1) is supposed to do it means that this library has
  # already been loaded.  
  #
  # We DO NOT want to load shared-functions.ps1 a second time, so we'll RETURN
  # (not EXIT) gracefully so the caller can continue as if they were the
  # first to load this.
  return 0
}
#
##
###
#### FUNCTION: askUserForStringValue ###############################################################
###
##
#
function askUserForStringValue ($a, $b, $c) {
  # If a second argument was provided, echo its
  # value before asking the user for input.
  if ( "$b" -ne "" ){
    echo $b "\n"
  }

  # Create a local variable to store the value of 
  # the variable provided by the first argument.
  $LOCAL_VALUE= $a

  # Create a local variable to store the default error message.
  $LOCAL_ERROR_MSG="You must provide a value at the prompt."

  # Do not allow the user to continue unless they 
  # provide a value when prompted.
  while ( "$LOCAL_VALUE" -eq "" ){
    #eval "read -p \"$a: \" $a"
    $a = Read-Host -Prompt "$a"
    #eval "LOCAL_VALUE=\$$a"
    $LOCAL_VALUE= $a

    if ( "$LOCAL_VALUE" -eq "" ){
      # If the caller specified a custom error message, use it.
      if ( "$c" -ne "" ){
        $LOCAL_ERROR_MSG= $c
      }
      echoErrorMsg("$LOCAL_ERROR_MSG")
    }
  }
}
#
##
###
#### FUNCTION: confirmChoice #######################################################################
###
##
#
function confirmChoice ($a, $b, $c) {
  # Local variable will store the user's response.
  #local USER_RESPONSE=""
  $USER_RESPONSE=""
  # Show the question being asked.
  echo "$b"
  # Prompt the user for a response and read their input.
  #read -p "$3" USER_RESPONSE
  $USER_RESPONSE = Read-Host -Prompt "$c"
  # Save the user's response to the variable provided by the caller.
  #eval "$a=\"$USER_RESPONSE\""
  $a = $USER_RESPONSE
  # Add a line break
  echo ""
}
#
##
###
#### FUNCTION: confirmScriptExecution ##############################################################
###
##
#
function confirmScriptExecution ($a) {
  echo "$a"
  #read -p "(type YES to confirm, or hit ENTER to cancel) " CONFIRM_EXECUTION
  $CONFIRM_EXECUTION = Read-Host -Prompt "(type YES to confirm, or hit ENTER to cancel) "
  if ( "$CONFIRM_EXECUTION" -ne "YES" ){
    echo "\nScript aborted\n"
    exit 0
  }
  echo ""
}
#
##
###
#### FUNCTION: echoConfigVariables () ##############################################################
###
##
#
function echoConfigVariables () {
  echo ""
  echo "PROJECT_ROOT --------------> " $PROJECT_ROOT
  echo "NAMESPACE_PREFIX ----------> " $NAMESPACE_PREFIX
  echo "PACKAGE_NAME --------------> " $PACKAGE_NAME
  echo "DEFAULT_PACKAGE_DIR_NAME --> " $DEFAULT_PACKAGE_DIR_NAME
  echo "DEV_HUB_ALIAS -------------> " $DEV_HUB_ALIAS
  echo "SCRATCH_ORG_ALIAS ---------> " $SCRATCH_ORG_ALIAS
  echo "PACKAGING_ORG_ALIAS -------> " $PACKAGING_ORG_ALIAS
  echo "SUBSCRIBER_ORG_ALIAS ------> " $SUBSCRIBER_ORG_ALIAS
  echo "METADATA_PACKAGE_ID -------> " $METADATA_PACKAGE_ID
  echo "PACKAGE_VERSION_ID --------> " $PACKAGE_VERSION_ID
  echo "SCRATCH_ORG_CONFIG --------> " $SCRATCH_ORG_CONFIG
  echo "GIT_REMOTE_URI ------------> " $GIT_REMOTE_URI
  echo "ECHO_LOCAL_CONFIG_VARS ----> " $ECHO_LOCAL_CONFIG_VARS
  echo ""
}
#
##
###
#### FUNCTION: echoErrorMsg () #####################################################################
###
##
#
function echoErrorMsg ($a) {
  
  echo "ERROR: "
  
  echo "" "$a"

}
#
##
###
#### FUNCTION: echoQuestion () #####################################################################
###
##
#
function echoQuestion ($a) {
  
  echo "\nQuestion $CURRENT_QUESTION of $TOTAL_QUESTIONS :" 
  echo " " "$a"
  
  $global:CURRENT_QUESTION = $CURRENT_QUESTION + 1
}
#
##
###
#### FUNCTION: echoScriptCompleteMsg ($a) ############################################################
###
##
#
function echoScriptCompleteMsg ($a) {
  #tput sgr 0; tput setaf 7; tput bold;
  echo "Script Complete: "
  #tput sgr 0;
  echo "" "$a"
  #tput sgr 0;
}
#
##
###
#### FUNCTION: echoStepMsg ($a) ######################################################################
###
##
#
function echoStepMsg ($a) {
  #tput sgr 0; tput setaf 7; tput bold;
  echo "Step $CURRENT_STEP of $TOTAL_STEPS :"
  #tput sgr 0;
  echo " " "$a"
  #tput sgr 0;
  $global:CURRENT_STEP = $global:CURRENT_STEP + 1
}
#
##
###
#### FUNCTION: echoWarningMsg ($a) ###################################################################
###
##
#
function echoWarningMsg ($a) {
  #tput sgr 0; tput setaf 7; tput bold;
  echo "WARNING: "
  #tput sgr 0;
  echo "" "$a"
  #tput sgr 0;
}
#
##
###
#### FUNCTION: findProjectRoot () ##################################################################
###
##
#
function findProjectRoot () {
  # Detect the path to the directory that the running script was called from.
  #local PATH_TO_RUNNING_SCRIPT="$( cd "$(dirname "$0")" ; pwd -P )"

  # Grab the last 10 characters of the detected path.  This should be "/dev-tools".
  #local DEV_TOOLS_SLICE=${PATH_TO_RUNNING_SCRIPT: -10} 

  # Make sure the last 10 chars of the path are "/dev-tools".  
  # Kill the script with an error if not.
  #if [[ $DEV_TOOLS_SLICE -ne "/dev-tools" ]]; then
  #  echoErrorMsg "Script was not executed within the <project-root>/dev-tools directory."
  #  tput sgr 0; tput bold;
  #  echo "Shell scripts that utilize FALCON Developer Tools must be executed from"
  #  echo "inside the dev-tools directory found at the root of your SFDX project.\n"
  #  exit 1
  #fi

  # Calculate the Project Root path by going up one level from the path currently
  # held in the PATH_TO_RUNNING_SCRIPT variable
  #local PATH_TO_PROJECT_ROOT="$( cd "$PATH_TO_RUNNING_SCRIPT" ; cd .. ; pwd -P )"

  # Pass the value of the "detected path" back out to the caller by setting the
  # value of the first argument provided when the function was called.
  #eval "$1=\"$PATH_TO_PROJECT_ROOT\""
  return Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
}
#
##
###
#### FUNCTION: initializeHelperVariables () ########################################################
###
##
#
function initializeHelperVariables () {
  $global:PROJECT_ROOT=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent                                       # Path to the root of this SFDX project
  $global:LOCAL_CONFIG_FILE_NAME="dev-tools-win/lib/local-config.ps1"# Name of the file that contains local config variables
  $global:CURRENT_STEP=1                                        # Used by echoStepMsg() to indicate the current step
  $global:TOTAL_STEPS=0                                         # Used by echoStepMsg() to indicate total num of steps
  $global:CURRENT_QUESTION=1                                    # Used by echoQuestion() to indicate the current question
  $global:TOTAL_QUESTIONS=1                                     # Used by echoQuestion() to indicate total num of questions

  # Call findProjectRoot() to dynamically determine
  # the path to the root of this SFDX project
  #findProjectRoot PROJECT_ROOT
}
#
##
###
#### FUNCTION: resetQuestionCounter () #############################################################
###
##
#
function resetQuestionCounter ($a) {
  $global:CURRENT_QUESTION=1
  $global:TOTAL_QUESTIONS=$a
}
#
##
###
#### FUNCTION: resetStepMsgCounter () ##############################################################
###
##
#
function resetStepMsgCounter ($a) {
  $global:CURRENT_STEP=1
  $global:TOTAL_STEPS=$a
}
#
##
###
#### FUNCTION: showPressAnyKeyPrompt ###############################################################
###
##
#
function showPressAnyKeyPrompt () {
  #read -n 1 -sr -p "-- Press any Key to Continue --"
  $CONFIRM_EXECUTION = Read-Host -Prompt "-- Press any Key to Continue --"
}
#
##
###
#### FUNCTION: suggestDefaultValue #################################################################
###
##
#
function suggestDefaultValue ($a,$b) {
  # Make sure a value was provided for the 
  # second argument of this function.
  if ( "$b" -eq  "" ){
    echoErrorMsg "You must provide two arguments to suggestDefaultValue.  Terminating script."
    exit 1
  }


  # Create local variables to store the value of 
  # the variable provided by the first argument and the
  # value of the second argument (proposed default)
  #eval "local LOCAL_VALUE=\$$1"
  $LOCAL_VALUE=$a
  #eval "local LOCAL_DEFAULT=\"$2\""
  $LOCAL_DEFAULT=$b
  
  # Set a defualt prompt message in case one is not provided.
  $INTERNAL_USER_PROMPT="Would you like to accept the following default value?"

  # If the caller supplied a third argument, it means they want
  # a specific message to be shown before accepting the default.
  # If they did now, we will use owr own "default" message.
  if ( $3 -ne $null ){
    $INTERNAL_USER_PROMPT="$3"
  }

  # Show prompt and display what the default var assignment would be.
  echo $INTERNAL_USER_PROMPT
  echo "\n"$a=$LOCAL_DEFAULT"\n"

  # Ask user to confirm or reject the proposed value.
  #read -p "(type YES to accept,  NO to provide a different value) " CONFIRM_EXECUTION
  $CONFIRM_EXECUTION = Read-Host -Prompt "(type YES to confirm, or hit ENTER to cancel) "
  if ("$CONFIRM_EXECUTION" -ne "YES" ){
    return 1
  }

  # Store the value from arg 2 into arg 1, basically
  # using the "default" value for the main value.
  #eval "$1=\"$2\""
  $a = $b;

  return 0
}
#
##
###
#### BEGIN MAIN EXECUTION BLOCK ####################################################################
###
##
#
# INITIALIZE HELPER VARIABLES
initializeHelperVariables

# CHECK IF LOCAL CONFIG SHOULD BE SUPPRESSED.
# If $SUPPRESS_LOCAL_CONFIG has been set to "true" DO NOT load the local configuration
# variables.  A script that includes shared-functions.ps1 can set this variable to 
# force this behavior (dev-tools/setup-core-project for example).
if ("$SUPPRESS_LOCAL_CONFIG" -eq "true" ) {
  # Comment out the following line unless you're debugging setup-core-project.
  # echo "Local dev-tools configuration (local-config.ps1) has been suppressed"
  return 0
}

# CHECK IF LOCAL CONFIG FILE EXISTS
# Look for the local config variables script local-config.ps1.  If the developer has not created a
# local-config.ps1 file in dev-tools/lib then EXIT from the shell script with an error message. 
if (Test-Path "$PROJECT_ROOT/$LOCAL_CONFIG_FILE_NAME" ) {  
}
else{
  echo "$PROJECT_ROOT/$LOCAL_CONFIG_FILE_NAME"
  echoErrorMsg "Local dev-tools configuration file not found"
  #tput sgr 0; tput bold;
  echo "Please create a local-config.ps1 file in your dev-tools/lib directory by copying"
  echo "dev-tools/templates/local-config-template.ps1 and customizing it with your local settings\n"
  return 
}

# LOAD THE LOCAL CONFIG VARIABLES
# The local-config.ps1 file was found and is readable. Source (execute) it the current shell process.
# This will make all the variables defined in local-config.ps1 available to all commands that come
# after it in this shell.
. "$PROJECT_ROOT/$LOCAL_CONFIG_FILE_NAME"
# MARK THAT LOCAL CONFIG VARIABLES HAVE BEEN SET.
# Indicates that local config variables have been successfully set. 
$SFDX_FALCON_FRAMEWORK_SHELL_VARS_SET="true"
##END##