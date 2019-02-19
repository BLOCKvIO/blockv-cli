
const commandLineUsage = require('command-line-usage')
const Config = require('../utils/Config')
const { confirm } = require('../utils/CLI')

module.exports = {
    id: 'publish',
    description: 'Publishes a vAtom template or variation.',
    args: [
        { name: 'template' },
        { name: 'variation' },
        { name: 'count', type: Number },
        { name: 'to' },
        { name: 'help', type: Boolean }
    ],
    run: async opts => {

        // Show help if needed
        if (opts.help) return console.log(commandLineUsage([
            {
                header: `Publish tool`,
                content: `Publishes a vatom template or variation. Publishing a variation will remove all restrictions, such as allowing other users to see it on the map. Also, published vatoms will cost VEE to emit.`
            },
            {
                header: `Options`,
                optionList: [
                    {
                        name: 'template',
                        typeLabel: '{underline Template-ID}',
                        description: `A template ID to set as published.`
                    },
                    {
                        name: 'variation',
                        typeLabel: '{underline Templ-Variation-ID}',
                        description: `A template variation ID to set as published.`
                    }
                ]
            }
        ]))

        // Check required fields
        if (!opts.variation && !opts.template) return console.log('Please specify --variation or --template')

        // Get logged in session
        const BLOCKv = await Config.loadSession()

        // Check if the user provided a template variation
        if (opts.variation) {

            // Read variation info
            console.log('Reading variation info...')
            let data = await BLOCKv.client.request('GET', '/v1/template_variations/' + opts.variation, null, true)

            // Check if already published
            if (!data.properties.unpublished)
                return console.log('Variation is already published.')

            // Check if template should be published
            console.log('Reading template info...')
            let data2 = await BLOCKv.client.request('GET', '/v1/templates/' + data.properties.template, null, true)
            if (data2.properties.unpublished) {

                // Ask user if they want to publish the template as well
                if (await confirm("Do you want to publish the template as well?"))
                    await module.exports.run({ template: data.properties.template })
                else
                    return console.log("Publish aborted, the template needs to be published first.")

            }

            // Publish it
            console.log('Publishing variation ' + opts.variation)
            await BLOCKv.client.request('PATCH', '/v1/template_variations/' + opts.variation, {
                unpublished: false
            }, true)

        } else if (opts.template) {

            // Read template info
            console.log('Reading template info...')
            let data = await BLOCKv.client.request('GET', '/v1/templates/' + opts.template, null, true)

            // Check if already published
            if (!data.properties.unpublished)
                return console.log('Template is already published.')

            // Publish it
            console.log('Publishing template ' + opts.template)
            await BLOCKv.client.request('PATCH', '/v1/templates/' + opts.template, {
                unpublished: false
            }, true)

        }

        // Done
        console.log('Done!')

    }

}