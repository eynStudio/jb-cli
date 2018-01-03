const chalk = require('chalk')
const Metalsmith = require('metalsmith')
const Handlebars = require('handlebars')
const path = require('path')
const getOptions = require('./options')
const async = require('async')
const filter = require('./filter')
const logger = require('./logger')
const multimatch = require('multimatch')

module.exports = function gen(name, src, dest, done) {

    console.log(name, src, dest,process.cwd())
    const opts = getOptions(name, src)
    const metalsmith = Metalsmith(src)

    const data = Object.assign(metalsmith.metadata(), {
        destDirName: name,
        inPlace: dest === process.cwd(),
        noEscape: true
    })
    console.log(data)
    const helpers = { chalk, logger }

    metalsmith
        // .use(askQuestions(opts.prompts))
        .use(filterFiles(opts.filters))
        .use(renderTemplateFiles(false))
        // .use(renderTemplateFiles(opts.skipInterpolation))


    metalsmith.clean(false)
        .source('.') 
        .destination(dest)
        .build((err, files) => {
            done(err)
            if (typeof opts.complete === 'function') {
                const helpers = { chalk, logger, files }
                opts.complete(data, helpers)
            } else {
                logMessage(opts.completeMessage, data)
            }
        })

    return data

}

function filterFiles(filters) {
    return (files, metalsmith, done) => {
        filter(files, filters, metalsmith.metadata(), done)
    }
}

function renderTemplateFiles(skipInterpolation) {
    skipInterpolation = typeof skipInterpolation === 'string'
        ? [skipInterpolation]
        : skipInterpolation
    return (files, metalsmith, done) => {
        const keys = Object.keys(files)
        const metalsmithMetadata = metalsmith.metadata()
        async.each(keys, (file, next) => {
            // skipping files with skipInterpolation option
            if (skipInterpolation && multimatch([file], skipInterpolation, { dot: true }).length) {
                return next()
            }
            const str = files[file].contents.toString()
            // do not attempt to render files that do not have mustaches
            if (!/{{([^{}]+)}}/g.test(str)) {
                return next()
            }
            render(str, metalsmithMetadata, (err, res) => {
                if (err) {
                    err.message = `[${file}] ${err.message}`
                    return next(err)
                }
                files[file].contents = new Buffer(res)
                next()
            })
        }, done)
    }
}

function logMessage(message, data) {
    if (!message) return
    render(message, data, (err, res) => {
        if (err) {
            console.error('\n   Error when rendering template complete message: ' + err.message.trim())
        } else {
            console.log('\n' + res.split(/\r?\n/g).map(line => '   ' + line).join('\n'))
        }
    })
}