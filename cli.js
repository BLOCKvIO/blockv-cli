//
// Entry point into the app

const commandLineArgs = require('command-line-args')
const Tools = require('./tools')

async function main() {

    // Fetch name of requested tool
    const opts = commandLineArgs([
        { name: 'command', default: 'list-tools', defaultOption: true }
    ], { stopAtFirstUnknown: true })

    try {

        // Load tool
        const toolName = opts.command || 'about'
        const Tool = Tools[toolName]
        if (!Tool)
            return console.warn(`Tool '${toolName}' was not found.`)

        // Parse args for the tool
        const argv = opts._unknown || []
        const opts2 = commandLineArgs(Tool.args, { argv })

        // Run tool
        await Tools[toolName].run(opts2)

    } catch (err) {

        // Check how to log
        console.warn(err.message)

    }

}

main()