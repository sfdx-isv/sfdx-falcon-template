# SFDX-Falcon Project Template

This template can be used as a starting point for any Salesforce DX project, but has been specialized for building managed packages.  Each directory in this repository contains a README file describing its purpose, what type of files it should contain, and additional setup/configuration details (if needed).

**Intro Video:** [Salesforce 201: Advanced Implementation for ISVs](http://bit.ly/sfdx-flow-for-isvs-falcon-intro)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Getting Started

These instructions will get you a copy of the SFDX-Falcon template on your local machine and explain how to customize things for your project.  They also explain how to distribute your project to developers once you're up and running.  

If your environment meets all the prerequisites, setup and customization of this template should only take 5-10 minutes.

## Prerequisites

Your Salesforce, GitHub, and Local environments should meet the following prerequisites.  If you're missing any of these, make sure you address them in the order they appear in the lists, below.


### Salesforce Environment Prerequisites

| Prerequisite                        | Reason                                                  | More Info                              |
|:------------------------------------|:--------------------------------------------------------|:---------------------------------------|
| Access to a Developer Hub           | Required for creating scratch orgs                      | [Enable the Dev Hub in Your Org][1]    |
| Create Salesforce DX Users          | Required for developers to access your Dev Hub          | [Add Salesforce DX Users][1a]          |
| Access to a Packaging Org           | Required for creating first-gen packages                | [Overview of Salesforce Packages][2]   |
| Register a Namespace Prefix         | Required for creating managed packages                  | [Register a Namespace Prefix][3]       |
| Create a Managed Package            | Required for distribution on the AppExchange            | [Create Salesforce Packages][4]        |
| Link your Namespace to your Dev Hub | Required for creating namespaced scratch orgs           | [Link a Namespace to a Dev Hub Org][5] |

[1]: http://bit.ly/enable-dev-hub               "Enable the Dev Hub in Your Org"
[1a]: http://bit.ly/add-sfdx-users-to-devhub    "Add Salesforce DX Users"
[2]: http://bit.ly/packaging-overview           "Overview of Packages"
[3]: http://bit.ly/register-a-namespace-prefix  "Register a Namespace Prefix"
[4]: http://bit.ly/create-a-salesforce-package  "Create Salesforce Packages"
[5]: http://bit.ly/link-namespace-to-devhub     "Link a Namespace to a Dev Hub Org"


### GitHub Environment Prerequisites

| Prerequisite                        | Reason                                                  | More Info                              |
|:------------------------------------|:--------------------------------------------------------|:---------------------------------------|
| Create a new private GitHub repo    | Required for use as shared remote for your project      | [Create a GitHub Repo][8]              |
| Invite collaborators (personal)     | Required for team development using personal account    | [Invite Collaborators (personal)][9]   |
| Invite collaborators (organization) | Required for team development using organization account| [Invite Collaborators (organization)][10]|

[8]: http://bit.ly/create-a-github-repo                 "Create a GitHub Repo"
[9]: http://bit.ly/github-invite-personal-collaborators "Invite Collaborators to a Personal Repo"
[10]: http://bit.ly/github-manage-organization-access   "Manage Individual Access to Organization Repository"


### Local Environment Prerequisites

| Prerequisite                        | Reason                                                  | More Info                              |
|:------------------------------------|:--------------------------------------------------------|:---------------------------------------|
| OS, developer toolset, IDE and VCS  | Required by Salesforce CLI and for modern dev experience| [Salesforce DX System Requirements][6] |
| Install the Salesforce CLI          | Required for using source-driven dev features of SFDX   | [Install the Salesforce CLI][7]        |

[6]: http://bit.ly/sfdx-system-requirements "Salesforce DX System Requirements"
[7]: http://bit.ly/install-salesforce-cli   "Install the Salesforce CLI"

### Important Note for Windows Users
For windows users there are now PowerShell scripts available in `dev-tools-win`.

## How to Start a New Project From This Template

**Step One:** Clone the SFDX-Falcon Template repository (use HTTPS or SSH, not both)
```
# HTTPS Clone
git clone https://github.com/sfdx-isv/sfdx-falcon-template.git

# SSH Clone
git clone git@github.com:sfdx-isv/sfdx-falcon-template.git
```
**Step Two:** Create a new local directory for your project 
```
mkdir my-new-sfdx-project
```
**Step Three:** Copy everything (including hidden files/directories) from sfdx-falcon-template to your project
```
cp -a  sfdx-falcon-template/.  my-new-sfdx-project
```
**Step Four:** Kill, then re-initialize Git in your project folder to start from a clean (empty) history
```
cd my-new-sfdx-project            # Change to your project directory
rm -rf .git                       # Remove .git, killing the sfdx-falcon-template history
git init                          # Re-initialize Git 
git add -A                        # Stage all files in your project directory
git commit -m "Initial commit"    # Perform the initial commit, starting your new history
```
**Step Five:** Add your GitHub repository as a remote of your new local repository (use HTTPS or SSH, not both)
```
# Add HTTPS remote
git remote add origin https://github.com/<USER_OR_ORGANIZATION_NAME>/<REPOSITORY_NAME>.git

# Add SSH remote
git remote add origin git@github.com:<USER_OR_ORGANIZATION_NAME>/<REPOSITORY_NAME>.git
```
**Step Six:** Make the initial push and add an upstream reference to your remote (via the -u flag)
```
git push -u origin master
```
You are now ready to connect the Salesforce CLI to your Dev Hub and Packaging Org. 

## Connect the Salesforce CLI to your Dev Hub and Packaging Org
If you have not previously connected the Salesforce CLI to your Dev Hub and Packaging Org, you will need to do so before continuing.

### Connect the CLI to your Dev Hub
```
# force:auth:web:login
# -a --SETALIAS                   Set an alias for the authenticated org
# -d --SETDEFAULTDEVHUBUSERNAME   Set the authenticated org as the default
#                                 dev hub org for scratch org creation
sfdx force:auth:web:login -a DevHub -d
```
### Connect the CLI to your Packaging Org
```
# force:auth:web:login
# -a --SETALIAS                   Set an alias for the authenticated org
sfdx force:auth:web:login -a my_ns_prefix-PACKAGING 
```
### Connect the CLI to a Sandbox Org (Optional)
```
# force:auth:web:login
# -a --SETALIAS                   Set an alias for the authenticated org
# -r --INSTANCEURL                The login URL of the instance the org lives on
sfdx force:auth:web:login -a my_ns_prefix-SANDBOX -r https://test.salesforce.com
```
You are now ready to customize your Salesforce DX project and the SFDX-Falcon directories and scripts.

## Final Customizations
In order to fully utilize the SFDX-Falcon Template, you should complete the following final customizations inside of your project/repository. Once these tasks are complete, you will be ready to download/convert metadata from your packaging org.

### Customize SFDX-Falcon directory names
From the root of your project directory, rename the "my_ns_prefix" directory in sfdx-source so that it matches the namespace prefix of your managed package.
```
# Execute this from the root of your project directory
mv ./sfdx-source/my_ns_prefix ./sfdx-source/your_ns_prefix
```
### Customize Salesforce DX project settings
There are two required edits (and one optional one) you need to make inside your `sfdx-project.json` file.
```
{
  "packageDirectories": [
    { "path": "sfdx-source/your_ns_prefix", "default": true },  <----- EDIT ONE: Your package's namespace
    { "path": "sfdx-source/unpackaged"},
    { "path": "sfdx-source/untracked"}
  ],
  "namespace": "your_ns_prefix", <------------------------------------ EDIT TWO: Your package's namespace
  "sfdcLoginUrl": "https://login.salesforce.com",
  "sourceApiVersion": "41.0" <---------------------------------------- OPTIONAL: Set this to the version you want
}
```
### Customize Developer Tools
Follow the instructions in the [dev-tools README](dev-tools/README.md) for detailed information on how create and edit a `local-config.sh` so you can customize the behavior of the SFDX-Falcon dev-tools when deployed to your developer's machines.

## Resources
List of resources TBA
* [?????](http://wwwgoogle.com) - ????
* [?????](http://wwwgoogle.com) - ????
* [?????](http://wwwgoogle.com) - ????

## Release History
Release history TBA.

## Authors
* **Vivek M. Chawla** - *Lead Developer* - [@VivekMChawla](https://twitter.com/VivekMChawla)

## Contributors
TODO: Need to add code of conduct and the process for submitting pull requests.

## Acknowledgments
TODO
* ????
* ????
* ????

## Questions/Comments

Salesforce ISV Partners with questions/comments should join the [SFDX-Falcon Chatter Group](http://bit.ly/sfdx-falcon-group) in the Partner Community.  You can also reach out to the author, Vivek M. Chawla on Twitter - [@VivekMChawla](https://twitter.com/VivekMChawla).

