// @ts-check

import { inProduction } from '../src/app/_lib/utils/environment.mjs'

/** @type {import('next').NextConfig['compiler']} */
export const compilerConfig = {
    removeConsole: inProduction
        ? {
              exclude: ['error', 'warn'],
          }
        : false,
}
