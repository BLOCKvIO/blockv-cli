
const commandLineUsage = require('command-line-usage')
const BLOCKv = require('../utils/BLOCKv')

module.exports = {
    id: 'read',
    description: 'Fetches information about a vatom ID, template variation, template, etc.',
    requiresSession: true,
    args: [
        { name: 'id' },
        { name: 'variation' },
        { name: 'template' }
    ],
    run: async opts => {

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
                    { a: 'Visibility', b: data.vatoms[0]['vAtom::vAtomType'].visibility.type }
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

            // Set variation if needed
            if (!opts.variation)
                opts.variation = data.vatoms[0]['vAtom::vAtomType'].template_variation

        }

        // Check if we have a variation
        if (opts.variation) {

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
                    { a: 'Unpublished', b: data.properties.template_variation.unpublished ? 'true' : 'false' },
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

            // Fetch brain info
            console.log('Fetching brain info...')
            try {
                data = await BLOCKv.client.request('GET', '/v1/brains/' + opts.variation, null, true)
                info.push({
                    header: 'Variation: Resources',
                    content: JSON.stringify(data).replace(/{/g, "\\{").replace(/}/g, "\\}")
                })
            } catch (err) {

                // No brain info
                info.push({
                    header: 'Variation: Brain',
                    content: "(none)"
                })

            }

        }

        // Display info if any
        if (info.length != 0) console.log(commandLineUsage(info))

        // If nothing in the info, output help
        if (info.length == 0) console.log(commandLineUsage([
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

    }
}