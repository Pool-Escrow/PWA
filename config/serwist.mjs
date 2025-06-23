// @ts-check

import withSerwistInit from '@serwist/next'
// import { inProduction } from '../src/app/_lib/utils/environment.mjs'

/** @type {import('@serwist/next').PluginOptions} */
const serwistConfig = {
    swSrc: 'src/app/_lib/utils/sw.ts',
    swDest: 'public/sw.js',
    disable: process.env.NODE_ENV !== 'production',
    scope: '/',
    cacheOnNavigation: true,
    maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
}

export const withSerwist = withSerwistInit(serwistConfig)
