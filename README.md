# BLOCKv CLI tools

This provides a set of CLI tools for publishing and interacting with vAtoms on the BLOCKv platform.

To install, run `npm i -g blockv-cli`. This will install a `blockv` CLI tool into your PATH.

## Examples

``` bash
# See help info and version
node ./cli.js
```

``` bash
# Fetch details about a vAtom
node ./cli.js read --id <vatom-id> -u <email> -p <password>
```