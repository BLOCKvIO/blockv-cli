
const commandLineUsage = require('command-line-usage')
const Config = require('../utils/Config')
const tmp = require('tmp')
const fs = require('fs')
const path = require('path')
const tar = require('tar')
const FormData = require('form-data')
const fetch = require('node-fetch')

// HACK: Apply FormData to global, so BLOCKv SDK can see it
;(function(){
    this.FormData = FormData
}());

module.exports = {
    id: 'brain-upload',
    description: 'Uploads brain code to be executed.',
    args: [
        { name: 'variation' },
        { name: 'path', alias: 'p', defaultOption: true },
        { name: 'help', type: Boolean },
    ],
    run: async opts => {

        // Check for required fields, or else show help
        if (opts.help) return console.log(commandLineUsage([

            {
                header: 'Upload Brain Code',
                content: `Uploads brain code to be executed. You can specify either a single Javascript file, or a npm package.\n\nExample: {underline blockv brain-upload --variation <vid> /path/to/my/brain.js}`
            },
            {
                header: 'Options',
                optionList: [
                    { name: 'variation', typeLabel: '{underline id}', description: '{italic (required)} The template variation ID.'},
                    { name: 'path', typeLabel: '{underline file}|{underline folder}', description: '{italic (required)} Path to your brain code.'}
                ]
            }

        ]))

        // Check required fields
        if (!opts.variation) return console.log('Please specify --variation')
        if (!opts.path) return console.log('Please specify --path')

        // Check provided package type
        let npmPackagePath = ''
        if (opts.path.toLowerCase().endsWith('.tgz')) {

            // Already in the required format!
            npmPackagePath = opts.path
            console.log('Path is NPM packed archive')

        } else if (opts.path.toLowerCase().endsWith('.js')) {

            // Already in the required format!
            console.log('Path is a single Javascript file')

            // Package it. Create temp folder
            console.log('Packaging brain code...')
            let tempFolder = tmp.dirSync().name
            let outFolder = tmp.dirSync().name

            // Copy file to it
            let newPath = path.join(tempFolder, "brain.js")
            fs.copyFileSync(opts.path, newPath)

            // Create package.json
            newPath = path.join(tempFolder, "package.json")
            fs.writeFileSync(newPath, `{"name":"brain", "main": "brain.js"}`)

            // Pack archive
            await tar.create({
                gzip: true,
                file: path.join(outFolder, "brain.tgz"),
                prefix: "package/",
                filter: p => p.indexOf("node_modules") == -1,
                cwd: tempFolder
            }, [
                "."
            ])

            // Done
            npmPackagePath = path.join(outFolder, "brain.tgz")

        } else if (fs.existsSync(path.join(opts.path, "package.json"))) {

            // Already in the required format!
            console.log('Path is a npm package folder')

            // Package it. Create temp folder
            console.log('Packaging brain code...')
            let outFolder = tmp.dirSync().name

            // Pack archive
            await tar.create({
                gzip: true,
                file: path.join(outFolder, "brain.tgz"),
                prefix: "package/",
                filter: p => p.indexOf("node_modules") == -1,
                cwd: opts.path
            }, [
                "."
            ])

            // Done
            npmPackagePath = path.join(outFolder, "brain.tgz")

        } else {

            // Unknown format
            throw new Error(`Unknown package format. Please specify either a single .js file, a single .tgz archive packed via 'npm pack', or a folder containing a package.json file.`)

        }

        // Get logged in session
        const BLOCKv = await Config.loadSession()

        // Create data
        let data = new FormData()
        data.append('upload[]', fs.createReadStream(npmPackagePath), { filename: 'brain.tgz', contentType: 'application/gzip' })

        // Submit form
        console.log('Uploading packaged brain from ' + npmPackagePath)
        // await BLOCKv.client.request('POST', '/v1/brains/' + opts.variation, data, true)

        // Done
        console.log('Done.')

    }
}