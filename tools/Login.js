
const commandLineUsage = require('command-line-usage')
const Blockv = require('@blockv/sdk')
const Config = require('../utils/Config')

module.exports = {
    id: 'login',
    description: 'Log into the system.',
    args: [
        { name: 'help', type: Boolean },
        { name: 'user', alias: 'u' },
        { name: 'password', alias: 'p' },
        { name: 'dev', alias: 'd', type: Boolean }
    ],
    run: async opts => {

        // Check for required fields, or else show help
        if (opts.help) return console.log(commandLineUsage([

            {
                header: 'Login',
                content: `Logs into an account. You must call this before any other commands.`
            },
            {
                header: 'Options',
                optionList: [
                    { name: 'user', typeLabel: '{italic email}|{italic phone}', description: '{italic (required)} The token to log in with.'},
                    { name: 'password', typeLabel: '{italic password}', description: '{italic (required)} The account password.'},,
                    { name: 'dev', description: 'If specified, will log into the dev environment.'}
                ]
            }

        ]))

        // Check required fields
        if (!opts.user) return console.log('Please specify --user')
        if (!opts.password) return console.log('Please specify --password')

        // Create blockv
        let bv = new Blockv({
            appID: "87b4a201-054c-484c-b206-02742ba9ae87",
            server: opts.dev ? "https://apidev.blockv.net" : "https://api.blockv.io"
        })

        // Log in
        console.log('Logging in...')
        let info = await bv.UserManager.login(opts.user, opts.user.indexOf('@') == -1 ? 'phone_number' : 'email', opts.password)

        // Save config
        Config.saveSession(bv.store.refreshToken, bv.store.server)
        console.log('Welcome, ' + info.firstName + ". You are now logged in.")

    }

}