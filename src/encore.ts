/*
 * @adonisjs/encore
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { SetAttributes } from './types/main.js'
import { readFileSync, existsSync } from 'node:fs'
import { ApplicationService } from '@adonisjs/core/types'
import { createHash } from 'node:crypto'
import stringifyAttributes from 'stringify-attributes'

/**
 * Resolves entry points and assets path for webpack encore. Relies
 * on the "manifest.json" and "entrypoints.json" files.
 *
 **********************************************************************
 * The driver assumes following format for the manifest.json file
 **********************************************************************
 *
 * ```json
 *  {
 *    "assetName": "assetUrl"
 *  }
 * ```
 **********************************************************************
 * The driver assumes following format for the entrypoints.json file
 ***********************************************************************
 *
 * ```json
 *  {
 *    "entrypoints": {
 *      "entrypointName": {
 *        "js": ["path1", "path2"],
 *        "css": ["path1", "path2"]
 *      }
 *    }
 *  }
 * ```
 */
export class Encore {
  /**
   * Path to the build directory
   *
   * @default 'public/assets'
   */
  #buildDirectory: string

  /**
   * We cache the manifest contents and the entrypoints contents
   * in production
   */
  #manifestCache?: Record<string, any>
  #entrypointsCache?: Record<string, any>

  /**
   * Attributes to be set on the style tags
   */
  #styleAttributes: SetAttributes = {}

  /**
   * Attributes to be set on the script tags
   */
  #scriptAttributes: SetAttributes = {}

  constructor(private application: ApplicationService) {
    this.#buildDirectory = this.application.publicPath('assets')
  }

  /**
   * Returns the version of the assets by hashing the manifest file
   * contents
   */
  get version() {
    return createHash('md5').update(JSON.stringify(this.manifest())).digest('hex').slice(0, 10)
  }

  /**
   * Reads the file contents as JSON
   */
  #readFileAsJSON(filePath: string) {
    if (!existsSync(filePath)) {
      throw new Error(`Cannot find "${filePath}" file. Make sure you are compiling assets`)
    }

    return JSON.parse(readFileSync(filePath, 'utf-8'))
  }

  /**
   * Unwrap attributes from the user defined function or return
   * the attributes as it is
   */
  #unwrapAttributes(url: string, attributes: SetAttributes) {
    if (typeof attributes === 'function') {
      return attributes({ url })
    }

    return attributes
  }

  /**
   * Create a script tag for the given path
   */
  #makeScriptTag(url: string) {
    const customAttributes = this.#unwrapAttributes(url, this.#scriptAttributes)
    return `<script${stringifyAttributes(customAttributes)} src="${url}"></script>`
  }

  /**
   * Create a style tag for the given path
   */
  #makeStyleTag(url: string) {
    const customAttributes = this.#unwrapAttributes(url, this.#styleAttributes)
    const attributes = { rel: 'stylesheet', ...customAttributes }

    return `<link${stringifyAttributes(attributes)} href="${url}">`
  }

  /**
   * Returns an HTML fragment for script tags
   */
  generateEntryPointsScriptTags(name: string): string {
    const scripts = this.entryPointJsFiles(name)
    return scripts.map((url) => this.#makeScriptTag(url)).join('\n')
  }

  /**
   * Returns an HTML fragment for style tags
   */
  generateEntryPointsStyleTags(entryPoints: string): string {
    const styles = this.entryPointCssFiles(entryPoints)
    return styles.map((url) => this.#makeStyleTag(url)).join('\n')
  }

  /**
   * Returns path to a given asset file
   */
  assetPath(name: string): string {
    const manifest = this.manifest()
    if (!manifest[name]) {
      throw new Error(`Cannot find path for "${name}" asset. Make sure you are compiling assets`)
    }

    return manifest[name]
  }

  /**
   * Returns the manifest file content
   *
   * @throws Will throw an exception when running in hot mode
   */
  manifest(): Record<string, any> {
    /**
     * Use in-memory cache when available
     */
    if (this.#manifestCache) {
      return this.#manifestCache
    }

    const manifest = this.#readFileAsJSON(join(this.#buildDirectory, 'manifest.json'))

    /**
     * Cache the manifest in production to avoid re-reading the file from disk
     */
    if (this.application.inProduction) {
      this.#manifestCache = manifest
    }

    return manifest
  }

  /**
   * Returns the entrypoints contents as object
   */
  entryPoints() {
    /**
     * Use in-memory cache when exists
     */
    if (this.#entrypointsCache) {
      return this.#entrypointsCache
    }

    const entryPoints = this.#readFileAsJSON(join(this.#buildDirectory, 'entrypoints.json'))

    /**
     * Cache entrypoints file in production to avoid re-reading the file from disk
     */
    if (this.application.inProduction) {
      this.#entrypointsCache = entryPoints.entrypoints || {}
    }

    return entryPoints.entrypoints || {}
  }

  /**
   * Returns list for all the javascript files for a given entry point
   */
  entryPointJsFiles(name: string): string[] {
    const entrypoints = this.entryPoints()
    if (!entrypoints[name]) {
      throw new Error(
        `Cannot find assets for "${name}" entrypoint. Make sure you are compiling assets`
      )
    }

    return entrypoints[name].js || []
  }

  /**
   * Returns list for all the css files for a given entry point
   */
  entryPointCssFiles(name: string): string[] {
    const entrypoints = this.entryPoints()
    if (!entrypoints[name]) {
      throw new Error(
        `Cannot find assets for "${name}" entrypoint. Make sure you are compiling assets`
      )
    }

    return entrypoints[name].css || []
  }

  /**
   * Set the build directory. Subdirectory of the AdonisJs public directory
   *
   * You must also use the `setOutputPath` in your Encore config
   */
  setBuildDirectory(path: string) {
    this.#buildDirectory = this.application.publicPath(path)
    return this
  }

  /**
   * Include additional attributes to each script tag generated
   */
  setScriptAttributes(attributes: SetAttributes) {
    this.#scriptAttributes = attributes
    return this
  }

  /**
   * Include additional attributes to each style tag generated
   */
  setStyleAttributes(attributes: SetAttributes) {
    this.#styleAttributes = attributes
    return this
  }
}
