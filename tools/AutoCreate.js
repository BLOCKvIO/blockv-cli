
const commandLineUsage = require('command-line-usage')
const Config = require('../utils/Config')
const chalk = require('chalk')
const inquirer = require('inquirer')
const { ask, askList, askListMultiple } = require('../utils/CLI')
const Progress = require('cli-progress')

// Vars
let BLOCKv = null
let userInfo = null
let templateNameOriginal = "TestTemplate-" + Math.random().toString(16).substring(2)
let templateName = templateNameOriginal
let variationName = "Single"
let title = "Test vAtom " + Math.random().toString(16).substring(2)
let description = "Test vAtom created with BLOCKv cli tools."
let category = "Miscellaneous"
let privateData = []
let eosData = []
let ethData = []
let resources = [
    { name: 'ActivatedImage', type: 'ResourceType::Image::PNG', value: 'https://ydangleapps.s3.amazonaws.com/vatom-icon.png' }
]
let faces = [
    { id: Math.random().toString(16).substring(2), view_mode: 'icon', url: 'native://image' }
]
let published = false
let constructedTemplateVariation = null

// Enabled actions
let actionTransfer = true
let actionDrop = true
let actionPickup = true
let actionUpdate = false

module.exports = {
    id: 'autocreate',
    description: 'Create a vAtom by following on-screen instructions.',
    args: [
        { name: 'help', type: Boolean }
    ],
    run: async opts => {

        // Show help if needed
        if (opts.help) return console.log(commandLineUsage([
            {
                header: `Auto create tool`,
                content: `This tool asks you some questions and creates a vAtom for you.`
            }
        ]))

        // Get logged in session
        BLOCKv = await Config.loadSession()
        userInfo = await BLOCKv.UserManager.getCurrentUser()

        // UI loop
        while (true) {

            // Print details
            printVatomInfo()

            // Ask what to do
            let action = await askList("What do you want to do?", [
                { value: 'edit', name: "Edit properties directly" },
                new inquirer.Separator(),
                { value: 'emit', name: "Generate vAtom" },
                { value: 'cancel', name: "Cancel without creating a vAtom" }
            ])

            // Check what to do
            if (action == 'edit')
                await editMenu()
            else if (action == 'emit')
                await emitVatom()
            else if (action == 'cancel')
                break

        }

    }
}

/** Print out the current vAtom status */
function printVatomInfo() {

    // Clear console
    // process.stdout.write('\033c')
    console.clear()

    // Get list of action names
    let actionNames = []
    if (actionTransfer) actionNames.push('Transfer')
    if (actionDrop) actionNames.push('Drop')
    if (actionPickup) actionNames.push('Pickup')
    if (actionUpdate) actionNames.push('Update')

    // Create info table
    let info = [
        {
            header: `Vatom Details`,
            content: [
                { a: 'Template Name:', b: `${userInfo.pubFqdn}::{blue ${templateName}}` },
                { a: 'Variation Name:', b: `${userInfo.pubFqdn}::${templateName}::{blue ${variationName}}` },
                { a: 'Title:', b: `{blue ${title}}` },
                { a: 'Description:', b: `{blue ${description}}` },
                { a: 'Category:', b: `{blue ${category}}` },
                { a: 'Actions: ', b: actionNames.join(', ')},
                { a: 'Published: ', b: published ? 'Yes' : 'No'}
            ]
        }
    ]

    // Add resources if needed
    if (resources.length > 0) info.push({
        header: 'Resources',
        content: resources.map(data => ({
            a: data.name,
            b: `{gray ${data.type}}`,
            c: data.value
        }))
    })

    // Add actions if needed
    if (faces.length > 0) info.push({
        header: 'Faces',
        content: faces.map(data => ({
            a: data.view_mode,
            b: data.url
        }))
    })

    // Add private data if needed
    if (privateData.length > 0) info.push({
        header: 'Private Fields',
        content: privateData.map(data => ({
            a: data.key,
            b: data.value
        }))
    })

    // Add eth data if needed
    if (ethData.length > 0) info.push({
        header: 'Ethereum Fields',
        content: ethData.map(data => ({
            a: data.key,
            b: data.value
        }))
    })

    // Add eos data if needed
    if (eosData.length > 0) info.push({
        header: 'EOS Fields',
        content: eosData.map(data => ({
            a: data.key,
            b: data.value
        }))
    })

    // Print out current info
    console.log(commandLineUsage(info))

}

