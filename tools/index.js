//
// Export all available tools. Each tool should export an object with these properties:
// - id: The tool's name
// - description: A short description to show on the tool list screen
// - args: An array to pass to command-line-args
// - run: a function which receives the options passed in via cli and executes the tool
// - requiresSession: True if you want a logged in session when run() is called

module.exports = {
    "about": require('./About'),
    "read": require('./Read')
}