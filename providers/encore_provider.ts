/*
 * @adonisjs/encore
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Encore } from '../src/encore.js'
import { ApplicationService } from '@adonisjs/core/types'

export default class EncoreServiceProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Registers edge plugin when edge is installed
   */
  async #registerEdgePlugin() {
    if (this.app.usingEdgeJS) {
      const edge = await import('edge.js')
      const encore = await this.app.container.make('encore')
      const { edgePluginEncore } = await import('../src/plugins/edge.js')
      edge.default.use(edgePluginEncore(encore))
    }
  }

  register() {
    this.app.container.singleton('encore', async () => new Encore(this.app))
  }

  async boot() {
    await this.#registerEdgePlugin()
  }
}
