//
// Handles captcha integration with BLOCKv


const { ask } = require('../utils/CLI')
const opn = require('opn')
const tmp = require('tmp')
const fs = require('fs')
const chalk = require('chalk')

/** 
 * Requests a captcha code from the backend, shows it to the user, asks the user for the response, then 
 * returns an objects containing `id` and `value`.
 */
module.exports = async function get(BLOCKv) {

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
    return {
        id: captcha.id,
        value: captchaValue
    }

}