#!/usr/bin/env node
'use strict'

const download = require('download-git-repo')
const program = require('commander')
const exists = require('fs').existsSync
const chalk = require('chalk')
const path = require('path')
const ora = require('ora')
const home = require('user-home')
const gen = require('./lib/gen')
const vue = require('./lib/vue')
const vueNode = require('./lib/vue-node')
const inquirer = require('inquirer')
const rm = require('rimraf').sync
const tildify = require('tildify')
const logger = require('./lib/logger')

program
    .usage('<template-name> [project-name]')
    .option('--offline', 'use cached template')

program.on('--help', () => {
    console.log('  Examples:')
    console.log()
    console.log(chalk.gray('    # help info'))
    console.log()
})

function help() {
    program.parse(process.argv)
    if (program.args.length < 1) return program.help()
}
help()

let template = program.args[0]
const hasSlash = template.indexOf('/') > -1
const rawName = program.args[1]
const inPlace = !rawName || rawName === '.'
const name = inPlace ? path.relative('../', process.cwd()) : rawName
const to = path.resolve(rawName || '.')
const clone = program.clone || false

const tmp = path.join(home, '.jb-seeds', template.replace(/\//g, '-'))
// if (program.offline) {
//     console.log(`> Use cached template at ${chalk.yellow(tildify(tmp))}`)
//     template = tmp
// }


console.log()
process.on('exit', () => {
    console.log()
})

// if (exists(to)) {
//     inquirer.prompt([{
//         type: 'confirm',
//         message: inPlace
//             ? 'Generate project in current directory?'
//             : 'Target directory exists. Continue?',
//         name: 'ok'
//     }]).then(answers => {
//         console.log(answers)
//         if (answers.ok) {
//             run()
//         }
//     }).catch(logger.fatal)
// } else {
//     run()
// }

run()

function run() {
    // vue.start()
    // vueNode.start()
    console.log("xx", tmp, template)

    if (program.offline) {
        console.log(`> Use cached template at ${chalk.yellow(tildify(tmp))}`)
        gen(name, tmp, to, err => {
            // if (err) logger.fatal(err)
            console.log()
            console.log('Generated "%s".', name)
        })

    } else {

        const spinner = ora('downloading template')
        spinner.start()
        if (exists(tmp)) rm(tmp)

        const officialTemplate = 'eynStudio/jb-seed#' + template

        download(officialTemplate, tmp, { clone }, err => {
            spinner.stop()
            if (err) logger.fatal('Failed to download repo ' + template + ': ' + err.message.trim())
            gen(name, tmp, to, err => {
                // if (err) logger.fatal(err)
                console.log()
                console.log('Generated "%s".', name)
            })
        })
    }
}