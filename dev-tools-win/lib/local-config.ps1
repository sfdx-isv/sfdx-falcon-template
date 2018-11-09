#!/bin/bash
#<%%#
####################################################################################################
#
# FILENAME:     local-config.ps1
#
# PURPOSE:      Template for creating a personalized local-config.sh file.
#
# DESCRIPTION:  All shell scripts in the dev-tools-win directory require several configuration values
#               to run correctly (eg. the path to your project's root directory or the alias of
#               the DevHub that you want to use.  These customizations can be specific to each
#               individual developer, and therefore should not be tracked by the project's VCS.
#
#               This file serves as a template that Release Managers can use to establish baseline
#               values for their project.  When individaul developers clone the repo and initialize
#               their local, personal version of the project this template is used to create a
#               customized local-config.ps1 file at <project-root>/dev-tools-win/lib/local-config.sh
#
# INSTRUCTIONS: Replace the values of the variables as per your local configuration
#
####################################################################################################
#%>
##
###
#### DEFINE LOCAL CONFIGURATION VARIABLES ##########################################################
###
##
$PROJECT_ROOT = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
#
# Alias for the Dev Hub that should be used when creating scratch orgs for this project.
# This variable will always need to be customized for individual developers.
$DEV_HUB_ALIAS=''

# Namespace Prefix.  Set to empty string ('') if this project is not building a managed package.
$NAMESPACE_PREFIX=''

# Package Name.  Specified as part of the Package Detail info in your packaging org. 
# Surround this value with double-quotes if your package name contains space characters.
# Set to empty string ('') if this project is not building a managed package.
$PACKAGE_NAME=''

# Metadata Package ID.  Refers to the metadata package as a whole.  Must begin with '033'.
# Set to empty string ('') if this project is not building a managed package.
$METADATA_PACKAGE_ID='033000000000000'

# Package Version ID. Refers to a specific, installable version of a package. Must begin with '04t'.
# Set to empty string ('') if this project is not building a managed package.
$PACKAGE_VERSION_ID='04t000000000000'

# Default Package Directory. Should match what is set in sfdx-project.json.
$DEFAULT_PACKAGE_DIR_NAME=''

# Alias for the primary Scratch Org used by this project.
$SCRATCH_ORG_ALIAS= $NAMESPACE_PREFIX + '-SCRATCH'

# Alias for the packaging org for this project.
$PACKAGING_ORG_ALIAS= $NAMESPACE_PREFIX + '-PACKAGE'

# Alias for the subscriber test org used to test managed-beta package installs.
$SUBSCRIBER_ORG_ALIAS= $NAMESPACE_PREFIX + '-SUBSCRIBER'
$SUBSCRIBER_SANDBOX_ALIAS = $SUBSCRIBER_ORG_ALIAS + '-SANDBOX'

# Git Remote URI. SSH or HTTPS URI that points to the Git remote repo used by this project.
# GitHub is used as an example here, but any Git remote (ie. BitBucket) can be used.
# Set to empty string ('') if this project is not being tracked in a remote repository.
$GIT_REMOTE_URI=''

# Location of the primary scratch-def.json file that should be used by SFDX-Falcon scripts that
# create scratch orgs (eg. rebuild-scratch-org).
$SCRATCH_ORG_CONFIG=$PROJECT_ROOT+ '\config\project-scratch-def.json'

# Echo the variables set by this script prior to exiting.  Specify 'false' to suppress the
# display of local config that normally occurs when executing SFDX-Falcon based scripts.
$ECHO_LOCAL_CONFIG_VARS='true'
#
##
###
#### ECHO ALL VARIABLES ############################################################################
###
##
#
if ( $ECHO_LOCAL_CONFIG_VARS -eq 'true' ) {
    Write-Output "Local configuration variables set by $PROJECT_ROOT/dev-tools-win/lib/local-config.sh"
  echoConfigVariables
}
##END##