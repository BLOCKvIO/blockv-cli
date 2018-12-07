//
// Global instance of the BLOCKv class

const Blockv = require('@blockv/sdk')

module.exports = new Blockv({
    appID: "87b4a201-054c-484c-b206-02742ba9ae87",
    server: "https://api.blockv.io",
    websocketAddress: "wss://ws.blockv.io"
})
