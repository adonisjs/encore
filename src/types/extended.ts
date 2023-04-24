/*
 * @adonisjs/encore
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Encore } from '../encore.js'

/**
 * Extend the container bindings
 */
declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    encore: Encore
  }
}
