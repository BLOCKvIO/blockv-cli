
const commandLineUsage = require('command-line-usage')
const Config = require('../utils/Config')
const { ask } = require('../utils/CLI')
const opn = require('opn')
const chalk = require('chalk')
const tmp = require('tmp')
const fs = require('fs')

module.exports = {
    id: 'app-create',
    description: 'Creates an app ID.',
    args: [
        { name: 'name' },
        { name: 'help', type: Boolean }
    ],
    run: async opts => {

        // Show help if needed
        if (opts.help) return console.log(commandLineUsage([
            {
                header: `App Create tool`,
                content: `Creates an app ID for use with the API.`
            },
            {
                header: `Options`,
                optionList: [
                    {
                        name: 'name',
                        typeLabel: '{underline AppName}',
                        description: `{italic (required)} The name for your app.`
                    }
                ]
            }
        ]))

        // Check required fields
        if (!opts.name) return console.log('Please specify --name')

        // Get logged in session
        const BLOCKv = await Config.loadSession()
        let userInfo = await BLOCKv.UserManager.getCurrentUser()

        // Fetch captcha
        console.log('Fetching captcha...')
        let captcha = await BLOCKv.client.request('GET', '/v1/captcha', null, true)

        // Display captcha ina  simple html file
        let htmlName = tmp.tmpNameSync({ postfix: '.html' })
        let html = `<img src='${captcha.image}'/>`
        fs.writeFileSync(htmlName, html)
        console.log(chalk.yellow('Opening captcha image in the browser...'))
        opn(htmlName)

        // Ask user to enter captcha value
        let captchaValue = await ask("Enter captcha: ")
        if (!captchaValue)
            return
        
        // Create app
        let info = await BLOCKv.client.request('POST', '/v1/publisher/apps', {
            "captcha": {
                "id": captcha.id, "value": captchaValue
            },
            "name": opts.name,
            "fqdn": userInfo.pubFqdn,
            "needs_signature": false,
            "disabled": false,
            "before_triggers": {},
            "after_triggers": {},
            "push_notifications": ["blockv.*"],
            "smtp_server":"",
            "smtp_port":25,
            "smtp_user":"",
            "smtp_password":"",
            "smtp_from":"",
            "verify_code_auto_send_off": false,
            "supported_version": "0.1",
            "update_url": "",
            "use_captcha":false
        }, true)

        // Done
        console.log(info.success_message)

    }

}