
const commandLineUsage = require('command-line-usage')
const Config = require('../utils/Config')

module.exports = {
    id: 'brain-register',
    description: 'Registers a brain onto a template variation.',
    requiresSession: true,
    args: [
        { name: 'variation' },
        { name: 'init' },
        { name: 'shutdown' },
        { name: 'max-runtime', type: Number },
        { name: 'wake-interval', type: Number },
        { name: 'help', type: Boolean },
    ],
    run: async opts => {

        // Check for required fields, or else show help
        if (opts.help) return console.log(commandLineUsage([

            {
                header: 'Register Brain',
                content: `Registers a brain onto a template variation.`
            },
            {
                header: 'Options',
                optionList: [
                    { name: 'variation', typeLabel: '{italic id}', description: '{italic (required)} The template variation ID.'},
                    { name: 'init', typeLabel: '{italic Drop}', description: '{italic (required)} Must be "Drop". Specifies the trigger which activates the brain for a vAtom.'},
                    { name: 'shutdown', typeLabel: '{italic Pickup}', description: '{italic (required)} Must be "Pickup". Specifies the trigger which deactivates the brain for a vAtom.'},
                    { name: 'max-runtime', typeLabel: '{italic ms}', description: '{italic Default = 2000.} The amount of time the brain is allowed to run per event.'},
                    { name: 'wake-interval', typeLabel: '{italic ms}', description: '{italic Default = 10000.} The time between each wakeup event.'},
                ]
            }

        ]))

        // Check required fields
        if (!opts.variation) return console.log('Please specify --variation')
        if (!opts.init || !opts.shutdown) return console.log('Please specify --init and --shutdown')

        // Get logged in session
        const BLOCKv = await Config.loadSession()

        // Create output table
        let info = []

        // Register brain
        await BLOCKv.client.request('POST', '/v1/brains', {
            template_variation: opts.variation,
            package_main: "main.js",
            init_trigger: opts.init,
            shutdown_trigger: opts.shutdown,
            max_runtime: parseInt(opts.max_runtime) || 2000,
            wake_call_interval: parseInt(opts.wake_interval) || 10000,
            log_level: "info"
        }, true)

        // Done
        console.log('Done.')

    }
}