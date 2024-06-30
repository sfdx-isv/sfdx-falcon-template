# SFDX-Falcon 2GP Project Template

This template is a starting point for a Salesforce DX project building a managed second-generation package (2GP).

## Getting Started

1. Copy this template repo.
2. Clone your copy into a working Salesforce development environment.
3. Customize `sfdx-project.json` (details below).
4. Create a managed 2GP (details below).
5. Create a package development scratch org (details below).
5. Start building your app.

## Customize `sfdx-project.json`

### 1. Customize the `name` property.
Use only letters, numbers, and hyphens `-` when choosing a name. For example:
```json
  "name": "my-new-app",
```

### 2. Customize the `namespace` property.
Use a namespace that is linked to the Developer Hub you plan to build from. For example:
```json
  "namespace": "my_namespace",
```

## Create a Managed 2GP

### 1. Use the `package create` command to create a managed package.
Execute this command from the root of your SFDX project folder.
```bash
sf package create -n "My New 2GP App" -r sfdx-source/packaged -t Managed
```

### 2. Remove the duplicate `packageDirectory` object from `sfdx-project.json`.

The `package create` command will have created a duplicate `packageDirectory` object in `sfdx-project.json`. Here's how to fix this.

1. KEEP the original `packageDirectory` object near the top of `sfdx-project.json` 
   by changing the value of the `package` property from `"Package Name"` to the name
  that appears in the `packageAliases` object.
2. REMOVE the duplicate `packageDirectory` object that was added near the bottom of
   `sfdx-project.json`.

## Create a Package Development Scratch Org

### 1. Install the SFDX-Falcon `toolbelt` in your local project.
Execute this command from the root of your SFDX project folder.
```bash
npm install --prefix ./scripts/js 
```
If you get any warnings about security vulernabilities, execute this command
```bash
npm audit fix --prefix ./scripts/js 
```

### 2. Use the SFDX-Falcon `toolbelt` to create a package development scratch org.
Execute this command from the root of your SFDX project folder.
```bash
./toolbelt
```

**Once this command finishes, you should be ready to start building.**

## Issues? Questions/Comments?
* [SFDX-Falcon Template Issues](https://github.com/sfdx-isv/sfdx-falcon-template/issues)
* [SFDX-Falcon Template Questions/Comments](https://github.com/sfdx-isv/sfdx-falcon-template/discussions)


## Contributors
* [Vivek M. Chawla](https://github.com/VivekMChawla)


## License
This project is licensed under the BSD-3-Clause License - see the [LICENSE](LICENSE) file for details.
