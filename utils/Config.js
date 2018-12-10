
const settings = require('user-settings').file('.blockv')
const Blockv = require('@blockv/sdk')

module.exports = {}

module.exports.saveSession = function(refreshToken, server) {

    // Save to config
    settings.set('refresh_token', refreshToken)
    settings.set('server', server)

}

module.exports.loadSession = async function() {

    // Get values
    let refreshToken = settings.get('refresh_token')
    let server = settings.get('server')
    if (!refreshToken || !server)
        throw new Error('Please login first.')

    // Create new BLOCKv session
    let bv = new Blockv({
        appID: "87b4a201-054c-484c-b206-02742ba9ae87",
        server: server
    })

    // Apply refresh token
    bv.store.refreshToken = refreshToken

    // Make sure it's valid
    try {
        console.log('Checking session...')
        await bv.UserManager.getCurrentUser()
    } catch (err) {
        throw new Error('Please login first.')
    }

    // Done
    return bv

}