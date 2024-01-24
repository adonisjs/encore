/*
 * @adonisjs/encore
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { PluginFn } from 'edge.js/types'
import { Encore } from '../encore.js'
import { EdgeError } from 'edge-error'

/**
 * The edge plugin for vite to share vite service with edge
 * and register custom tags
 */
export const edgePluginEncore: (encore: Encore) => PluginFn<undefined> = (encore) => {
  return (edge) => {
    edge.global('encore', encore)
    edge.global('asset', encore.assetPath.bind(encore))

    /**
     * Register the `entryPointScripts` tag
     */
    edge.registerTag({
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

    /**
     * Register the `entryPointStyles` tag
     */
    edge.registerTag({
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
}
