// @ts-check

/** @type {import('postcss-load-config').Config} */
const config = {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
        // minify and purges unused css
        ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
    },
}

export default config
