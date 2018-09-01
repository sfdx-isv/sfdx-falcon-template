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
if [ ! -r `dirname $0`/lib/shared-functions.sh ]; then
  echo "\nFATAL ERROR: `tput sgr0``tput setaf 1`Could not load dev-tools/lib/shared-functions.sh.  File not found.\n"
  exit 1
fi

# Indicate the operation being carried out by this script.
REQUESTED_OPERATION="REBUILD_SCRATCH_ORG"

# Load the shared-functions.sh library.  This action will also cause the
# config variables from dev-tools/lib/local-config.sh to be loaded.
source `dirname $0`/lib/shared-functions.sh
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
assignPermset () {
  # Assign permission sets to the scratch org's Admin user.
  echoStepMsg "Assign the $1 permission set to the scratch org's Admin user"
  echo \
  "Executing force:user:permset:assign \\
              --permsetname "$1" \\
              --targetusername $SCRATCH_ORG_ALIAS \\
              --loglevel error\n"
  (cd $PROJECT_ROOT && exec sfdx force:user:permset:assign \
                                  --permsetname "$1" \
                                  --targetusername $SCRATCH_ORG_ALIAS \
                                  --loglevel error)
  if [ $? -ne 0 ]; then
    echoErrorMsg "Permission set \"$1\" could not be assigned to the admin user. Aborting Script."
    exit 1
  fi
}
#
##
###
#### FUNCTION: createScratchOrg () #################################################################
###
##
#
createScratchOrg() {
  # Create a new scratch org using the scratch-def.json locally configured for this project. 
  echoStepMsg "Create a new $SCRATCH_ORG_ALIAS scratch org"
  echo "Executing force:org:create -f $SCRATCH_ORG_CONFIG -a $SCRATCH_ORG_ALIAS -v $DEV_HUB_ALIAS -s -d 29"
  (cd $PROJECT_ROOT && exec sfdx force:org:create -f $SCRATCH_ORG_CONFIG -a $SCRATCH_ORG_ALIAS -v $DEV_HUB_ALIAS -s -d 29)
  if [ $? -ne 0 ]; then
    echoErrorMsg "Scratch org could not be created. Aborting Script."
    exit 1
  fi
}
#
##
###
#### FUNCTION: deleteScratchOrg () #################################################################
###
##
#
deleteScratchOrg () {
  # Delete the current scratch org.
  echoStepMsg "Delete the $SCRATCH_ORG_ALIAS scratch org"
  echo "Executing force:org:delete -p -u $SCRATCH_ORG_ALIAS -v $DEV_HUB_ALIAS" 
  (cd $PROJECT_ROOT && exec sfdx force:org:delete -p -u $SCRATCH_ORG_ALIAS -v $DEV_HUB_ALIAS )
}
#
##
###
#### FUNCTION: importData () #######################################################################
###
##
#
importData () {
  # Setup development data
  echoStepMsg "Import data from $1"
  echo \
  "Executing force:data:tree:import \\
              --plan \"$1\" \\
              --targetusername $SCRATCH_ORG_ALIAS \\
              --loglevel error)\n"
  (cd $PROJECT_ROOT && exec sfdx force:data:tree:import \
                                  --plan "$1" \
                                  --targetusername $SCRATCH_ORG_ALIAS \
                                  --loglevel error)
  if [ $? -ne 0 ]; then
    echoErrorMsg "Data import failed. Aborting Script."
    exit 1
  fi
}
#
##
###
#### FUNCTION: installPackage () ###################################################################
###
##
#
installPackage () {
  # Echo the string provided by argument three. This string should provide the
  # user with an easy-to-understand idea of what package is being installed.
  echoStepMsg "$3"

  # Print the time (HH:MM:SS) when the installation started.
  echo "Executing force:package:install -i $1 -p 5 -w 10 -u $SCRATCH_ORG_ALIAS"
  echo "\n`tput bold`Package installation started at `date +%T``tput sgr0`\n"
  local startTime=`date +%s`

  # Perform the package installation.  If the installation fails abort the script.
  (cd $PROJECT_ROOT && exec sfdx force:package:install -i $1 -p 5 -w 10 -u $SCRATCH_ORG_ALIAS)
  if [ $? -ne 0 ]; then
    echoErrorMsg "$2 could not be installed. Aborting Script."
    exit 1
  fi

  # Print the time (HH:MM:SS) when the installation completed.
  echo "\n`tput bold`Package installation completed at `date +%T``tput sgr0`"
  local endTime=`date +%s`

  # Determine the total runtime (in seconds) and show the user.
  local totalRuntime=$((endTime-startTime))
  echo "Total runtime for package installation was $totalRuntime seconds."
}
#
##
###
#### FUNCTION: pushMetadata () #####################################################################
###
##
#
pushMetadata () {
  # Push metadata to the new Scratch Org.
  echoStepMsg "Push metadata to the new scratch org"
  echo "Executing force:source:push -u $SCRATCH_ORG_ALIAS"
  (cd $PROJECT_ROOT && exec sfdx force:source:push -u $SCRATCH_ORG_ALIAS)
  if [ $? -ne 0 ]; then
    echoErrorMsg "SFDX source could not be pushed to the scratch org. Aborting Script."
    exit 1
  fi
}
#
##
###
#### FUNCTION: validateScratchOrgDeletion () #######################################################
###
##
#
validateScratchOrgDeletion () {
  # Confirm that the scratch org is no longer the default username in SFDX local config.
  echoStepMsg "Validate deletion of the scratch org"
  echo "Executing sfdx force:config:list to confirm deletion from project local config"
  (cd $PROJECT_ROOT && exec sfdx force:config:list)
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
# assignPermset #PERMSET_NAME# 

# STEP 8 through ????
# Import data used during development. You may need to make multiple calls
# Template for calling this function:
# importData "$PROJECT_ROOT/data/#DATA_PLAN_JSON#"

#
##
###
#### ECHO CLOSING MESSAGE ##########################################################################
###
##
#
echoScriptCompleteMsg \
"Rebuild of scratch org $SCRATCH_ORG_ALIAS completed successfully."

exit 0

##END##