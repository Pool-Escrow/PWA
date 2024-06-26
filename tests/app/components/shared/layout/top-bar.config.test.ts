import { getTopBarElements } from '@/components/top-bar/top-bar.config'

describe('getTopBarElements', () => {
    test('should return default elements for root path', () => {
        const elements = getTopBarElements('/')
        expect(elements).toMatchSnapshot()
    })

    test('should return elements for /my-pools', () => {
        const elements = getTopBarElements('/my-pools')
        expect(elements).toMatchSnapshot()
    })

    test('should return default elements for unknown paths', () => {
        const elements = getTopBarElements('/unknown/path')
        expect(elements).toMatchSnapshot()
    })

    test('should return elements for /profile/new', () => {
        const elements = getTopBarElements('/profile/new')
        expect(elements).toMatchSnapshot()
    })

    test('should return elements for /participant/[id]', () => {
        const elements = getTopBarElements('/participant/123')
        expect(elements).toMatchSnapshot()
    })

    test('should return elements for /pool/[poolId]', () => {
        const elements = getTopBarElements('/pool/456')
        expect(elements).toMatchSnapshot()
    })

    test('should return default elements for /participant/:id/some-other-path', () => {
        const elements = getTopBarElements('/participant/123/some-other-path')
        expect(elements).toMatchSnapshot()
    })

    test('static route should have priority over dynamic route', () => {
        const elementsForStaticRoute = getTopBarElements('/profile/new')
        const elementsForDynamicRoute = getTopBarElements('/participant/123')

        expect(elementsForStaticRoute).not.toEqual(elementsForDynamicRoute)
        expect(elementsForStaticRoute).toMatchSnapshot()
        expect(elementsForDynamicRoute).toMatchSnapshot()
    })

    // Add more tests as needed for additional routes
})
