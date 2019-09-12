
const WebSocket = require('websocket').w3cwebsocket
const chalk = require('chalk')

/**
 * Wraps the WebSocket class and adds tools for testing
 */
module.exports = class AsyncWebSocket {

    constructor(url) {

        // Store URL
        this.url = url

        // Connection error
        this.error = null

        // Buffered incoming messages
        this.incoming = []

    }

    /** Connect the socket. Only call this once. */
    async connect() {

        // Stop if already connected
        if (this.socket)
            throw new Error('connect() can only be called once.')

        // Create socket
        this.socket = new WebSocket(this.url)
        this.socket.onmessage = this.onMessage.bind(this)

        // Create promise
        await new Promise((resolve, reject) => {

            // Add listeners
            this.socket.onopen = resolve
            this.socket.onerror = err => reject("The WebSocket was unable to connect to " + this.url)

        })

        // Re-assign event handlers
        // this.socket.onclose = e => {
        //     this.error = this.error || new Error('WebSocket closed unexpectedly.')
        //     console.log('WebSocket closed unexpectedly')
        //     if (this.pendingPromise) {
        //         this.pendingPromise.reject(this.error)
        //         this.pendingPromise = null
        //     }
        // }
        this.socket.onerror = err => {
            this.error = new Error('WebSocket closed unexpectedly.')
            console.log(err)
            if (this.pendingPromise) {
                this.pendingPromise.reject(this.error)
                this.pendingPromise = null
            }
        }

    }

    /** @private */
    onMessage(e) {

        // If a pending promise exists, pass to it
        if (this.pendingPromise) {
            this.pendingPromise.resolve(e.data)
            this.pendingPromise = null
            return
        }

        // Otherwise store in the buffer
        this.incoming.push(e.data)

    }

    /** @private Read a single message from the websocket. @returns {String} */
    _read() {

        // Check if this connection is closed
        if (this.error)
            throw this.error

        // Check if our buffer has anything for us
        let msg = this.incoming.shift()
        if (msg)
            return msg

        // Nope, create a stored promise and wait
        return new Promise((resolve, reject) => {
            this.pendingPromise = { resolve, reject }
        })

    }

    /** Read a single message from the websocket, specifying a message filter function and timeout. @returns {Object} */
    async read(filter = null, timeout = 15000) {

        // Create timeout
        let timeoutHandle = setTimeout(e => {
            this.socket.onerror(new Error('Timed out waiting for expected message. Timeout = ' + timeout + 'ms'))
        }, timeout)

        // Read messages
        while (true) {

            // Read a message
            let msg = await this._read()

            // Parse it
            msg = JSON.parse(msg)

            // Check if it matches the type
            if (!filter || filter(msg)) {

                // Matched
                clearTimeout(timeoutHandle)
                return msg

            }

            // Didn't match, skip message
            console.log(chalk.gray('- Skipped message: ' + msg.msg_type + ' - ' + JSON.stringify(msg)))

        }

    }

    /** Send a JSON object up the websocket */
    send(obj) {
        this.socket.send(JSON.stringify(obj))
    }

    /** Close the socket */
    close() {
        if (this.socket) this.socket.close()
    }

}