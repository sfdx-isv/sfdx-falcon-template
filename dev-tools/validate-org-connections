#!/bin/bash
####################################################################################################
#
# FILENAME:     validate-org-connections.sh
#
# PURPOSE:      ##ADD_PURPOSE_HERE##
#
# DESCRIPTION:  ##ADD_DESCRIPTIION_HERE##
#
# INSTRUCTIONS: Execute the following command relative to your project's root directory:  
#               . ./dev-tools/validate-org-connections.sh
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
confirmScriptExecution "Do you want to validate the org connections required by this project?"
#
#
#### CREATE LOCAL VARIABLES ########################################################################
#
# No local variables are used by this script.
#
#
#### WALK THE USER THROUGH WEB AUTH FOR ALL REQUIRED PROJECT ORGS  #################################
#
# 0. Reset the Step Message counter and set the TOTAL STEPS to 3.
resetStepMsgCounter 3


# 1. Validate the expected alias and connection to the Dev Hub by showing limits from that org.
echoStepMsg "Validate connection and available limits of the org with the $DEV_HUB_ALIAS alias"
(cd $PROJECT_ROOT && exec sfdx force:org:display \
                                --targetusername $DEV_HUB_ALIAS \
                                --loglevel error)

# If the previous command completed successfully, it means that there is an
# alias configured for this org. Validate the connection by displaying the org limits.
if [ $? -eq 0 ]; then
  echo "\n=== Org Limits\n"
  (cd $PROJECT_ROOT && exec sfdx force:limits:api:display \
                                  --targetusername $DEV_HUB_ALIAS \
                                  --loglevel error)  
fi


# 2. Validate the expected alias and connection to the Packaging Org by showing limits from that org.
echoStepMsg "Validate connection and available limits of the org with the $PACKAGING_ORG_ALIAS alias"
(cd $PROJECT_ROOT && exec sfdx force:org:display \
                                --targetusername $PACKAGING_ORG_ALIAS \
                                --loglevel error)

# If the previous command completed successfully, it means that there is an
# alias configured for this org. Validate the connection by displaying the org limits.
if [ $? -eq 0 ]; then
  echo "\n=== Org Limits\n"
  (cd $PROJECT_ROOT && exec sfdx force:limits:api:display \
                                  --targetusername $PACKAGING_ORG_ALIAS \
                                  --loglevel error)  
fi


# 3. Validate the expected alias and connection to the Subscriber Sandbox Org by showing limits from that org.
echoStepMsg "Validate connection and available limits of the org with the $SUBSCRIBER_SANDBOX_ALIAS alias"
(cd $PROJECT_ROOT && exec sfdx force:org:display \
                                --targetusername $SUBSCRIBER_SANDBOX_ALIAS \
                                --loglevel error)

# If the previous command completed successfully, it means that there is an
# alias configured for this org. Validate the connection by displaying the org limits.
if [ $? -eq 0 ]; then
  echo "\n=== Org Limits\n"
  (cd $PROJECT_ROOT && exec sfdx force:limits:api:display \
                                  --targetusername $SUBSCRIBER_SANDBOX_ALIAS \
                                  --loglevel error)  
fi
#
#
#### ECHO CLOSING MESSAGE ##########################################################################
#
echoScriptCompleteMsg \
"Validation of org connections complete. If your are missing 
any aliases you can run setup-project-org-auth to re-authenticate."

##END##