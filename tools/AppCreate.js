
const commandLineUsage = require('command-line-usage')
const Config = require('../utils/Config')
const doCaptcha = require('../utils/Captcha')

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

        // Get captcha
        let captcha = await doCaptcha(BLOCKv)
        
        // Create app
        let info = await BLOCKv.client.request('POST', '/v1/publisher/apps', {
            "captcha": captcha,
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