
const commandLineUsage = require('command-line-usage')
const Config = require('../utils/Config')

module.exports = {
    id: 'emit',
    description: 'Creates vatoms as instances of a template variation.',
    args: [
        { name: 'variation' },
        { name: 'count', type: Number },
        { name: 'to' },
        { name: 'help', type: Boolean }
    ],
    run: async opts => {

        // Show help if needed
        if (opts.help) return console.log(commandLineUsage([
            {
                header: `Emit tool`,
                content: `Creates vatoms as instances of a template variation, and optionally sends them to a user.`
            },
            {
                header: `Options`,
                optionList: [
                    {
                        name: 'variation',
                        typeLabel: '{underline Templ-Variation-ID}',
                        description: `{italic (required)} A template variation ID to emit.`
                    },
                    {
                        name: 'count',
                        typeLabel: '{underline number}',
                        description: `The number of vatoms to emit.`
                    },
                    {
                        name: 'to',
                        typeLabel: '{underline email}|{underline phone}',
                        description: 'If set, will send the emitted vatoms to this user.'
                    }
                ]
            }
        ]))

        // Check required fields
        if (!opts.variation) return console.log('Please specify --variation')

        // Get logged in session
        const BLOCKv = await Config.loadSession()

        // Emit vatoms
        console.log('Emitting vatoms...')
        let data = await BLOCKv.client.request('POST', '/v1/vatoms', {
            template_variation: opts.variation,
            num: opts.count
        }, true)

        // Send if needed
        if (opts.to) {

            // Go through each vatom
            console.log(`Transferring ${data.ids.length} vatoms...`)
            for (let id of data.ids)
                await BLOCKv.Vatoms.performAction(id, 'Transfer', { [opts.to.indexOf('@') == -1 ? 'new.owner.phone_number' : 'new.owner.email']: opts.to })

        }

    }

}