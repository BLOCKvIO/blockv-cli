//
// Export all available tools. Each tool should export an object with these properties:
// - id: The tool's name
// - description: A short description to show on the tool list screen
// - args: An array to pass to command-line-args
// - run: a function which receives the options passed in via cli and executes the tool

module.exports = {
    "about": require('./About'),
    "read": require('./Read'),
    "brain-register": require('./BrainRegister'),
    "brain-shutdown": require('./BrainShutdown'),
    "brain-upload": require('./BrainUpload'),
    "brain-delete": require('./BrainDelete'),
    "login": require('./Login'),
    "emit": require('./Emit'),
    "publish": require('./Publish'),
    "autocreate": require('./AutoCreate')
}