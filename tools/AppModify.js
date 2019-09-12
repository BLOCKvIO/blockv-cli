
const commandLineUsage = require('command-line-usage')
const Config = require('../utils/Config')
const doCaptcha = require('../utils/Captcha')
const fs = require('fs')
const path = require('path')

module.exports = {
    id: 'app-modify',
    description: 'Modifies the settings for an app ID.',
    args: [
        { name: 'id' },
        { name: 'name' },
        { name: 'redirect' },
        { name: 'fcm' },
        { name: 'clear-secret', type: Boolean },
        { name: 'help', type: Boolean }
    ],
    run: async opts => {

        // Show help if needed
        if (opts.help) return console.log(commandLineUsage([
            {
                header: `App Modify tool`,
                content: `Modifies the app settings for an app ID, such as name, redirect URIs, etc.`
            },
            {
                header: `Options`,
                optionList: [
                    {
                        name: 'id',
                        typeLabel: '{underline AppID}',
                        description: `{italic (required)} Your app ID.`
                    },
                    {
                        name: 'name',
                        typeLabel: '{underline NewName}',
                        description: `Set a new name for this app.`
                    },
                    {
                        name: 'redirect',
                        typeLabel: '{underline URIs}',
                        description: `Set the allowed OAuth redirect URIs. Separate multiple ones with space, ie. --redirect "https://app1.com https://app2.com"`
                    },
                    {
                        name: 'fcm',
                        typeLabel: '{underline File}',
                        description: `Sets the Firebase Messaging config for this app ID to the specified JSON file.`
                    },
                    {
                        name: 'clear-secret',
                        typeLabel: '',
                        description: `Removes the client_secret from an app ID. This cannot be undone.`
                    }
                ]
            }
        ]))

        // Check required fields
        if (!opts.id) return console.log('Please specify --id')

        // Get logged in session
        const BLOCKv = await Config.loadSession()

        // Check if user wants to update fields
        if (opts.name || opts.redirect) {

            // Get captcha
            let captcha = await doCaptcha(BLOCKv)

            // Update name if requested
            let payload = { captcha }
            if (opts.name)
                payload['name'] = opts.name

            // Update redirect URIs if requested
            if (opts.redirect)
                payload['redirect_uris'] = opts.redirect.split(' ')

            // Do it
            console.log('Updating app...')
            await BLOCKv.client.request('PATCH', '/v1/publisher/apps/' + opts.id, payload, true)

        }

        // Update firebase key if needed
        if (opts.fcm) {

            // Read file
            let txt = fs.readFileSync(path.resolve(opts.fcm), 'utf8')

            // Send to backend
            console.log('Updating Firebase Messaging public key...')
            await BLOCKv.client.request('POST', '/v1/user/pushnotification/credentials', {
                app_id: opts.id,
                credentials: txt
            })

        }

        // Clear secret if needed
        if (opts['clear-secret']) {

            // Get captcha
            let payload = {
                captcha: await doCaptcha(BLOCKv)
            }

            // Do it
            console.log('Removing client secret...')
            await BLOCKv.client.request('PUT', '/v1/publisher/apps/' + opts.id + '/client_secret/clear', payload, true)

        }

        // Done
        console.log('Done')

    }

}