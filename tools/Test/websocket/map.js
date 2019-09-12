
const Blockv = require('@blockv/sdk')
const AsyncWebSocket = require('../../../utils/AsyncWebSocket')

module.exports = class Test {

    static get id() { return "websocket.map" }
    static get name() { return "WebSocket: Map add/remove events" }
    static async run(ctx) {

        /**
         * This tests the "map" events coming through the WebSocket. These events are only sent if an item is
         * dropped or picked up _from another account_, so we need to log into one account to do the drop and pickup,
         * and another account to monitor the WebSocket.
         */

        // Map area to do our tests in, small area
        let MapAreas = [{
            top_right: {
                lat: -33.779017924505226,
                lon: 18.801525323094182
            },
            bottom_left: {
                lat: -33.78777074674279,
                lon: 18.78692118904661
            }
        }]

        // Repeat above test
        MapAreas.push(MapAreas[0])

        // Bigger map area test
        // MapAreas.push({
        //     top_right: {
        //         lat: -32.779017924505226,
        //         lon: 20.801525323094182
        //     },
        //     bottom_left: {
        //         lat: -34.78777074674279,
        //         lon: 16.78692118904661
        //     }
        // })

        // MapAreas.push({
        //     top_right: {
        //         lat: -33.615523354283376,
        //         lon: 19.067238288838666
        //     },
        //     bottom_left: {
        //         lat: -33.949868679436236,
        //         lon: 18.514462852570432
        //     }
        // })

        // console.log(`- Test area top right: lat = ${MapArea.top_right.lat}, lon = ${MapArea.top_right.lon}`)
        // console.log(`- Test area bottom left: lat = ${MapArea.bottom_left.lat}, lon = ${MapArea.bottom_left.lon}`)

        // Create blockv1
        let bv1 = new Blockv({
            appID: "87b4a201-054c-484c-b206-02742ba9ae87",
            server: "https://api.blockv.io",
            websocketAddress: "wss://newws.blockv.io"
        })

        // Login
        console.log('- Logging in to two accounts')
        let info1 = await bv1.UserManager.login(ctx.testAccount1.email, 'email', ctx.testAccount1.password)
        
        // Fetch vatoms
        info1 = await bv1.client.request('POST', '/v1/user/vatom/inventory', { parent_id: '.', page_amount: 100 }, true)
        let vatoms = info1.vatoms.filter(v => !v['vAtom::vAtomType'].in_contract && !v['vAtom::vAtomType'].dropped && !v['vAtom::vAtomType'].template.includes('Avatar'))
        
        // Pick a random vatom to test
        let randomIdx = Math.floor(Math.random() * vatoms.length)
        let vatomID = vatoms[randomIdx] && vatoms[randomIdx].id
        
        // Cleanup: If no vatoms in this account, pick up a vatom within our test area on the map
        if (vatoms.length == 0) {

            // Fetch vatoms within region
            info1 = await bv1.client.request('POST', '/v1/vatom/geodiscover', { 
                limit: 10000, 
                filter: 'all',
                bottom_left: MapAreas[0].bottom_left,
                top_right: MapAreas[0].top_right
            }, true)

            console.log('- Cleaning up vatom test area on the map')
            let vatom = info1.vatoms[0]
            if (vatom) {

                // Pick up this vatom
                await bv1.client.request('POST', '/v1/user/vatom/action/Pickup', {
                    "this.id": vatom.id
                }, true)
                
                // Use this vatom
                vatomID = vatom.id

            }

        }

        // If still no vatom ID, the account is out of vatoms
        if (!vatomID)
            throw new Error('No vatom found to use for testing! Please send a vatom to ' + ctx.testAccount1.email)

        // Create blockv1
        let bv2 = new Blockv({
            appID: "87b4a201-054c-484c-b206-02742ba9ae87",
            server: "https://api.blockv.io",
            websocketAddress: "wss://newws.blockv.io"
        })

        // Log into account 2
        let info2 = await bv2.UserManager.login(ctx.testAccount2.email, 'email', ctx.testAccount2.password)

        // Connect WebSockets for multi client test
        await bv2.client.checkToken()
        let sockets = []
        for (let i = 0 ; i < 3 ; i++) {

            // Connect socket
            const url = `${bv2.store.websocketAddress}/ws?app_id=${encodeURIComponent(bv2.store.appID)}&token=${encodeURIComponent(bv2.store.token)}`
            let ws2 = new AsyncWebSocket(url)
            await ws2.connect()
            sockets.push(ws2)
            
        }

        // Close sockets after this test
        ctx.cleanup.push(e => {
            for (let sock of sockets) sock.close()
        })

        // How many times to retry this test?
        for (let mapArea of MapAreas) {

            // Send monitor region command
            for (let sock of sockets) await sock.send({
                id: '1',
                version: '1',
                type: 'command',
                cmd: 'monitor',
                payload: {
                    top_left: {
                        lat: Math.max(mapArea.top_right.lat, mapArea.bottom_left.lat),
                        lon: Math.min(mapArea.top_right.lon, mapArea.bottom_left.lon)
                    },
                    bottom_right: {
                        lat: Math.min(mapArea.top_right.lat, mapArea.bottom_left.lat),
                        lon: Math.max(mapArea.top_right.lon, mapArea.bottom_left.lon)
                    }
                }
            })

            // Wait for command to reach the backend
            // TODO: Better way of knowing?
            await new Promise(c => setTimeout(c, 500))

            // Drop vatom
            console.log('- Performing test')
            await bv1.client.request('POST', '/v1/user/vatom/action/Drop', {
                "this.id": vatomID,
                "geo.pos": {
                    lat: (MapAreas[0].bottom_left.lat + MapAreas[0].top_right.lat) / 2,
                    lon: (MapAreas[0].bottom_left.lon + MapAreas[0].top_right.lon) / 2,
                }
            }, true)

            // Wait for drop event on all sockets
            for (let sock of sockets)
                await sock.read(msg => msg.msg_type == 'map' && msg.payload.op == 'add' && msg.payload.vatom_id == vatomID)

            // console.log('- Drop message received successfully')

            // Do pickup
            await bv1.client.request('POST', '/v1/user/vatom/action/Pickup', {
                "this.id": vatomID
            }, true)

            // Wait for pickup event on all sockets
            for (let sock of sockets)
                await sock.read(msg => msg.msg_type == 'map' && msg.payload.op == 'remove' && msg.payload.vatom_id == vatomID)

            // console.log('- Pickup message received successfully')

        }

    }

}