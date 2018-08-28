#!/bin/bash
####################################################################################################
#
# FILENAME:     rebuild-scratch-org
#
# PURPOSE:      Deletes then recreates a scratch org based on the SFDX source in this project.
#
# DESCRIPTION:  Executing this script will first delete the exisisting default scratch org for
#               this project (if it exists), then create a new one using the source and config
#               information defined in your dev-tools/lib/local-config.sh file.
#
# INSTRUCTIONS: Execute the following command from the root of your SFDX project directory.
#               ./dev-tools/rebuild-scratch-org
#
####################################################################################################
#
##
###
#### LOAD SHARED FUNCTIONS LIBRARY #################################################################
###
##
#
# Make sure that the shared-functions.sh script exists.
$PROJECT_ROOT = (Split-Path $PSScriptRoot -Parent)
if (Test-Path "$PROJECT_ROOT/dev-tools-win/lib/shared-functions.ps1") {}
else{
    Write-Output "FATAL ERROR: Could not load $PROJECT_ROOT/dev-tools-win/lib/shared-functions.ps1.  File not found."
    return
}
#. '/lib/shared-functions.ps1'
. "$PROJECT_ROOT/dev-tools-win/lib/shared-functions.ps1"
#
##
###
#### CONFIRM SCRIPT EXECUTION ######################################################################
###
##
#
confirmScriptExecution "Do you want to rebuild your scratch org?"
#
##
###
#### CREATE LOCAL VARIABLES ########################################################################
###
##
#
# The default version of this script does not require additional local
# variables.  If your customized script does require them, this is where
# you would define and initialize them.
#
##
###
#### FUNCTION: assignPermset () ####################################################################
###
##
#
function assignPermset ($a) {
  # Assign permission sets to the scratch org's Admin user.
  echoStepMsg "Assign the $a permission set to the scratch org's Admin user"
  echo `
  "Executing force:user:permset:assign --permsetname "$a" --targetusername $SCRATCH_ORG_ALIAS --loglevel error"
  (Set-Location $PROJECT_ROOT) 
  if($? -ne 0){
    sfdx force:user:permset:assign `
      --permsetname "$a" `
      --targetusername $SCRATCH_ORG_ALIAS `
      --loglevel error
  }
  if ( $? -ne 'TRUE' ){
    echoErrorMsg "Permission set `"$a`" could not be assigned to the admin user. Aborting Script."
    exit 1
  }
}
#
##
###
#### FUNCTION: createScratchOrg () #################################################################
###
##
#
function createScratchOrg() {
  # Create a new scratch org using the scratch-def.json locally configured for this project. 
  echoStepMsg "Create a new $SCRATCH_ORG_ALIAS scratch org"
  echo "Executing force:org:create -f $SCRATCH_ORG_CONFIG -a $SCRATCH_ORG_ALIAS -v $DEV_HUB_ALIAS -s -d 30"
  (Set-Location $PROJECT_ROOT) 
  if($? -ne 0){
    sfdx force:org:create -f $SCRATCH_ORG_CONFIG -a $SCRATCH_ORG_ALIAS -v $DEV_HUB_ALIAS -s -d 30
  }
  
  if ( $? -ne 'TRUE' ){
    echoErrorMsg "Scratch org could not be created. Aborting Script."
    exit 1
  }
}
#
##
###
#### FUNCTION: deleteScratchOrg () #################################################################
###
##
#
function deleteScratchOrg() {
  # Delete the current scratch org.
  echoStepMsg "Delete the $SCRATCH_ORG_ALIAS scratch org"
  echo "Executing force:org:delete -p -u $SCRATCH_ORG_ALIAS -v $DEV_HUB_ALIAS"
  (Set-Location $PROJECT_ROOT) 
  if($? -ne 0){
    sfdx force:org:delete -p -u $SCRATCH_ORG_ALIAS -v $DEV_HUB_ALIAS
  }
}
#
##
###
#### FUNCTION: importData () #######################################################################
###
##
#
function importData ($a) {
  # Setup development data
  echoStepMsg "Import data from $a"
  echo `
  "Executing force:data:tree:import \\
              --plan `"$a`" \\
              --targetusername $SCRATCH_ORG_ALIAS \\
              --loglevel error"
  (Set-Location $PROJECT_ROOT) 
  if($? -ne 0){
    sfdx force:data:tree:import `
      --plan "$a" `
      --targetusername $SCRATCH_ORG_ALIAS `
      --loglevel error
  }
  if ( $? -ne 0 ){
    echoErrorMsg "Data import failed. Aborting Script."
    exit 1
  }
}
#
##
###
#### FUNCTION: installPackage () ###################################################################
###
##
#
function installPackage ($a, $b, $c) {
  # Echo the string provided by argument three. This string should provide the
  # user with an easy-to-understand idea of what package is being installed.
  echoStepMsg "$c"

  # Print the time (HH:MM:SS) when the installation started.
  echo "Executing force:package:install -i $a -p 5 -w 10 -u $SCRATCH_ORG_ALIAS"
  echo "Package installation started at " + date
  $startTime=date

  # Perform the package installation.  If the installation fails abort the script.
  (Set-Location $DEMO_ROOT) 
  if ($? -ne 0) {
    sfdx force:package:install -i $a -p 5 -w 10 -u $SCRATCH_ORG_ALIAS
  }

  if ( $? -ne 0 ){
    echoErrorMsg "$b could not be installed. Aborting Script."
    exit 1
  }

  # Print the time (HH:MM:SS) when the installation completed.
  echo "Package installation completed at " + date
  $endTime=date

  # Determine the total runtime (in seconds) and show the user.
  $totalRuntime=$((endTime-startTime))
  echo "Total runtime for package installation was $totalRuntime seconds."
}
#
##
###
#### FUNCTION: pushMetadata () #####################################################################
###
##
#
function pushMetadata () {
  # Push metadata to the new Scratch Org.
  echoStepMsg "Push metadata to the new scratch org"
  echo "Executing force:source:push -u $SCRATCH_ORG_ALIAS"
  (Set-Location $PROJECT_ROOT) 
  if ($? -ne 0) {
    sfdx force:source:push -u $SCRATCH_ORG_ALIAS
  }

  if ( $? -ne 'TRUE' ){
    echoErrorMsg "SFDX source could not be pushed to the scratch org. Aborting Script."
    exit 1
  }
}
#
##
###
#### FUNCTION: validateScratchOrgDeletion () #######################################################
###
##
#
function validateScratchOrgDeletion () {
  # Confirm that the scratch org is no longer the default username in SFDX local config.
  echoStepMsg "Validate deletion of the scratch org"
  echo "Executing sfdx force:config:list to confirm deletion from project local config"
  (Set-Location $PROJECT_ROOT) 
  if ($? -ne 0) {
    sfdx force:config:list
  }
}
#
##
###
#### FUNCTION: runAnonymousApex () #####################################################################
###
##
#
function runAnonymousApex () {
  # Run Anonymous code in the new Scratch Org.
  echoStepMsg "Run Anonymous code in the new scratch org"
  echo "Executing force:apex:execute -u $SCRATCH_ORG_ALIAS"
  (Set-Location $PROJECT_ROOT) 
  if ($? -ne 0) {
    sfdx force:apex:execute -u $SCRATCH_ORG_ALIAS --apexcodefile $PROJECT_ROOT/data/anonymous-apex/your-anonymous-apex.apex
  }

  if ( $? -ne 'TRUE' ){
    echoErrorMsg "Anonymous code can't be executed. Aborting Script."
    exit 1
  }
}
#
##
###
#### SCRATCH ORG SETUP (DELETE/CREATE/PUSH) ########################################################
###
##
#
# STEP 0
# Reset the Step Message counter to reflect the number of TOTAL STEPS
# in your rebuild process. For the baseline SFDX-Falcon template it's 4.
resetStepMsgCounter 4

# STEPS 1 and 2
# Delete the current scratch org.
deleteScratchOrg

# STEP 3
# Create a new scratch org using the scratch-def.json locally configured for this project.
createScratchOrg

# STEP 4 through ???
# Install any packages (managed or unmanaged).
# Template for calling this function:
# installPackage #PACKAGE_VERSION_ID# \
#                "#PACKAGE_NAME#" \
#                "#STEP_MESSAGE#"

# STEP 5 through ???
# Assign any permission sets that were added by installed packages.
# Template for calling this function:
# assignPermset #PACKAGED_PERMSET_NAME# 

# STEP 6
# Push metadata to the new Scratch Org.
pushMetadata

# STEP 7 through ????
# Assign any permission sets that were added by your Source Push.
# Template for calling this function:
#assignPermset #PERMSET_NAME# 

# STEP 8 through ????
# Import data used during development. You may need to make multiple calls
# Template for calling this function:
# importData "$PROJECT_ROOT/data/#DATA_PLAN_JSON#"


# STEP 9 Execute Anonymous Code
#runAnonymousApex
#
##
###
#### ECHO CLOSING MESSAGE ##########################################################################
###
##
#
echoScriptCompleteMsg 
"Rebuild of scratch org $SCRATCH_ORG_ALIAS completed successfully."

exit 0

##END##