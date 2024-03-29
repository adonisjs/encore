/*
 * @adonisjs/encore
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Parameters passed to the setAttributes callback
 */
export type SetAttributesCallbackParams = {
  url: string
}

/**
 * Attributes to be set on the script/style tags.
 */
export type SetAttributes =
  | Record<string, string | boolean>
  | ((params: SetAttributesCallbackParams) => Record<string, string | boolean>)
