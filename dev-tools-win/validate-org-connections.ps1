#!/bin/bash
####################################################################################################
#
# FILENAME:     validate-org-connections.ps1
#
# PURPOSE:      ##ADD_PURPOSE_HERE##
#
# DESCRIPTION:  ##ADD_DESCRIPTIION_HERE##
#
# INSTRUCTIONS: Execute the following command relative to your project's root directory:  
#               . ./dev-tools/validate-org-connections.ps1
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
    Write-Output "FATAL ERROR: Could not load $PROJECT_ROOT/dev-tools-win/lib/shared-functions.ps1.  File not found."
    return
}
#. '/lib/shared-functions.ps1'
. "$PROJECT_ROOT/dev-tools-win/lib/shared-functions.ps1"
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
(Set-Location $PROJECT_ROOT) 
if($? -ne 0){ 
  sfdx force:org:display `
    --targetusername $DEV_HUB_ALIAS `
    --loglevel error
}

# If the previous command completed successfully, it means that there is an
# alias configured for this org. Validate the connection by displaying the org limits.
if ( $? -eq 0 ) {
  echo "=== Org Limits"
   (Set-Location $PROJECT_ROOT) 
  if($? -ne 0) { 
    sfdx force:limits:api:display `
      --targetusername $DEV_HUB_ALIAS `
      --loglevel error
  }  
}


# 2. Validate the expected alias and connection to the Packaging Org by showing limits from that org.
echoStepMsg "Validate connection and available limits of the org with the $PACKAGING_ORG_ALIAS alias"
(Set-Location $PROJECT_ROOT) 
if ($? -ne 0) { 
    sfdx force:org:display `
        --targetusername $PACKAGING_ORG_ALIAS `
        --loglevel error
}

# If the previous command completed successfully, it means that there is an
# alias configured for this org. Validate the connection by displaying the org limits.
if ( $? -eq 0 ) {
    echo "=== Org Limits"
    (Set-Location $PROJECT_ROOT) 
    if ($? -ne 0) { 
        sfdx force:limits:api:display `
            --targetusername $PACKAGING_ORG_ALIAS `
            --loglevel error
    }  
}


# 3. Validate the expected alias and connection to the Subscriber Sandbox Org by showing limits from that org.
echoStepMsg "Validate connection and available limits of the org with the $SUBSCRIBER_SANDBOX_ALIAS alias"
(Set-Location $PROJECT_ROOT) 
if ($? -ne 0) { 
    sfdx force:org:display `
        --targetusername $SUBSCRIBER_SANDBOX_ALIAS `
        --loglevel error
}

# If the previous command completed successfully, it means that there is an
# alias configured for this org. Validate the connection by displaying the org limits.
if ( $? -eq 0 ) {
    echo "=== Org Limits"
    (Set-Location $PROJECT_ROOT) 
    if ($? -ne 0) { 
        sfdx force:limits:api:display `
            --targetusername $SUBSCRIBER_SANDBOX_ALIAS `
            --loglevel error
    }  
}
#
#
#### ECHO CLOSING MESSAGE ##########################################################################
#
echoScriptCompleteMsg \
"Validation of org connections complete. If your are missing 
any aliases you can run setup-project-org-auth to re-authenticate."

##END##