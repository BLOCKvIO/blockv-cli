
const Blockv = require('@blockv/sdk')

module.exports = class Test {

    static get id() { return "login.email" }
    static get name() { return "Login: Email and password" }
    static async run(ctx) {

        // Create blockv
        let bv = new Blockv({
            appID: "87b4a201-054c-484c-b206-02742ba9ae87",
            server: "https://api.blockv.io"
        })

        // Login
        let info = await bv.UserManager.login(ctx.testAccount1.email, 'email', ctx.testAccount1.password)
        if (info.rawPayload.id != ctx.testAccount1.id) throw new Error('Account ID did not match.')

    }

}