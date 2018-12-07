//
// Entry point into the app

const commandLineArgs = require('command-line-args')
const Tools = require('./tools')
const BLOCKv = require('./utils/BLOCKv')

async function main() {

    // Fetch name of requested tool
    const opts = commandLineArgs([
        { name: 'command', default: 'list-tools', defaultOption: true },
        { name: 'user', alias: 'u' },
        { name: 'password', alias: 'p' },
        { name: 'debug', type: Boolean }
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

        // Check if should log in
        if (Tool.requiresSession)
            await login(opts)

        // Run tool
        Tools[toolName].run(opts2)

    } catch (err) {

        // Check how to log
        if (opts.debug)
            console.log(err)
        else
            console.log(err.message)

    }

}

main()



async function login(opts) {

    // Check fields
    if (!opts.user) throw new Error('Please pass --user to specify an email or phone number to log in with.')
    if (!opts.password) throw new Error('Please pass --password to specify a password.')

    // Perform login
    console.log('Logging in...')
    await BLOCKv.UserManager.login(opts.user, opts.user.indexOf('@') == -1 ? 'phone_number' : 'email', opts.password)

}