/** Edit menu */
async function editMenu() {

    while (true) {

        // Print vatom info
        printVatomInfo()

        // Ask what to do
        let action = await askList("What do you want to edit?", [
            { value: 'edit-field', name: "Edit a field" },
            { value: 'edit-resources', name: "Add/remove resources" },
            { value: 'edit-faces', name: "Add/remove faces" },
            { value: 'edit-actions', name: "Add/remove actions" },
            { value: 'edit-private', name: "Add/remove private fields" },
            { value: 'edit-eth', name: "Add/remove Ethereum fields" },
            { value: 'edit-eos', name: "Add/remove EOS fields" },
            new inquirer.Separator(),
            { value: 'back', name: "Go back" }
        ])

        // Check what to do
        if (action == 'edit-field')
            await editFields()
        else if (action == 'edit-resources')
            await editResources()
        else if (action == 'edit-faces')
            await editFaces()
        else if (action == 'edit-actions')
            await editActions()
        else if (action == 'edit-private')
            await editFieldsInSection('private', privateData)
        else if (action == 'edit-eth')
            await editFieldsInSection('Ethereum', ethData, chalk`  {red Adding Ethereum fields will cost more VEE.}`)
        else if (action == 'edit-eos')
            await editFieldsInSection('EOS', eosData, chalk`  {red Adding EOS fields will cost more VEE.}`)
        else if (action == 'back')
            break

    }

}

async function editFields() {

    while (true) {

        // Print vatom info
        printVatomInfo()

        // Ask which field to edit
        let action = await askList("What field to edit?", [
            { value: 'edit-template', name: "Edit template name" },
            { value: 'edit-variation', name: "Edit template variation name" },
            { value: 'edit-title', name: "Edit title" },
            { value: 'edit-description', name: "Edit description" },
            { value: 'edit-category', name: "Edit category" },
            new inquirer.Separator(),
            { value: 'back', name: "Go back" }
        ])

        // Check what to do
        if (action == 'back') {

            // Back to main menu
            break

        } else if (action == 'edit-template') {

            // Update it
            let val = await ask("Enter new template name:", templateName)
            if (val)
                templateName = val

        } else if (action == 'edit-variation') {

            // Update it
            let val = await ask("Enter new template variation suffix:", variationName)
            if (val)
                variationName = val

        } else if (action == 'edit-title') {

            // Update it
            let val = await ask("Enter new vAtom title:", title)
            if (val)
                title = val

        } else if (action == 'edit-description') {

            // Update it
            let val = await ask("Enter new vAtom description:", description)
            if (val)
                description = val

        } else if (action == 'edit-category') {

            // Update it
            let val = await ask("Enter new vAtom category:", category)
            if (val)
                category = val

        }

    }

}

/** Add and remove section fields */
async function editFieldsInSection(sectionName, section, warning) {

    while (true) {

        // Print vatom info
        printVatomInfo()

        // Print warning if any
        if (warning) {
            console.log("")
            console.log(warning)
            console.log("")
        }

        // Ask which field to edit
        let action = await askList(`What to do in the ${sectionName} section?`, [
            { value: 'add', name: "Add new field" },
            new inquirer.Separator(),
            ...section.map(s => ({
                value: 'remove-' + s.key,
                name: `Remove key ${s.key}`
            })),
            new inquirer.Separator(),
            { value: 'back', name: "Go back" }
        ])

        // Check what to do
        if (action == 'back') {

            // Back to main menu
            break

        } else if (action == 'add') {

            // Ask for name
            let name = await ask("Enter new field name:", "")
            if (!name) continue

            // Ask for name
            let val = await ask("Enter new field value:", "")
            if (!val) continue

            // Remove existing of the same name
            for (let i = 0 ; i < section.length ; i++)
                if (section[i].key == name)
                    section.splice(i--, 1)

            // Add this field
            section.push({ key: name, value: val })

        } else if (action.indexOf('remove-') == 0) {

            // Get field name to remove
            let key = action.substring(7)
            
            // Remove existing of the same name
            for (let i = 0 ; i < section.length ; i++)
                if (section[i].key == key)
                    section.splice(i--, 1)

        }

    }

}

