# BLOCKv CLI tools

This provides a set of CLI tools for publishing and interacting with vAtoms on the BLOCKv platform.

To install, clone this repo and then run `npm install . -g`

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
blockv brain-register --variation <id> --init Drop --shutdown Pickup
blockv brain-upload --variation <id> --path /path/to/my_brain.js
blockv brain-shutdown --variation <id>
```