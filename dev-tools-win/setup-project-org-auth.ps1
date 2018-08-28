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
confirmScriptExecution 'Do you want to setup org authentication/aliases for this project?'
#
#
#### WALK THE USER THROUGH WEB AUTH FOR ALL REQUIRED PROJECT ORGS  #################################
#
# 0. Reset the Step Message counter and set the TOTAL STEPS to 3.
resetStepMsgCounter 3


# 1. Setup authentication for this project's Dev Hub.
echoStepMsg 'Setup authentication for this projects Dev Hub'

Write-Output "Do you want set/replace the auth info for the $DEV_HUB_ALIAS alias?"
$CONFIRM_EXECUTION = Read-Host -Prompt "(type YES to confirm, or hit ENTER to cancel) "
if ( "$CONFIRM_EXECUTION" -eq 'YES' ) {
  Write-Output 'Web authentication in progress using default browser. Press CTRL+C to cancel.'
  (Set-Location $PROJECT_ROOT) 
  if($? -ne 0){
    sfdx force:auth:web:login `
      --setalias $DEV_HUB_ALIAS `
      --setdefaultdevhubusername `
      --instanceurl https://login.salesforce.com `
      --loglevel error
  }
  # Check if the previous command executed successfully. If not, either due to user 
  # hitting CTRL+C or the call timing out, show the user a message.
  if ( $? -ne 0 ){
    echoWarningMsg 'The web authentication request was canceled (or timed out).'
  }
}


# 2. Setup authentication for this project's Packaging Org.
echoStepMsg 'Setup authentication for this projects Packaging Org'

Write-Output "Do you want set/replace the auth info for the $PACKAGING_ORG_ALIAS alias?"
$CONFIRM_EXECUTION = Read-Host -Prompt "(type YES to confirm, or hit ENTER to cancel) "
if ( "$CONFIRM_EXECUTION" -eq 'YES' ){
  Write-Output 'Web authentication in progress using default browser. Press CTRL+C to cancel.'
  (Set-Location $PROJECT_ROOT) 
  if($? -ne 0){ 
    sfdx force:auth:web:login `
      --setalias $PACKAGING_ORG_ALIAS `
      --instanceurl https://login.salesforce.com `
      --loglevel error
  }
  # Check if the previous command executed successfully. If not, either due to user 
  # hitting CTRL+C or the call timing out, show the user a message.
  if ( $? -ne 0 ){
    echoWarningMsg 'The web authentication request was canceled (or timed out).'
}
}


# 3. Setup authentication for this project's Subscriber Sandbox Org.
echoStepMsg 'Setup authentication for this projects Subscriber Sandbox Org'

Write-Output "Do you want set/replace the auth info for the $SUBSCRIBER_SANDBOX_ALIAS alias?"
$CONFIRM_EXECUTION = Read-Host -Prompt "(type YES to confirm, or hit ENTER to cancel) "
if ("$CONFIRM_EXECUTION" -eq 'YES') {
  Write-Output 'Web authentication in progress using default browser. Press CTRL+C to cancel.'
  (Set-Location $PROJECT_ROOT) 
  if($? -ne 0){
    sfdx force:auth:web:login `
      --setalias $SUBSCRIBER_SANDBOX_ALIAS `
      --instanceurl https://login.salesforce.com `
      --loglevel error
  }
  # Add this back if you need to have real sandbox for test --instanceurl https://test.salesforce.com `
  # Check if the previous command executed successfully. If not, either due to user 
  # hitting CTRL+C or the call timing out, show the user a message.
  if ( $? -ne 0 ){
    echoWarningMsg 'The web authentication request was canceled (or timed out).'
  } 
}
#
#
#### Write-Output CLOSING MESSAGE ##########################################################################
#
echoScriptCompleteMsg('All requested authentication attempts are complete. Run validate-org-connections 
to confirm that all org authentications required by this project are properly configured.')

# Todo 
#source `dirname $0`/validate-org-connections
. "$PROJECT_ROOT/dev-tools-win/validate-org-connections.ps1"
##END##