/** Add and remove resources */
async function editResources() {

    while (true) {

        // Print vatom info
        printVatomInfo()

        // Ask which field to edit
        let action = await askList(`What to do with resources?`, [
            { value: 'add', name: "Add a resource" },
            new inquirer.Separator(),
            ...resources.map(s => ({
                value: 'remove-' + s.name,
                name: `Remove resource ${s.name}`
            })),
            new inquirer.Separator(),
            { value: 'back', name: "Go back" }
        ])

        // Check what to do
        if (action == 'back') {

            // Back to main menu
            break

        } else if (action == 'add') {

            // Ask for name
            let name = await ask("Enter resource name:")
            if (!name) continue

            // Ask for URL
            let val = await ask("Enter resource URL:")
            if (!val) continue

            // Try to guess type
            let type = "ResourceType::Text::Plain"
            if (val.indexOf(".png") != -1) type = "ResourceType::Image::PNG"
            if (val.indexOf(".jpg") != -1) type = "ResourceType::Image::JPEG"
            if (val.indexOf(".jpeg") != -1) type = "ResourceType::Image::JPEG"
            if (val.indexOf(".gif") != -1) type = "ResourceType::Image::GIF"
            if (val.indexOf(".txt") != -1) type = "ResourceType::Text::Plain"
            if (val.indexOf(".htm") != -1) type = "ResourceType::text::HTML"
            if (val.indexOf(".js") != -1) type = "ResourceType::Code::Javascript"
            if (val.indexOf(".mp3") != -1) type = "ResourceType::Audio::MPEG"
            if (val.indexOf(".wav") != -1) type = "ResourceType::Audio::WAV"
            if (val.indexOf(".mpg") != -1) type = "ResourceType::Video::MPEG"
            if (val.indexOf(".mp4") != -1) type = "ResourceType::Video::MPEG"
            if (val.indexOf(".avi") != -1) type = "ResourceType::Video::AVI"
            if (val.indexOf(".v3d") != -1) type = "ResourceType::3D::Scene"
            if (val.indexOf(".glb") != -1) type = "ResourceType::3D::Scene"

            // Ask for type
            type = await ask("Enter resource type:", type)
            if (!type) continue

            // Remove existing of the same name
            for (let i = 0 ; i < resources.length ; i++)
                if (resources[i].name == name)
                    resources.splice(i--, 1)

            // Add this field
            resources.push({ name, type, value: val })

        } else if (action.indexOf('remove-') == 0) {

            // Get field name to remove
            let key = action.substring(7)
            
            // Remove existing of the same name
            for (let i = 0 ; i < resources.length ; i++)
                if (resources[i].name == key)
                    resources.splice(i--, 1)

        }

    }

}

/** Add and remove faces */
async function editFaces() {

    while (true) {

        // Print vatom info
        printVatomInfo()

        // Ask which field to edit
        let action = await askList(`What to do with faces?`, [
            { value: 'add', name: "Add a face" },
            new inquirer.Separator(),
            ...faces.map(s => ({
                value: 'remove-' + s.id,
                name: `Remove ${s.view_mode} face ${s.url}`
            })),
            new inquirer.Separator(),
            { value: 'back', name: "Go back" }
        ])

        // Check what to do
        if (action == 'back') {

            // Back to main menu
            break

        } else if (action == 'add') {

            // Ask for view mode
            let view_mode = await askList("Select face view mode", [
                { value: 'icon', name: "Icon - Shown when vAtom is in the inventory" },
                { value: 'engaged', name: "Engaged - Shown when the user selects the vAtom" },
                { value: 'card', name: "Card - Shown in the vAtom's information card" },
                new inquirer.Separator(),
                { value: 'cancel', name: "Cancel" }
            ])
            if (view_mode == 'cancel') continue

            // Ask for URL
            let url = await ask("Enter face URL:")
            if (!url) continue
            if (view_mode == 'icon' && !url.startsWith("native:")) {
                console.log(chalk`{yellow Warning:} Only native:// faces are supported for the icon view mode.`)
                await ask(`Press Enter to continue.`)
                continue
            }

            // Remove existing of the same name
            for (let i = 0 ; i < faces.length ; i++)
                if (faces[i].view_mode == view_mode)
                    faces.splice(i--, 1)

            // Add this field
            faces.push({ id: Math.random().toString(16).substring(2), view_mode, url })

        } else if (action.indexOf('remove-') == 0) {

            // Get field name to remove
            let key = action.substring(7)
            
            // Remove existing of the same name
            for (let i = 0 ; i < faces.length ; i++)
                if (faces[i].id == key)
                    faces.splice(i--, 1)

        }

    }

}

