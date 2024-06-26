// @ts-check

import env from '@next/env'
import { execSync } from 'child_process'

/**
 * Loads the environment variables from the .env file.
 * @param {string} cwd - The current working directory.
 * @param {boolean} [dev] - Whether to load the development environment variables.
 */
env.loadEnvConfig(process.cwd(), true)

const projectID = process.env.SUPABASE_PROJECT_ID

if (!projectID) {
    console.error('SUPABASE_PROJECT_ID environment variable is not set.')
    process.exit(1)
}

/**
 * Base directory for all generated types.
 */
const baseOutputDir = 'src/types'

/**
 * Configuration mapping for type generation.
 * @type {Object<string, string>}
 */
const commands = {
    contracts: 'wagmi generate -c wagmi-cli.config.ts',
    db: `pnpm dlx supabase gen types typescript --project-id ${projectID} >`,
}

/**
 * Generates types based on the provided type.
 * @param {string} type - The type of generation to perform.
 */
function generateTypes(type) {
    const selectedCommand = commands[type]

    if (!selectedCommand) {
        console.error(`No configuration found for type: ${type}, use one of ${Object.keys(commands).join(', ')}`)
        return
    }

    let command = `${selectedCommand} ${baseOutputDir}/${type}.ts`

    console.log(`Generating types for ${type}...`)
    execSync(command, { stdio: 'inherit' })
    execSync(`prettier -w ${baseOutputDir}/${type}.ts`, { stdio: 'inherit' })
}

/**
 * The main function that orchestrates type generation based on command line argument.
 */
function main() {
    const type = process.argv[2] // Takes the type argument from the command line
    if (!type) {
        console.log('No type specified, generating all types for contracts and db.')
        for (const key of Object.keys(commands)) {
            generateTypes(key)
        }
    } else {
        generateTypes(type)
    }
}

main()
