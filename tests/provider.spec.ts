import { test } from '@japa/runner'
import { setupApp } from '../tests_helpers/index.js'

test.group('Encore provider', () => {
  test('register encore service provider', async ({ assert }) => {
    const { app } = await setupApp('web')
    const encore = await app.container.make('encore')

    assert.exists(encore)
  })

  test('register encore tags', async ({ assert }) => {
    const { app } = await setupApp('web')
    const view = await app.container.make('view')
    const tags = Object.keys(view.tags)

    assert.includeMembers(tags, ['entryPointStyles', 'entryPointScripts'])
  })

  test('register encore globals', async ({ assert }) => {
    const { app } = await setupApp('web')
    const view = await app.container.make('view')
    const globals = Object.keys(view.GLOBALS)

    assert.includeMembers(globals, ['encore', 'asset'])
  })

  test('get scripts assets tag', async ({ fs, assert }) => {
    const { app } = await setupApp('web')
    const encore = await app.container.make('encore')

    await fs.create('public/assets/app.js', 'console.log("Hello world")')
    await fs.createJson('public/assets/entrypoints.json', {
      entrypoints: { app: { js: ['http://localhost:8080/app.js'] } },
    })

    assert.equal(
      encore.generateEntryPointsScriptTags('app'),
      `<script src="http://localhost:8080/app.js"></script>`
    )
  })

  test('apply custom attributes to the scripts tags', async ({ fs, assert }) => {
    const { app } = await setupApp('web')
    const encore = await app.container.make('encore')

    encore.setScriptAttributes({ defer: true, foo: false })

    await fs.create('public/assets/app.js', 'console.log("Hello world")')
    await fs.createJson('public/assets/entrypoints.json', {
      entrypoints: { app: { js: ['http://localhost:8080/app.js'] } },
    })

    assert.equal(
      encore.generateEntryPointsScriptTags('app'),
      `<script defer src="http://localhost:8080/app.js"></script>`
    )
  })

  test('get style assets tag', async ({ fs, assert }) => {
    const { app } = await setupApp('web')
    const encore = await app.container.make('encore')

    await fs.create('public/assets/app.css', 'body { color: red }')
    await fs.createJson('public/assets/entrypoints.json', {
      entrypoints: { app: { css: ['http://localhost:8080/app.css'] } },
    })

    assert.equal(
      encore.generateEntryPointsStyleTags('app'),
      `<link rel="stylesheet" href="http://localhost:8080/app.css">`
    )
  })

  test('raise exception when manifest.json is missing', async ({ assert }) => {
    const { app } = await setupApp('web')
    const encore = await app.container.make('encore')

    assert.throws(
      () => encore.manifest(),
      `Cannot find "${app.publicPath(
        'assets/manifest.json'
      )}" file. Make sure you are compiling assets`
    )
  })

  test('raise exception when entrypoints.json file is missing', async ({ assert }) => {
    const { app } = await setupApp('web')
    const encore = await app.container.make('encore')

    assert.throws(
      () => encore.entryPointJsFiles('app'),
      `Cannot find "${app.publicPath(
        'assets/entrypoints.json'
      )}" file. Make sure you are compiling assets`
    )
  })

  test('get manifest data', async ({ fs, assert }) => {
    const { app } = await setupApp('web')
    const encore = await app.container.make('encore')

    await fs.createJson('public/assets/manifest.json', { 'app.js': 'app.js' })

    assert.deepEqual(encore.manifest(), { 'app.js': 'app.js' })
  })

  test('get entrypoints data', async ({ fs, assert }) => {
    const { app } = await setupApp('web')
    const encore = await app.container.make('encore')

    await fs.createJson('public/assets/entrypoints.json', {
      entrypoints: { app: { js: ['http://localhost:8080/app.js'] } },
    })

    const entrypoints = encore.entryPoints()

    assert.deepEqual(entrypoints, {
      app: { js: ['http://localhost:8080/app.js'] },
    })
  })

  test('get entrypoints js files', async ({ fs, assert }) => {
    const { app } = await setupApp('web')
    const encore = await app.container.make('encore')

    await fs.createJson('public/assets/entrypoints.json', {
      entrypoints: { app: { js: ['http://localhost:8080/app.js'] } },
    })

    const jsFiles = encore.entryPointJsFiles('app')

    assert.deepEqual(jsFiles, ['http://localhost:8080/app.js'])
  })

  test('get entrypoints css files', async ({ fs, assert }) => {
    const { app } = await setupApp('web')
    const encore = await app.container.make('encore')

    await fs.createJson('public/assets/entrypoints.json', {
      entrypoints: { app: { css: ['http://localhost:8080/app.css'] } },
    })

    const cssFiles = encore.entryPointCssFiles('app')

    assert.deepEqual(cssFiles, ['http://localhost:8080/app.css'])
  })

  test('get empty array when js files are missing', async ({ fs, assert }) => {
    const { app } = await setupApp('web')
    const encore = await app.container.make('encore')

    await fs.createJson('public/assets/entrypoints.json', {
      entrypoints: { app: { css: ['http://localhost:8080/app.css'] } },
    })

    assert.deepEqual(encore.entryPointJsFiles('app'), [])
  })

  test('get empty array when css files are missing', async ({ fs, assert }) => {
    const { app } = await setupApp('web')
    const encore = await app.container.make('encore')

    await fs.createJson('public/assets/entrypoints.json', {
      entrypoints: { app: { js: ['http://localhost:8080/app.js'] } },
    })

    assert.deepEqual(encore.entryPointCssFiles('app'), [])
  })

  test('raise exception when entrypoint itself is missing', async ({ fs, assert }) => {
    const { app } = await setupApp('web')
    const encore = await app.container.make('encore')

    await fs.createJson('public/assets/entrypoints.json', {
      entrypoints: {},
    })

    assert.throws(() => encore.entryPointJsFiles('app'), 'Cannot find assets for "app"')
  })

  test('get path for a given asset', async ({ fs, assert }) => {
    const { app } = await setupApp('web')
    const encore = await app.container.make('encore')

    await fs.createJson('public/assets/manifest.json', {
      'app.js': 'https://localhost:3333/app.js',
    })

    assert.equal(encore.assetPath('app.js'), 'https://localhost:3333/app.js')
  })

  test('raise exception when asset is missing', async ({ fs, assert }) => {
    const { app } = await setupApp('web')
    const encore = await app.container.make('encore')

    await fs.createJson('public/assets/manifest.json', {
      'app.js': 'https://localhost:3333/app.js',
    })

    assert.throws(() => encore.assetPath('app.css'), 'Cannot find path for "app.css" asset.')
  })
})
