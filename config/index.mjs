// @ts-check

import { imageConfig } from './images.mjs'
import { getRewriteRules } from './rewrites.mjs'
import { getSecurityHeaders } from './security.mjs'
import { configureWebpack } from './webpack.mjs'
import { withSerwist } from './serwist.mjs'
import { compilerConfig } from './compiler.mjs'
import { experimentalConfig } from './experimental.mjs'

const config = {
    images: imageConfig,
    rewrites: getRewriteRules,
    security: getSecurityHeaders,
    webpack: configureWebpack,
    serwist: withSerwist,
    compiler: compilerConfig,
    experimental: experimentalConfig,
}

export default config
