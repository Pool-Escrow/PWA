// @ts-check

import { inProduction } from './src/app/_lib/utils/environment.mjs'

/** @type {import('postcss-load-config').Config} */
const config = {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
        // minify and purges unused css
        ...(inProduction ? { cssnano: {} } : {}),
    },
}

export default config
