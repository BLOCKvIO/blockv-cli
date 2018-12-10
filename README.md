# BLOCKv CLI tools

This provides a set of CLI tools for publishing and interacting with vAtoms on the BLOCKv platform.

To install, run `npm i -g blockv-cli`. This will install a `blockv` CLI tool into your PATH.

> We have not published to npm yet, so the above command won't work. Instead, clone this repo, run `npm install`, and then `node cli ...` instead of `blockv ...` when running commands.

## Examples

``` bash
# See help info and version
blockv
```

``` bash
# Get help on any command
blockv <command> --help
```

``` bash
# Log in to prod or dev. Must be called first before any other commands to set up a session.
blockv login --user <email> --password <pwd>
blockv login --user <email> --password <pwd> --dev
```

``` bash
# Fetch details about a vAtom, a variation, or a template
blockv read --id <vatom-id>
blockv read --variation <id>
blockv read --template <id>
```

``` bash
# Brain commands
blockv read --variation <id>
blockv brain-register --variation <id> --init Drop --shutdown Pickup
blockv brain-upload --variation <id> --path /path/to/my_brain.js
blockv brain-shutdown --variation <id>
```