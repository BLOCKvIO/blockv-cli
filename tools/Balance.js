
const commandLineUsage = require('command-line-usage')
const Config = require('../utils/Config')

module.exports = {
    id: 'balance',
    description: "Check your account's VEE balance.",
    args: [
        { name: 'help', type: Boolean }
    ],
    run: async opts => {

        // Show help if needed
        if (opts.help) return console.log(commandLineUsage([
            {
                header: `Balance tool`,
                content: `Checks your account's VEE balance. This only works if you're logged in to a publisher account.`
            }
        ]))

        // Get logged in session
        const BLOCKv = await Config.loadSession()

        // Check balance
        console.log('Checking balance...')
        let walletInfo = await BLOCKv.client.request('GET', '/v1/user/wallet', '', true)
        let balanceInfo = await BLOCKv.Vatoms.performAction(walletInfo.id, 'Balance', { 'coin.name': 'vee' })
        let balance =  parseInt(JSON.parse(balanceInfo)['coin.numCoins'])

        // Output
        console.log(`Available VEE: ${balance}`)

    }

}