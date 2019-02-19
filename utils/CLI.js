//
// Provides useful stuff for interacting with the command line

const inquirer = require('inquirer')

/** Ask a question via Inquirer. @returns Promise<String> */
module.exports.ask = async (msg, defaultValue) => {
    return (await inquirer.prompt([{ name: 'value', message: msg, default: defaultValue }])).value
}

/** Ask user to choose from a list. @returns Promise<String> */
module.exports.askList = async (msg, choices) => {
    return (await inquirer.prompt([{ name: 'value', message: msg, choices, type: 'list' }])).value
}

/** Ask user to choose multiple items from a list. @returns Promise<[String]> */
module.exports.askListMultiple = async (msg, choices) => {
    return (await inquirer.prompt([{ name: 'value', message: msg, choices, type: 'checkbox' }])).value
}

/** Ask user to confirm yes or no. @returns Promise<bool> */
module.exports.confirm = async (msg, defaultChoice = true) => {
    return (await inquirer.prompt([{ name: 'value', message: msg, type: 'confirm', default: defaultChoice }])).value
}

// /** Waits for the user to press any key in the console. @returns Promise */
// module.exports.pressAnyKey = e => {

//     // Set raw mode
//     // process.stdin.setRawMode(true)

//     // Create promise with resolvable callback
//     return new Promise(resolve => {

//         // Wait for input data
//         process.stdin.once('data', () => {

//             // Turn raw mode off again
//             // process.stdin.setRawMode(false)

//             // Resolve promise
//             resolve()

//         })

//     })

// }