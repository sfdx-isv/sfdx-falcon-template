#!/bin/bash
####################################################################################################
#
# FILENAME:     setup-project-org-auth
#
# PURPOSE:      ##ADD_PURPOSE_HERE##
#
# DESCRIPTION:  ##ADD_DESCRIPTIION_HERE##
#
# INSTRUCTIONS: Execute the following command from the root of your SFDX project directory.
#               ./dev-tools/setup-project-org-auth
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
confirmScriptExecution "Do you want to setup org authentication/aliases for this project?"
#
#
#### WALK THE USER THROUGH WEB AUTH FOR ALL REQUIRED PROJECT ORGS  #################################
#
# 0. Reset the Step Message counter and set the TOTAL STEPS to 3.
resetStepMsgCounter 3


# 1. Setup authentication for this project's Dev Hub.
echoStepMsg "Setup authentication for this project's Dev Hub"

echo "`tput bold`Do you want set/replace the auth info for the $DEV_HUB_ALIAS alias?`tput sgr0`"
read -p "(type YES to confirm, or hit ENTER to cancel) " CONFIRM_EXECUTION
if [ "$CONFIRM_EXECUTION" = "YES" ]; then
  echo "\nWeb authentication in progress using default browser. Press CTRL+C to cancel.\n"
  (cd $PROJECT_ROOT && exec sfdx force:auth:web:login \
                                  --setalias $DEV_HUB_ALIAS \
                                  --setdefaultdevhubusername \
                                  --instanceurl https://login.salesforce.com \
                                  --loglevel error)
  # Check if the previous command executed successfully. If not, either due to user 
  # hitting CTRL+C or the call timing out, show the user a message.
  if [ $? -ne 0 ]; then
    echoWarningMsg "The web authentication request was canceled (or timed out)."
  fi
fi


# 2. Setup authentication for this project's Packaging Org.
echoStepMsg "Setup authentication for this project's Packaging Org"

echo "`tput bold`Do you want set/replace the auth info for the $PACKAGING_ORG_ALIAS alias?`tput sgr0`"
read -p "(type YES to confirm, or hit ENTER to cancel) " CONFIRM_EXECUTION
if [ "$CONFIRM_EXECUTION" = "YES" ]; then
  echo "\nWeb authentication in progress using default browser. Press CTRL+C to cancel.\n"
  (cd $PROJECT_ROOT && exec sfdx force:auth:web:login \
                                  --setalias $PACKAGING_ORG_ALIAS \
                                  --instanceurl https://login.salesforce.com \
                                  --loglevel error)
  # Check if the previous command executed successfully. If not, either due to user 
  # hitting CTRL+C or the call timing out, show the user a message.
  if [ $? -ne 0 ]; then
    echoWarningMsg "The web authentication request was canceled (or timed out)."
  fi
fi


# 3. Setup authentication for this project's Subscriber Sandbox Org.
echoStepMsg "Setup authentication for this project's Subscriber Sandbox Org"

echo "`tput bold`Do you want set/replace the auth info for the $SUBSCRIBER_SANDBOX_ALIAS alias?`tput sgr0`"
read -p "(type YES to confirm, or hit ENTER to cancel) " CONFIRM_EXECUTION
if [ "$CONFIRM_EXECUTION" = "YES" ]; then
  echo "\nWeb authentication in progress using default browser. Press CTRL+C to cancel.\n"
  (cd $PROJECT_ROOT && exec sfdx force:auth:web:login \
                                  --setalias $SUBSCRIBER_SANDBOX_ALIAS \
                                  --instanceurl https://test.salesforce.com \
                                  --loglevel error)
  # Check if the previous command executed successfully. If not, either due to user 
  # hitting CTRL+C or the call timing out, show the user a message.
  if [ $? -ne 0 ]; then
    echoWarningMsg "The web authentication request was canceled (or timed out)."
  fi
fi
#
#
#### ECHO CLOSING MESSAGE ##########################################################################
#
echoScriptCompleteMsg \
"All requested authentication attempts are complete. Run validate-org-connections 
to confirm that all org authentications required by this project are properly configured."

# 
source `dirname $0`/validate-org-connections

##END##