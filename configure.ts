/*
 * @adonisjs/encore
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type Configure from '@adonisjs/core/commands/configure'
import { stubsRoot } from './index.js'

/**
 * Configures the package
 */
export async function configure(command: Configure) {
  const codemods = await command.createCodemods()
  await codemods.makeUsingStub(stubsRoot, 'webpack/webpack_config.stub', {})

  await codemods.updateRcFile((rcFile) => {
    rcFile.addProvider('@adonisjs/encore/encore_provider')
  })

  const packagesToInstall = [
    { name: '@babel/core', isDevDependency: true },
    { name: '@babel/preset-env', isDevDependency: true },
    { name: '@symfony/webpack-encore', isDevDependency: true },
    { name: 'webpack', isDevDependency: true },
    { name: 'webpack-cli', isDevDependency: true },
  ]

  codemods.installPackages(packagesToInstall)
}
