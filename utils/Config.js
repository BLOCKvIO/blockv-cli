
const settings = require('user-settings').file('.blockv')
const Blockv = require('@blockv/sdk')
const fs = require('fs')
const os = require('os')

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
        let user = await bv.UserManager.getCurrentUser()

        // Log user info
        console.log('Logged into ' + server + ' as ' + (user.firstName || 'No Name'))

    } catch (err) {
        throw new Error('Please login first.')
    }

    // Add log output to request function
    bv.client.originalRequest = bv.client.request
    bv.client.request = function(method, endpoint, payload, auth) {

        // Do request
        return bv.client.originalRequest(method, endpoint, payload, auth).then(out => {

            // Success, log to file
            module.exports.log(`${method} ${endpoint}\n${JSON.stringify(payload, null, 2)}\n\n${JSON.stringify(out, null, 2)}\n\n\n\n`)
            return out

        }).catch(err => {

            // Failed, log to file
            module.exports.log(`${method} ${endpoint}\n${JSON.stringify(payload, null, 2)}\n\nFAILED: ${err.message}\n\n\n\n`)
            throw err

        })

    }

    // Done
    return bv

}

/** Output text to log file */
module.exports.log = function(text) {

    // Ignore errors
    try {

        // Append to log file
        fs.appendFileSync(os.homedir() + '/.blockv.log', text)

    } catch (e) {}

}