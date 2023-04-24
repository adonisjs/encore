/*
 * @adonisjs/encore
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type Configure from '@adonisjs/core/commands/configure'

/**
 * Configures the package
 */
export async function configure(command: Configure) {
  const stubDestination = join(fileURLToPath(command.app.appRoot), 'webpack.config.cjs')

  await command.publishStub('webpack/webpack_config.stub', {
    destination: stubDestination,
  })

  await command.updateRcFile((rcFile) => {
    rcFile.addProvider('@adonisjs/encore/providers/encore_provider')
  })

  const packagesToInstall = [
    { name: '@babel/core', isDevDependency: true },
    { name: '@babel/preset-env', isDevDependency: true },
    { name: '@symfony/webpack-encore', isDevDependency: true },
    { name: 'webpack', isDevDependency: true },
    { name: 'webpack-cli', isDevDependency: true },
  ]
  command.listPackagesToInstall(packagesToInstall)
}
