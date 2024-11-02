// @ts-check

/** @type {import('next').NextConfig['rewrites']} */
export const getRewriteRules = () =>
    Promise.resolve([
        { source: '/profile/new', destination: '/profile/edit?new' },
        { source: '/', destination: '/pools' },
    ])
