
const commandLineUsage = require('command-line-usage')
const Config = require('../utils/Config')

module.exports = {
    id: 'brain-shutdown',
    description: 'Shut down a running brain.',
    requiresSession: true,
    args: [
        { name: 'variation' },
        { name: 'help', type: Boolean },
    ],
    run: async opts => {

        // Check for required fields, or else show help
        if (opts.help) return console.log(commandLineUsage([

            {
                header: 'Shutdown Brain',
                content: `Stops a currently running brain. Once stopped, you will have to upload new brain code to start it again.`
            },
            {
                header: 'Options',
                optionList: [
                    { name: 'variation', typeLabel: '{italic id}', description: '{italic (required)} The template variation ID.'},
                ]
            }

        ]))

        // Check required fields
        if (!opts.variation) return console.log('Please specify --variation')

        // Get logged in session
        const BLOCKv = await Config.loadSession()

        // Shut it down
        console.log('Shutting down brain...')
        await BLOCKv.client.request('GET', '/v1/brain/shutdown/' + opts.variation, null, true)

        // Done
        console.log('Complete. Use brain-upload to restart the brain.')

    }

}