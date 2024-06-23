// src/components/page-transition/get-transition-props.test.ts

import { describe, expect, it } from 'vitest'
import { getTransitionProps, routeHierarchy, transitionLevel } from './get-transition-props'

describe('getTransitionProps', () => {
    it('should return default transition when "from" is not provided', () => {
        const result = getTransitionProps({ to: '/pools' })
        expect(result).toEqual(transitionLevel.parallelForward)
    })

    it('should throw an error when "to" is not provided', () => {
        expect(() => getTransitionProps({ from: '/pools' })).toThrow('To route is required')
    })

    it('should throw an error for invalid routes', () => {
        // @ts-expect-error Invalid route
        expect(() => getTransitionProps({ from: '/invalid', to: '/pools' })).toThrow('Invalid route')
        // @ts-expect-error Invalid route
        expect(() => getTransitionProps({ from: '/pools', to: '/invalid' })).toThrow('Invalid route')
    })

    it('should return deeper transition for deeper level navigation', () => {
        const result = getTransitionProps({ from: '/pools', to: '/my-pools' })
        expect(result).toEqual(transitionLevel.deeper)
    })

    it('should return shallower transition for backward navigation', () => {
        const result = getTransitionProps({ from: '/profile', to: '/pools' })
        expect(result).toBe(transitionLevel.shallower)
    })

    it('should return parallel forward transition for same level navigation', () => {
        const result = getTransitionProps({ from: '/', to: '/pools' })
        expect(result).toEqual(transitionLevel.parallelForward)
    })
})

describe('routeHierarchy', () => {
    it('should have correct levels for routes', () => {
        expect(routeHierarchy['/']).toEqual({ level: 0 })
        expect(routeHierarchy['/pools']).toEqual({ level: 0 })
        expect(routeHierarchy['/my-pools']).toEqual({ level: 1 })
        expect(routeHierarchy['/profile']).toEqual({ level: 2 })
    })
})
