
const commandLineUsage = require('command-line-usage')
const Config = require('../utils/Config')

module.exports = {
    id: 'brain-delete',
    description: 'Removes a brain from the specified template variation.',
    requiresSession: true,
    args: [
        { name: 'variation' },
        { name: 'help', type: Boolean },
    ],
    run: async opts => {

        // Check for required fields, or else show help
        if (opts.help) return console.log(commandLineUsage([

            {
                header: 'Delete Brain',
                content: `Stops and deletes the brain from the specified template variation.`
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
        console.log('Deleting brain...')
        await BLOCKv.client.request('DELETE', '/v1/brains/' + opts.variation, null, true)

        // Done
        console.log('Done.')

    }

}