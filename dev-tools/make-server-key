#!/bin/bash
####################################################################################################
#
# FILENAME:     make-server-key
#
# PURPOSE:      Creates a self-signed SSL certificate in the temp directory of this project.
#
# DESCRIPTION:  Self-signed SSL certificates (AKA "Server keys") are needed for JWT auth stuff.
#
# INSTRUCTIONS: Execute the following command relative to your project's root directory:  
#               ./dev-tools/make-server-key
#
# RELATED DOCS: Create Your Connected App (Trailhead Module)
#               └─ https://trailhead.salesforce.com/trails/sfdx_get_started/modules/sfdx_travis_ci/units/sfdx_travis_ci_connected_app
#
#               openssl "req" and "x509" manpages
#               ├─ https://www.openssl.org/docs/manmaster/man1/openssl-req.html
#               └─ https://www.openssl.org/docs/manmaster/man1/x509.html
#
#               xxd manpages 
#               └─ https://www.systutorials.com/docs/linux/man/1-xxd/
#
#               CircleCI Contexts and Environment Variables
#               ├─ https://circleci.com/docs/2.0/contexts/
#               └─ https://circleci.com/docs/2.0/env-vars/
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
confirmScriptExecution "Do you want to create a self-signed SSL certificate (Server Key) in the $PROJECT_ROOT directory?"
#
#
#### CREATE LOCAL VARIABLES ########################################################################
#
UNENCRYPTED_PRIVATE_KEY_FILE=$PROJECT_ROOT/temp/server.key.cleartext
HEX_PRIVATE_KEY_FILE=$PROJECT_ROOT/temp/server.key.hex
CSR_FILE=$PROJECT_ROOT/temp/server.csr
SIGNED_SERVER_CERT_FILE=$PROJECT_ROOT/temp/server.crt

COUNTRY_NAME="US"                   # Country Name (2 letter code)
STATE="California"                  # State or Province Name
LOCALITY="San Francisco"            # Locality Name (eg, city)
ORGANIZATION_NAME="My Company"      # Organization Name (eg, company)
ORGANIZATIONAL_UNIT="Software Dev"  # Organizational Unit Name (eg, section)
COMMON_NAME="MyCompany.com"         # Common Name (eg. server FQDN or YOUR name)
EMAIL="admin@mycompany.com"         # Email address
CERTIFICATE_EXPIRE_DAYS=365         # The number of days the self-signed certificate is valid for
#
#
#### GENERATE A SELF-SIGNED SSL (SERVER) CERTIFICATE ###############################################
#
# 0. Reset the Step Message counter and set the TOTAL STEPS to 5.
resetStepMsgCounter 3

# 1. Create a Certificate Signing Request (CSR), making sure to export of copy of the 
#    RSA Private Key at the same time.  Note that the value for the Certificate's subject 
#    are all defined as variables, above.
echoStepMsg "Create a Certificate Signing Request and show the Private Key as a one-line hexdump"
openssl req -nodes \
            -newkey rsa:2048 \
            -keyout $UNENCRYPTED_PRIVATE_KEY_FILE \
            -out    $CSR_FILE \
            -subj "/C=$COUNTRY_NAME/ST=$STATE/L=$LOCALITY/O=$ORGANIZATION_NAME/OU=$ORGANIZATIONAL_UNIT/CN=$COMMON_NAME/emailAddress=$EMAIL" 

echo "\nPrivate Key saved to $UNENCRYPTED_PRIVATE_KEY_FILE"

# 2. Create a single-line hexdump of the private key and save to file.  This hexdump
#    will be used to store the value of the private key as an Environment Variable in 
#    your CircleCI project's org-global context.  https://circleci.com/docs/2.0/contexts/
echoStepMsg "Create a single-line hexdump of the private key and save to a file"
xxd -u -p -c 10000 \
    $UNENCRYPTED_PRIVATE_KEY_FILE \
    $HEX_PRIVATE_KEY_FILE

echo "Private Key hexdump saved to $HEX_PRIVATE_KEY_FILE"
echo "\n-----BEGIN PRIVATE KEY HEXDUMP-----"
cat $HEX_PRIVATE_KEY_FILE
echo "-----END PRIVATE KEY HEXDUMP-----"

# 3. Take the previously created CSR and generate a self-signed SSL Certificate in the x509
#    format.  The output of this command (server.crt) will be uploaded to Salesforce as part
#    of the Connected App setup process.
echoStepMsg "Using the newly-created CSR, generage a self-signed SSL Certificate"
openssl x509  -req \
              -sha256 \
              -days $CERTIFICATE_EXPIRE_DAYS \
              -in $CSR_FILE \
              -signkey $UNENCRYPTED_PRIVATE_KEY_FILE \
              -out $SIGNED_SERVER_CERT_FILE 

echo "\n\n-----BEGIN CERTIFICATE DETAILS-----"
openssl x509  -in $SIGNED_SERVER_CERT_FILE \
              -noout \
              -text
echo "-----END CERTIFICATE DETAILS-----\n\n"

# Provide a closing message telling the user where to find all the generated files.
#echo "`tput bold`Process Complete:`tput sgr0` All generated files can be found in $PROJECT_ROOT/temp\n"
echoScriptCompleteMsg "All generated files can be found in $PROJECT_ROOT/temp"
##END##