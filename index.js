#!/usr/bin/env node
'use strict'

const program = require('commander')
const chalk = require('chalk')

program
    .usage('<template-name> [project-name]')


program.on('--help', () => {
    console.log()
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