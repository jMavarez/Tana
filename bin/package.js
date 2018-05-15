const cp = require('child_process')
const config = require('../src/config')
const electronPackager = require('electron-packager')
const fs = require('fs')
const path = require('path')
const log = require('./log')
const minimist = require('minimist')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const series = require('run-series')
const zip = require('cross-zip')

const BUILD_NAME = config.APP_NAME + '-' + config.APP_VERSION
const ROOT_PATH = path.join(__dirname, '..')
const DIST_PATH = path.join(ROOT_PATH, 'dist')
const BUILD_PATH = path.join(ROOT_PATH, 'build')
const NODE_MODULES_PATH = path.join(ROOT_PATH, 'node_modules')

const argv = minimist(process.argv.slice(2), {
  string: [
    'package'
  ],
  boolean: [
    'sign',
    'install-deps'
  ],
  default: {
    package: 'all',
    sign: false,
    'install-deps': false
  }
})

function package() {
  if (argv['install-deps']) {
    log.info('Reinstalling node_modules...')
    rimraf.sync(NODE_MODULES_PATH)
    cp.execSync('npm install', { stdio: 'inherit' })
    cp.execSync('npm dedupe', { stdio: 'inherit' })
  }

  log.info('Deleting dist/ and build/...')
  rimraf.sync(DIST_PATH)
  rimraf.sync(BUILD_PATH)

  log.info('Webpack: Building...')
  cp.execSync(
    `webpack --mode=production --env.IS_PRODUCTION --env.IS_PACKAGED`,
    { NODE_ENV: 'production', stdio: 'inherit' }
  )
  log.success('Webpack: Done build.')

  const platform = argv._[0]
  if (platform === 'win32') {
    buildWin32(printDone)
  } else {
    log.error('MacOS/Linux build is not supported yet.')
  }
}

const all = {
  'app-version': config.APP_VERSION,
  asar: {
    unpack: 'Tana*',
    unpackDir: 'node_modules/electron-widevinecdm/widevine'
  },
  'build-version': config.APP_VERSION,
  dir: ROOT_PATH,
  ignore: /^\/src|^\/dist|^\/bin|^\/chrome-extension|\/(AUTHORS|CONTRIBUTORS|\.github|test|tests|test\.js|tests\.js|\.[^/]*|.*\.md|.*\.markdown)$/,
  name: config.APP_NAME,
  out: DIST_PATH,
  overwrite: true,
  prune: true,
  electronVersion: require('electron/package.json').version,
}

const win32 = {
  platform: 'win32',
  arch: [
    'ia32',
    'x64'
  ],
  win32metadata: {
    CompanyName: config.APP_NAME,
    FileDescription: config.APP_NAME,
    OriginalFilename: config.APP_NAME + '.exe',
    ProductName: config.APP_NAME,
    InternalName: config.APP_NAME
  },
  icon: config.APP_ICON + '.ico',
  extraResource: [
    path.join(__dirname, './ffmpeg/ffmpeg.exe')
  ]
}

function buildWin32(cb) {
  const installer = require('electron-winstaller')
  log.info('Windows: Packaging electron...')

  electronPackager(Object.assign({}, all, win32), (err, buildPath) => {
    if (err) return cb(err)
    log.info('Windows: Packaged electron. ' + buildPath)

    const tasks = []
    buildPath.forEach((filesPath) => {
      const destArch = filesPath.split('-').pop()

      if (argv.package === 'exe' || argv.package === 'all') {
        tasks.push((cb) => packageInstaller(filesPath, destArch, cb))
      }
      if (argv.package === 'portable' || argv.package === 'all') {
        tasks.push((cb) => packagePortable(filesPath, destArch, cb))
      }
    })

    series(tasks, cb)

    function packageInstaller(filesPath, destArch, cb) {
      log.info(`Windows: Creating ${destArch} installer...`)

      const arch = destArch === 'ia32' ? '-ia32' : ''

      installer.createWindowsInstaller({
        appDirectory: filesPath,
        authors: "Josue Mavarez",
        description: config.APP_NAME,
        exe: config.APP_NAME + '.exe',
        name: config.APP_NAME,
        noMsi: true,
        outputDirectory: DIST_PATH,
        productName: config.APP_NAME,
        setupExe: config.APP_NAME + '-Windows-Setup-' + config.APP_VERSION + arch + '.exe',
        setupIcon: config.APP_ICON + '.ico',
        title: config.APP_NAME,
        usePackageJson: false,
        version: config.APP_VERSION
      }).then(() => {
        log.success(`Windows: Created ${destArch} installer.`)

        fs.readdirSync(DIST_PATH)
          .filter((name) => name.endsWith('.nupkg') && !name.includes(config.APP_VERSION))
          .forEach((filename) => {
            fs.unlinkSync(path.join(DIST_PATH, filename))
          })

        if (destArch === 'ia32') {
          log.info('Windows: Renaming ia32 installer files...')

          const relPath = path.join(DIST_PATH, 'RELEASES-ia32')
          fs.renameSync(
            path.join(DIST_PATH, 'RELEASES'),
            relPath
          )

          fs.renameSync(
            path.join(DIST_PATH, config.APP_NAME + '-' + config.APP_VERSION + '-full.nupkg'),
            path.join(DIST_PATH, config.APP_NAME + '-' + config.APP_VERSION + '-ia32-full.nupkg')
          )

          const relContent = fs.readFileSync(relPath, 'utf8')
          const relContent32 = relContent.replace('full.nupkg', 'ia32-full.nupkg')
          fs.writeFileSync(relPath, relContent32)

          if (relContent === relContent32) {
            throw new Error('Fixing RELEASES-ia32 failed. Replacement did not modify the file.')
          }

          log.success('Windows: Renamed ia32 installer files.')
        }

        cb(null)
      })
        .catch(cb)
    }

    function packagePortable(filesPath, destArch, cb) {
      log.info(`Windows: Creating ${destArch} portable app...`)

      const portablePath = path.join(filesPath, 'Portable Settings')
      mkdirp.sync(portablePath)

      const downloadsPath = path.join(portablePath, 'Downloads')
      mkdirp.sync(downloadsPath)

      const tempPath = path.join(portablePath, 'Temp')
      mkdirp.sync(tempPath)

      const archStr = destArch === 'ia32' ? '-ia32' : ''

      const inPath = path.join(DIST_PATH, path.basename(filesPath))
      const outPath = path.join(DIST_PATH, BUILD_NAME + '-Windows' + archStr + '.zip')
      zip.zipSync(inPath, outPath)

      log.success(`Windows: Created ${destArch} portable app.`)
      cb(null)
    }
  })
}

function printDone(err) {
  if (err) log.error(err.message || err)
  else log.success('Finished!')

}

package()
