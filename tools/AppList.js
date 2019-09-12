
const commandLineUsage = require('command-line-usage')
const Config = require('../utils/Config')
const doCaptcha = require('../utils/Captcha')
const fs = require('fs')
const path = require('path')

module.exports = {
    id: 'app-list',
    description: 'Lists all app IDs on this account.',
    args: [
        { name: 'help', type: Boolean }
    ],
    run: async opts => {

        // Show help if needed
        if (opts.help) return console.log(commandLineUsage([
            {
                header: `App List tool`,
                content: `Lists all app IDs on this account.`
            }
        ]))

        // Get logged in session
        const BLOCKv = await Config.loadSession()

        // Fetch them all
        let response = await BLOCKv.client.request('GET', '/v1/publisher/apps', null, true)

        // Create output table
        let info = []
        
        // Display general info
        for (let app of response) {
            info.push({
                header: app.name,
                content: [
                    { a: 'id', b: app.id },
                    { a: 'FQDN', b: app.FQDN },
                    { a: 'client_secret', b: app.client_secret || "(none)" },
                    { a: 'redirect_uris', b: app.redirect_uris && app.redirect_uris.join(', ') || "(none)" }
                ]
            })
        }

        // Done
        console.log(commandLineUsage(info))

    }

}