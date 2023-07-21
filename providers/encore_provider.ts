/*
 * @adonisjs/encore
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EdgeError } from 'edge-error'
import { Encore } from '../src/encore.js'
import { ViewContract } from '@adonisjs/view/types'
import { ApplicationService } from '@adonisjs/core/types'

export default class EncoreServiceProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register the `entryPointStyles` tag
   */
  #registerEntryPointStylesTag(view: ViewContract) {
    view.registerTag({
      tagName: 'entryPointStyles',
      seekable: true,
      block: false,
      compile(parser, buffer, token) {
        /**
         * Ensure an argument is defined
         */
        if (!token.properties.jsArg.trim()) {
          throw new EdgeError('Missing entrypoint name', 'E_RUNTIME_EXCEPTION', {
            filename: token.filename,
            line: token.loc.start.line,
            col: token.loc.start.col,
          })
        }

        const parsed = parser.utils.transformAst(
          parser.utils.generateAST(token.properties.jsArg, token.loc, token.filename),
          token.filename,
          parser
        )

        const entrypointName = parser.utils.stringify(parsed)
        buffer.outputExpression(
          `state.encore.generateEntryPointsStyleTags(${entrypointName})`,
          token.filename,
          token.loc.start.line,
          false
        )
      },
    })
  }

  /**
   * Register the `entryPointScripts` tag
   */
  #registerEntryPointScriptTag(view: ViewContract) {
    view.registerTag({
      tagName: 'entryPointScripts',
      seekable: true,
      block: false,
      compile(parser, buffer, token) {
        /**
         * Ensure an argument is defined
         */
        if (!token.properties.jsArg.trim()) {
          throw new EdgeError('Missing entrypoint name', 'E_RUNTIME_EXCEPTION', {
            filename: token.filename,
            line: token.loc.start.line,
            col: token.loc.start.col,
          })
        }

        const parsed = parser.utils.transformAst(
          parser.utils.generateAST(token.properties.jsArg, token.loc, token.filename),
          token.filename,
          parser
        )

        const entrypointName = parser.utils.stringify(parsed)
        buffer.outputExpression(
          `state.encore.generateEntryPointsScriptTags(${entrypointName})`,
          token.filename,
          token.loc.start.line,
          false
        )
      },
    })
  }

  register() {
    this.app.container.singleton('encore', async () => new Encore(this.app))
  }

  async boot() {
    const view = await this.app.container.make('view')
    const encore = await this.app.container.make('encore')

    view.global('encore', encore)
    view.global('asset', encore.assetPath.bind(encore))

    this.#registerEntryPointStylesTag(view)
    this.#registerEntryPointScriptTag(view)
  }
}
