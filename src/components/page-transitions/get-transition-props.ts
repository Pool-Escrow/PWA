/**
 * @name getTransitionProps
 * @file src/components/page-transition/get-transition-props.ts
 */

export const routeHierarchy = {
    '/': { level: 0 },
    '/pools': { level: 0 }, // redirected from home
    '/my-pools': { level: 1 },
    '/profile': { level: 2 },
    // add more routes here
}

export type NavigationDirection = 'forward' | 'backward' | 'parallel'

export const transitionLevel = {
    deeper: { x: 0, y: '100%' },
    shallower: { x: 0, y: '-100%' },
    parallelForward: { x: '-100%', y: 0 }, // default
    parallelBackward: { x: '100%', y: 0 },
}

type TypedRoute = keyof typeof routeHierarchy

export type TransitionProps = {
    x?: string | number
    y?: string | number
}

interface GetTransitionProps {
    from?: TypedRoute
    to?: TypedRoute
}

export const getTransitionProps = ({ from, to }: GetTransitionProps = {}): TransitionProps => {
    console.log('getTransitionProps called with:', { from, to })

    if (!from) return transitionLevel.parallelForward // Default transition when "from" is not provided

    if (!to) throw new Error('To route is required')

    /**
     * to.level > from.level: deeper
     * to.level < from.level: shallower
     * to.level === from.level:
     *      if (and navigation history back or swipe back): parallelBackward
     *      default (or navigation history forward or swipe forward) : parallelForward
     * handle other important cases if they exist...
     */
    const fromLevel = routeHierarchy[from]?.level
    const toLevel = routeHierarchy[to]?.level

    if (fromLevel === undefined || toLevel === undefined) {
        throw new Error('Invalid route')
    }

    let direction: NavigationDirection
    if (toLevel > fromLevel) {
        direction = 'forward'
    } else if (toLevel < fromLevel) {
        direction = 'backward'
    } else {
        direction = 'parallel'
    }

    switch (direction) {
        case 'forward':
            return transitionLevel.deeper
        case 'backward':
            return transitionLevel.shallower
        case 'parallel':
            return transitionLevel.parallelForward
        default:
            return transitionLevel.parallelForward
    }
}
