
const AppInfo = require('../package.json')
const commandLineUsage = require('command-line-usage')

module.exports = {
    id: 'about',
    description: 'Displays general information and a list of all tools.',
    args: [],
    run: e => {

        // Create help menu
        let menu = []
        menu.push({ 
            header: `BLOCKv tools - Version ${AppInfo.version}`,
            content: `This provides a collection of CLI tools to help in creating vAtoms.\n\nUsage:  {underline blockv <tool-name>}`
        })

        // Add list of tools
        menu.push({
            header: `Available Tools`,
            content: []
        })

        let tools = Object.values(require('./index')).sort((a, b) => a.id.localeCompare(b.id))
        for (let tool of tools) {
            menu[1].content.push({
                a_id: tool.id,
                b_desc: tool.description
            })
        }

        // Display it
        console.log(commandLineUsage(menu))

    }
}