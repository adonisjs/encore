/*
 * @adonisjs/encore
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import app from '@adonisjs/core/services/app'
import { Encore } from '../src/encore.js'

let encore: Encore

/**
 * Returns a singleton instance of Encore class
 * from the container
 */
await app.booted(async () => {
  encore = await app.container.make('encore')
})

export { encore as default }
