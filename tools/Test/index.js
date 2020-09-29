
const commandLineUsage = require('command-line-usage')
const chalk = require('chalk')

module.exports = {
    id: 'test',
    description: 'Runs tests against the backend system.',
    args: [
        { name: 'help', type: Boolean },
        { name: 'name', type: String },
        { name: 'repeat', type: Number, defaultValue: 1 },
        { name: 'delay', type: Number, defaultValue: 5 }
    ],
    run: async opts => {

        // List of all tests
        const Tests = [
            require('./login/email'),
            require('./websocket/map')
        ]

        // Show help if needed
        if (opts.help) return console.log(commandLineUsage([
            {
                header: `Test runner`,
                content: `Allows you to run tests against the backend system.

Usage:  {underline blockv test --name <test-name>}
Example: blockv test --name websocket
Example: blockv test --name websocket.map,login.email`
            },
            {
                header: `Options`,
                optionList: [
                    {
                        name: 'name',
                        typeLabel: '{underline TestName}',
                        description: `The name of a test to run. You can supply a single test, a prefix, or a comma separated list.`
                    },
                    {
                        name: 'tduration',
                        typeLabel: '{underline Seconds}',
                        description: `Duration param passed to the test.`
                    },
                    {
                        name: 'repeat',
                        typeLabel: '{underline Count}',
                        description: `The number of times to run the tests. Default is 1. Zero or less will repeat indefinitely.`
                    },
                    {
                        name: 'delay',
                        typeLabel: '{underline Seconds}',
                        description: `Delay between test runs. Default is 5 seconds.`
                    }
                ]
            }
        ]))

        // Show list of tests
        if (!opts.name) return console.log(commandLineUsage([
            {
                header: 'Available tests',
                content: Tests.map(test => ({
                    a: test.id,
                    b: test.name
                }))
            }
        ]))

        // Create list of tests to run
        let testsToRun = []
        for (let testName of opts.name.split(',')) {

            // Add all tests with this name as a prefix
            for (let test of Tests) {

                if (test.id.startsWith(testName.trim()) && !testsToRun.includes(test)) {
                    testsToRun.push(test)
                }

            }

        }

        // Special case: If 'all' is passed as the name, select all tests
        if (opts.name.toLowerCase() == 'all')
            testsToRun = Tests

        // Ensure any tests were selected
        if (testsToRun.length == 0)
            throw new Error('No tests found with the specified name.')

        // Count how many times to run the tests
        let repeat = opts.repeat
        if (repeat <= 0)
            repeat = Infinity

        // Run tests
        for (let i = 0 ; i < repeat ; i++) {
            
            // Run a test
            for (let test of testsToRun) {

                // Create context
                let ctx = createContext()

                try {

                    // Run test
                    console.log(chalk.bold(test.name))
                    await test.run(ctx)
                    console.log(chalk.green('PASSED '))

                } catch (err) {

                    // Test failed
                    console.log(chalk.red('FAILED: ') + err.message)

                }

                // Cleanup
                for (let clean of ctx.cleanup)
                    await clean()

                console.log('')


            }

            // Delay
            if (i+1 < repeat)
                await new Promise(c => setTimeout(c, opts.delay * 1000))

        }

    }
}

/// Creates a context for use by a test
function createContext() {

    return {

        // Email based test account
        testAccount1: {
            id: '9e3f05cd-fd65-4db4-abe5-1b44dba55a7d',
            email: 'jjv360+test1@me.com',
            password: 'test'
        },
        
        // Email based test account
        testAccount2: {
            id: '3c8a915e-c70a-42df-9196-63ae869b21a3',
            email: 'jjv360+test2@me.com',
            password: 'test'
        },

        // Cleanup functions to call afterwards
        cleanup: []

    }

}