/** Select actions */
async function editActions() {

    // Print vatom info
    printVatomInfo()

    // Ask which field to edit
    let actionList = await askListMultiple(`Which actions to enable?`, [
        { value: 'transfer', name: "Transfer - Allows users to send the vAtom to someone else", selected: actionTransfer },
        { value: 'drop', name: "Drop - Allows users to drop the vAtom publicly on the map", selected: actionDrop },
        { value: 'pickup', name: "Pickup - Allows any user to pick the vAtom up after it's been dropped", selected: actionPickup },
        { value: 'update', name: "Update - Allows the viewer or a web face to update any private property", selected: actionUpdate }
    ])

    // Check what to do
    actionTransfer = actionList.includes('transfer')
    actionDrop = actionList.includes('drop')
    actionPickup = actionList.includes('pickup')
    actionUpdate = actionList.includes('update')

}

/** Emit */
async function emitVatom() {

    // Ask user for recipient
    let recipient = await ask("Enter recipient email or phone number:")
    if (!recipient) 
        return

    // Create list of tasks to execute
    let tasks = []

    // Create private section
    let private = {}
    for (let f of privateData)
        private[f.key] = f.value

    // Create eth section
    let eth = { network: 'mainnet', fields: {} }
    for (let f of ethData)
        eth.fields[f.key] = { type: 'string', value: f.value }

    // Create eos section
    let eos = { network: 'mainnet', fields: {} }
    for (let f of eosData)
        eos.fields[f.key] = { type: 'string', value: f.value }

    // Create template
    if (!constructedTemplateVariation) tasks.push({ name: 'Creating template...', run: async e => {

        // Create template
        await BLOCKv.client.request('POST', '/v1/templates', {
            "template": `${userInfo.pubFqdn}::${templateName}`,
            "public": true,
            "cloneable": false,
            "unpublished": true,
            "vatom": {
                "vAtom::vAtomType": {
                    "root_type": "vAtom::vAtomType",
                    "description": description,
                    "title": title,
                    "redeemable": false,
                    "states": [],
                    "resources": resources.map(r => ({
                        "name": r.name,
                        "resourceType": r.type,
                        "value": {
                            "resourceValueType": "ResourceValueType::URI",
                            "value": r.value
                        }
                    }))
                },
                private,
                eos: eosData.length == 0 ? undefined : eos,
                eth: ethData.length == 0 ? undefined : eth
            }
        }, true)

    }})

    // Create template variation
    if (!constructedTemplateVariation) tasks.push({ name: 'Creating template variation...', run: async e => {

        // Create variation
        await BLOCKv.client.request('POST', '/v1/template_variations', {
            "template": `${userInfo.pubFqdn}::${templateName}`,
            "template_variation": `${userInfo.pubFqdn}::${templateName}::${variationName}`,
            "unpublished": true,
            "vatom": {
                "vAtom::vAtomType": {},
                private,
                eos: eosData.length == 0 ? undefined : eos,
                eth: ethData.length == 0 ? undefined : eth
            }
        }, true)

    }})

    // Add Transfer action
    if (!constructedTemplateVariation && actionTransfer) tasks.push({ name: 'Adding Transfer action...', run: async e => {

        // Call API
        await BLOCKv.client.request('POST', '/v1/publisher/action', {
            "name": `${userInfo.pubFqdn}::${templateName}::Action::Transfer`,
            "reactor": 'blockv://v1/Transfer',
            "timeout": 10000,
            "wait": true,
            "config": {
                "auto_create_landing_page": "https://vatom.com/#",
                "auto_create_mode": "claim",
                "auto_create_non_existing_recipient": true
            },
            "action_notification": {
                "on": true,
                "msg": "You received a vAtom",
                "custom": {}
            }
        }, true)

    }})

    // Add Drop action
    if (!constructedTemplateVariation && actionDrop) tasks.push({ name: 'Adding Drop action...', run: async e => {

        // Call API
        await BLOCKv.client.request('POST', '/v1/publisher/action', {
            "name": `${userInfo.pubFqdn}::${templateName}::Action::Drop`,
            "reactor": 'blockv://v1/Drop',
            "timeout": 10000,
            "wait": true
        }, true)

    }})

    // Add Pickup action
    if (!constructedTemplateVariation && actionPickup) tasks.push({ name: 'Adding Pickup action...', run: async e => {

        // Call API
        await BLOCKv.client.request('POST', '/v1/publisher/action', {
            "name": `${userInfo.pubFqdn}::${templateName}::Action::Pickup`,
            "reactor": 'blockv://v1/Pickup',
            "timeout": 10000,
            "wait": true
        }, true)

    }})

    // Add Update action
    if (!constructedTemplateVariation && actionUpdate) tasks.push({ name: 'Adding Update action...', run: async e => {

        // Call API
        await BLOCKv.client.request('POST', '/v1/publisher/action', {
            "name": `${userInfo.pubFqdn}::${templateName}::Action::Update`,
            "reactor": 'blockv://custom/privateproperties',
            "timeout": 10000,
            "wait": true
        }, true)

    }})

    // Add faces
    if (!constructedTemplateVariation) for (let face of faces) tasks.push({ name: `Adding ${face.view_mode} face...`, run: async e => {

        // Call API
        await BLOCKv.client.request('POST', '/v1/publisher/face', {
            "template": `${userInfo.pubFqdn}::${templateName}`,
            "display_url": face.url,
            "package_url": '.',
            "resources": [],
            "constraints": {
                "bluetooth_le": false,
                "contact_list": false,
                "gps": false,
                "three_d": false,
                "quality": "high",
                "platform": "generic",
                "view_mode": face.view_mode
            }
        }, true)

    }})

    // Done emitting
    if (!constructedTemplateVariation) tasks.push({ name: 'Saving new template variation...', run: async e => {
        constructedTemplateVariation = `${userInfo.pubFqdn}::${templateName}::${variationName}`
    }})

    // Emit a vatom
    let emittedID = null
    tasks.push({ name: 'Emitting vAtom...', run: async e => {
        
        // Call API
        let result = await BLOCKv.client.request('POST', '/v1/vatoms', {
            "template_variation": constructedTemplateVariation,
            "num": 1
        }, true)

        // Store newly emitted ID
        emittedID = result.ids[0]

    }})

    // Send to recipient
    tasks.push({ name: 'Transferring vAtom...', run: async e => {
        
        // Call API
        let result = await BLOCKv.client.request('POST', '/v1/user/vatom/action/Transfer', {
            "this.id": emittedID,
            [recipient.indexOf('@') == -1 ? "new.owner.phone_number" : "new.owner.email"]: recipient
        }, true)

    }})

    // Create progress bar
    console.log("")
    let bar = new Progress.Bar({ clearOnComplete: true, hideCursor: true, format: chalk` ${"{bar} {percentage}% "}{gray | ${"{duration_formatted} | Attempt {attempt}"} | } ${"{text}"}` }, Progress.Presets.shades_classic)
    bar.start(tasks.length, 0, { attempt: 0, text: "Preparing..." })

    // Run each task
    for (let i = 0 ; i < tasks.length ; i++) {

        // Retry loop
        let lastError = null
        for (let attempt = 0 ; attempt < 5 ; attempt++) {

            // Show status
            bar.update(i, { attempt: attempt+1, text: tasks[i].name })

            // Do it
            try {

                // Run the code
                await tasks[i].run()
                lastError = null
                break

            } catch (err) {

                // Failed, sleep a bit and try again
                await new Promise(e => setTimeout(e, 1000))
                lastError = err

            }

        }

        // Check if task failed
        if (lastError) {

            // Failed! Stop here
            bar.stop()
            console.log(chalk`{red ERROR:} ${lastError.message}`)
            await ask(`Press Enter to continue.`)
            return

        }

    }

    // Remove bar
    bar.stop()

}