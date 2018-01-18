#!/bin/sh
####################################################################################################
#
# FILENAME:     local-config-template.sh
#
# PURPOSE:      Template for creating a personalized local-config.sh file.
#
# DESCRIPTION:  All shell scripts in the dev-tools directory require several configuration values
#               to run correctly (eg. the path to your project's root directory or the alias of
#               the DevHub that you want to use.  These customizations can be specific to each
#               individual developer, and therefore should not be tracked by the project's VCS.
#
# INSTRUCTIONS: 1. Inside of the dev-tools directory, execute the following command
#                  cp local-config-template.sh local-config.sh
#               2. Edit the default values in your local-config.sh to meet the needs of your local
#                  environment and project setup.
#
#### DECLARE VARIABLES #############################################################################
#
#
# Project Root
PROJECT_ROOT=~/projects/my-project

# Default Package Directory. Should match what is set in sfdx-project.json.
DEFAULT_PACKAGE_DIR_NAME=my_ns_prefix

# Package Name.  Specified as part of the Package Detail info in your packaging org. 
# Surround this value with double-quotes if your package name contains space characters.
PACKAGE_NAME="My Managed Package"

# Alias for the Dev Hub that should be used when creating scratch orgs for this project.
DEV_HUB_ALIAS=MyDevHub

# Alias for the primary Scratch Org used by this project.
SCRATCH_ORG_ALIAS=my-project-SCRATCH

# Alias for the packaging org for this project.
PACKAGING_ORG_ALIAS=my_ns_prefix-PACKAGE

# Alias for the subscriber sandbox org used to test managed-beta package installs.
SUBSCRIBER_SANDBOX_ALIAS=my-project-SANDBOX

# Metadata Package ID.  Refers to the metadata package as a whole.  Must begin with "033".
METADATA_PACKAGE_ID=033000000000000

# Package Version ID. Refers to a specific, installable version of a package. Must begin with "04t".
PACKAGE_VERSION_ID=04t000000000000

# Location of the scratch-def.json that should be used when using various dev-tools scripts.
SCRATCH_ORG_CONFIG=$PROJECT_ROOT/config/project-scratch-def.json

# "Clone with SSH" details of the Git repo used by this project
GIT_CLONE_URI=git@github.com:sfdx-isv/falcon-x.git

# Echo the variables set by this script prior to exiting.  Specify "true" or "false".
ECHO_LOCAL_CONFIG_VARS=true

# Indicate that local config variables have been successfully set. DO NOT MODIFY.
SFDX_FALCON_FRAMEWORK_SHELL_VARS_SET=true
#
#
#### ECHO ALL VARIABLES ############################################################################
#
#
if [ "$ECHO_LOCAL_CONFIG_VARS" = "true" ]; then
  echo "\n`tput setaf 7``tput bold`Local configuration variables set by `dirname $0`/lib/local-config.sh`tput sgr0`\n"
  echo "`tput setaf 7`PROJECT_ROOT -------------->`tput sgr0` " $PROJECT_ROOT
  echo "`tput setaf 7`DEFAULT_PACKAGE_DIR_NAME -->`tput sgr0` " $DEFAULT_PACKAGE_DIR_NAME
  echo "`tput setaf 7`PACKAGE_NAME -------------->`tput sgr0` " $PACKAGE_NAME
  echo "`tput setaf 7`DEV_HUB_ALIAS ------------->`tput sgr0` " $DEV_HUB_ALIAS
  echo "`tput setaf 7`SCRATCH_ORG_ALIAS --------->`tput sgr0` " $SCRATCH_ORG_ALIAS
  echo "`tput setaf 7`PACKAGING_ORG_ALIAS ------->`tput sgr0` " $PACKAGING_ORG_ALIAS
  echo "`tput setaf 7`SUBSCRIBER_SANDBOX_ALIAS -->`tput sgr0` " $SUBSCRIBER_SANDBOX_ALIAS
  echo "`tput setaf 7`METADATA_PACKAGE_ID ------->`tput sgr0` " $METADATA_PACKAGE_ID
  echo "`tput setaf 7`PACKAGE_VERSION_ID -------->`tput sgr0` " $PACKAGE_VERSION_ID
  echo "`tput setaf 7`SCRATCH_ORG_CONFIG -------->`tput sgr0` " $SCRATCH_ORG_CONFIG
  echo "`tput setaf 7`GIT_CLONE_URI ------------->`tput sgr0` " $GIT_CLONE_URI
  echo "`tput setaf 7`ECHO_LOCAL_CONFIG_VARS ---->`tput sgr0` " $ECHO_LOCAL_CONFIG_VARS "\n"
fi
##END##