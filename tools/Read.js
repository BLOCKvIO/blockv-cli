
const commandLineUsage = require('command-line-usage')
const Config = require('../utils/Config')

module.exports = {
    id: 'read',
    description: 'Fetches information about a vatom ID, template variation, template, etc.',
    args: [
        { name: 'id' },
        { name: 'variation' },
        { name: 'template' },
        { name: 'help', type: Boolean }
    ],
    run: async opts => {

        // Show help if needed
        if (opts.help) return console.log(commandLineUsage([
            {
                header: `Read tool`,
                content: `Reads information from a vatom ID, template variation, or template.`
            },
            {
                header: `Options`,
                optionList: [
                    {
                        name: 'id',
                        typeLabel: '{underline Vatom-ID}',
                        description: `A vAtom ID to read from`
                    },
                    {
                        name: 'variation',
                        typeLabel: '{underline Templ-Variation-ID}',
                        description: `A template variation ID to read from. Not necessary if specifying --id.`
                    },
                    {
                        name: 'template',
                        typeLabel: '{underline Template-ID}',
                        description: `A template to read from. Not necessary if specifying --id or --variation.`
                    }
                ]
            }
        ]))

        // Check required fields
        if (!opts.id && !opts.variation && !opts.template) return console.log('Please specify one of --id, --variation, or --template')

        // Get logged in session
        const BLOCKv = await Config.loadSession()

        // Create output table
        let info = []

        // Check if we have a vatom ID
        if (opts.id) {

            // Read vatom details
            console.log('Fetching vatom info...')
            let data = await BLOCKv.client.request('POST', '/v1/user/vatom/get', { ids: [opts.id] }, true)
            if (data.vatoms.length == 0)
                throw new Error('Vatom ID did not exist.')
            
            // Display general info
            info.push({
                header: 'Vatom: General',
                content: [
                    { a: 'ID', b: data.vatoms[0].id },
                    { a: 'Created Date', b: data.vatoms[0].when_created },
                    { a: 'Modified Date', b: data.vatoms[0].when_modified },
                    { a: 'Visibility', b: data.vatoms[0]['vAtom::vAtomType'].visibility.type },
                    { a: 'Template ID', b: data.vatoms[0]['vAtom::vAtomType'].template },
                    { a: 'Variation ID', b: data.vatoms[0]['vAtom::vAtomType'].template_variation },
                    { a: 'Title', b: data.vatoms[0]['vAtom::vAtomType'].title },
                    { a: 'Description', b: data.vatoms[0]['vAtom::vAtomType'].description },
                    { a: 'Category', b: data.vatoms[0]['vAtom::vAtomType'].category || '(none)' },
                    { a: 'Draft', b: data.vatoms[0].unpublished ? '{yellow Yes}' : 'No' },
                ]
            })

            // Fetch user info
            console.log('Fetching owner info...')
            let ownerInfo = await BLOCKv.client.request('GET', '/v1/users/' + data.vatoms[0]['vAtom::vAtomType'].owner, null, true)
            let authorInfo = await BLOCKv.client.request('GET', '/v1/users/' + data.vatoms[0]['vAtom::vAtomType'].owner, null, true)
            
            // Display owner info
            info.push({
                header: 'Vatom: Ownership',
                content: [
                    { a: 'Owner', b: `${data.vatoms[0]['vAtom::vAtomType'].owner} (${ownerInfo.properties.first_name} ${ownerInfo.properties.last_name})` },
                    { a: 'Author', b: `${data.vatoms[0]['vAtom::vAtomType'].author} (${authorInfo.properties.first_name} ${authorInfo.properties.last_name})` },
                    { a: 'Publisher FQDN', b: data.vatoms[0]['vAtom::vAtomType'].publisher_fqdn }
                ]
            })

            // Display resources
            info.push({
                header: 'Vatom: Resources',
                content: []
            })

            for (let res of data.vatoms[0]['vAtom::vAtomType'].resources) info[info.length-1].content.push({
                a: res.name, b: res.resourceType, c: res.value.value
            })

            // Display actions
            info.push({
                header: 'Vatom: Actions',
                content: []
            })

            for (let action of data.actions) info[info.length-1].content.push({
                a: action.name
            })
            if (data.actions.length == 0) info[info.length-1].content.push({
                a: "(none)"
            })

            // Display faces
            info.push({
                header: 'Vatom: Faces',
                content: []
            })

            for (let face of data.faces) info[info.length-1].content.push({
                a: face.properties.constraints.view_mode, b: face.properties.constraints.platform, c: face.properties.display_url
            })
            if (data.faces.length == 0) info[info.length-1].content.push({
                a: "(none)"
            })

            // Display other sections
            for (let section of Object.keys(data.vatoms[0])) if (typeof data.vatoms[0][section] == 'object' && section != 'vAtom::vAtomType') info.push({
                header: 'Vatom: ' + section,
                content: JSON.stringify(data.vatoms[0][section] || {}).replace(/{/g, "\\{").replace(/}/g, "\\}")
            })

            // Set variation if needed
            if (!opts.variation)
                opts.variation = data.vatoms[0]['vAtom::vAtomType'].template_variation

        }

        // Check if we have a variation
        if (opts.variation) {

            try {

                // Load variation info
                console.log('Fetching variation info...')
                let data = await BLOCKv.client.request('GET', '/v1/template_variations/' + opts.variation, null, true)

                // Display general info
                info.push({
                    header: 'Variation: General',
                    content: [
                        { a: 'Variation ID', b: opts.variation },
                        { a: 'Title', b: data.properties.template_variation['vAtom::vAtomType'].title },
                        { a: 'Description', b: data.properties.template_variation['vAtom::vAtomType'].description },
                        { a: 'Category', b: data.properties.template_variation['vAtom::vAtomType'].category || '(none)' },
                        { a: 'Draft', b: data.properties.unpublished ? '{yellow Yes}' : 'No' },
                    ]
                })

                // Display resources
                info.push({
                    header: 'Variation: Resources',
                    content: []
                })

                for (let res of data.properties.template_variation['vAtom::vAtomType'].resources) info[info.length-1].content.push({
                    a: res.name, b: res.resourceType, c: res.value.value
                })

                // Display other sections
                for (let section of Object.keys(data.properties.template_variation)) if (typeof data.properties.template_variation[section] == 'object' && section != 'vAtom::vAtomType') info.push({
                    header: 'Variation: ' + section,
                    content: JSON.stringify(data.properties.template_variation[section] || {}).replace(/{/g, "\\{").replace(/}/g, "\\}")
                })

            } catch (err) {

                // Error
                console.warn('Unable to get variation info: ' + err.message)
                
            }

            // Fetch brain info
            console.log('Fetching brain info...')
            try {
                let data = await BLOCKv.client.request('GET', '/v1/brains/' + opts.variation, null, true)
                info.push({
                    header: 'Variation: Brain',
                    content: [
                        { a: 'Code Path', b: data.code_path || '(none)' },
                        { a: 'Package Main', b: data.package_main || '(none)' },
                        { a: 'Init Trigger', b: data.init_trigger || '(none)' },
                        { a: 'Shutdown Trigger', b: data.shutdown_trigger || '(none)' },
                        { a: 'Max Runtime', b: (data.max_runtime + '') || '(none)' },
                        { a: 'Wake Call Interval', b: (data.wake_call_interval + '') || '(none)' }
                    ]
                })
            } catch (err) {

                // No brain info
                info.push({
                    header: 'Variation: Brain',
                    content: err.message
                })

            }

        }

        // Display info if any
        console.log(commandLineUsage(info))

    }
}