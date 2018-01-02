#!/usr/bin/env node
'use strict'

const program = require('commander')
const exists = require('fs').existsSync
const chalk = require('chalk')
const path = require('path')
const home = require('user-home')
const vue = require('./lib/vue')
const vueNode = require('./lib/vue-node')

program
    .usage('<template-name> [project-name]')


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

const tmp = path.join(home, '.vue-templates', template.replace(/\//g, '-'))
if (program.offline) {
    console.log(`> Use cached template at ${chalk.yellow(tildify(tmp))}`)
    template = tmp
}


console.log()
process.on('exit', () => {
    console.log()
})

if (exists(to)) {
    inquirer.prompt([{
        type: 'confirm',
        message: inPlace
            ? 'Generate project in current directory?'
            : 'Target directory exists. Continue?',
        name: 'ok'
    }]).then(answers => {
        if (answers.ok) {
            run()
        }
    }).catch(logger.fatal)
} else {
    run()
}

function run() {
    vue.start()
    vueNode.start()
}