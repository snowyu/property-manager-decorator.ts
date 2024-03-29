const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const uglify = require('uglify-es')
const rollup = require('rollup')
const replace = require('@rollup/plugin-replace')
const {babel} = require('@rollup/plugin-babel')
const pkg = require('../package.json')
const version = process.env.VERSION || pkg.version
const banner =
`/**
  * property-manager-decorator v${version}
  * (c) 2020-present Riceball LEE
  * @license MIT
  */`

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

const resolve = _path => path.resolve(__dirname, '../', _path)
const babelCommonConfig = {
  babelHelpers: 'bundled'
}

const babelConfigForModern = {
  ...babelCommonConfig,
  presets: [
    [
      '@babel/env',
      {
        modules: false,
        targets: {
          esmodules: true
        }
      }
    ]
  ]
}

const babelConfigForLegacy = {
  ...babelCommonConfig,
  presets: [
    [
      '@babel/env',
      {
        modules: false
      }
    ]
  ]
}

build([
  {
    file: resolve('dist/property-manager-decorator.js'),
    format: 'umd',
    env: 'development'
  },
  {
    file: resolve('dist/property-manager-decorator.min.js'),
    format: 'umd',
    env: 'production'
  },
  {
    file: resolve('dist/property-manager-decorator.common.js'),
    format: 'cjs'
  },
  {
    file: resolve('dist/property-manager-decorator.esm.js'),
    format: 'esm'
  },
  {
    file: resolve('dist/property-manager-decorator.esm.browser.js'),
    format: 'esm',
    env: 'development'
  },
  {
    file: resolve('dist/property-manager-decorator.esm.browser.min.js'),
    format: 'esm',
    env: 'production'
  }
].map(genConfig)).catch(() => {
  process.exit(1)
})

function genConfig (opts) {
  const config = {
    input: {
      input: resolve('lib/index.js'),
      external: [].concat(Object.keys(pkg.dependencies || {})).concat(Object.keys(pkg.peerDependencies || {})),
      // external: ['property-manager/lib/ability', 'lodash', 'memoizee'],
      plugins: [
        babel(
          opts.format === 'esm' && typeof opts.env === 'string'
            ? babelConfigForModern
            : babelConfigForLegacy
        )
      ]
    },
    output: {
      file: opts.file,
      format: opts.format,
      banner,
      name: 'PropertyManagerDecorator',
      exports: 'named',
      globals: {
      }
    }
  }

  if (opts.env) {
    config.input.plugins.unshift(replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(opts.env)
    }))
  }

  return config
}

function build (builds) {
  let built = 0
  const total = builds.length
  const next = () => {
    return buildEntry(builds[built]).then(() => {
      built++
      if (built < total) {
        return next()
      }
    }).catch(error => {
      logError(error)
      throw error
    })
  }

  return next()
}

function buildEntry ({ input, output }) {
  const isProd = /min\.js$/.test(output.file)
  return rollup.rollup(input)
    .then(bundle => bundle.generate(output))
    .then(result => {
      const { code } = result.output[0]
      if (isProd) {
        const minified = uglify.minify(code, {
          output: {
            preamble: output.banner,
            ascii_only: true
          }
        }).code
        return write(output.file, minified, true)
      } else {
        return write(output.file, code)
      }
    })
}

function write (dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report (extra) {
      console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''))
      resolve()
    }

    fs.writeFile(dest, code, err => {
      if (err) return reject(err)
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err)
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report()
      }
    })
  })
}

function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError (e) {
  console.log(e)
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
