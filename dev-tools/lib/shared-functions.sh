#!/bin/sh
####################################################################################################
#
# FILENAME:     shared-functions.sh
#
# PURPOSE:      Common header file for all dev-tools scripts. Contains shared functions.
#
# DESCRIPTION:  Contains shared functions used by all of the dev-tools shell scripts.
#
# INSTRUCTIONS: This script should be sourced at the top of all dev-tools shell scripts.
#               Do not source this script manually from the command line. If you do, all of the
#               shell variables set by this script (including those from local-config.sh) will be
#               set in the user's shell, and any changes to local-config.sh may not be picked up
#               until the user manually exits their shell and opens a new one.
#
#
#### PREVENT RELOAD OF THIS LIBRARY ################################################################
#
if [ "$SFDX_FALCON_FRAMEWORK_SHELL_VARS_SET" = "true" ]; then
  # Key local config variables are already set, which means that the
  # shared-functions library was already loaded.  RETURN (not EXIT) gracefully
  # so the caller can continue as if they were the first to load this.
  return 0
fi
#
#### LOAD FIRST SET OF HELPER VARS #################################################################
#
LOCAL_CONFIG_FILE_NAME=lib/local-config.sh  # Name of the file that contains local config variables
CURRENT_STEP=1                              # Used by echoStepMsg() to indicate the current step
TOTAL_STEPS=0                               # Used by echoStepMsg() to indicate total num of steps
#
#### FUNCTION: echoErrorMsg () #####################################################################
#
echoErrorMsg () {
  tput sgr 0; tput setaf 7; tput bold;
  printf "\n\nERROR: "
  tput sgr 0; tput setaf 1;
  printf "%b\n\n" "$1"
  tput sgr 0;
}
#
#### FUNCTION: echoWarningMsg () ###################################################################
#
echoWarningMsg () {
  tput sgr 0; tput setaf 7; tput bold;
  printf "\n\nWARNING: "
  tput sgr 0;
  printf "%b\n\n" "$1"
  tput sgr 0;
}
#
#### FUNCTION: echoScriptCompleteMsg () ############################################################
#
echoScriptCompleteMsg () {
  tput sgr 0; tput setaf 7; tput bold;
  printf "\n\nScript Complete: "
  tput sgr 0;
  printf "%b\n\n" "$1"
  tput sgr 0;
}
#
#### FUNCTION: resetStepMsgCounter () ##############################################################
#
resetStepMsgCounter () {
  CURRENT_STEP=1
  TOTAL_STEPS=$1
}
#
#### FUNCTION: echoStepMsg () ######################################################################
#
echoStepMsg () {
  tput sgr 0; tput setaf 7; tput bold;
  printf "\nStep $CURRENT_STEP of $TOTAL_STEPS:"
  tput sgr 0;
  printf " %b\n\n" "$1"
  tput sgr 0;
  let CURRENT_STEP++
}
#
#### FUNCTION: confirmScriptExecution ##############################################################
#
confirmScriptExecution () {
  echo "`tput rev`$1`tput sgr0`"
  read -p "(type YES to confirm, or hit ENTER to cancel) " CONFIRM_EXECUTION
  if [ "$CONFIRM_EXECUTION" != "YES" ]; then
    echo "\nScript aborted\n"
    exit 0
  fi
  echo ""
}
#
#### LOAD PROJECT VARIABLES ########################################################################
#
# Load local configuration variables from local-config.sh.  If the developer has not created a
# local-config.sh file in the same directory where this script resides (typically "dev-tools")
# then EXIT from the shell script with an error message. 
#
if [ ! -r `dirname $0`/$LOCAL_CONFIG_FILE_NAME ]; then
  echoErrorMsg "Local dev-tools configuration file not found"
  tput sgr 0; tput bold;
  echo "Please create a local-config.sh file in your dev-tools folder by copying"
  echo "local-config-template.sh and customizing it with your local settings\n"
  exit 1
fi
#
# The local-config.sh file was found and is readable. Source (execute) it the current shell process.
# This will make all the variables defined in local-config.sh available to all commands that come
# after it in this shell.
#
source `dirname $0`/$LOCAL_CONFIG_FILE_NAME
#
#### FUNCTION: ????? () ############################################################################
#



##END##