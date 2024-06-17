import { getTopBarElements } from '@/components/shared/layout/top-bar/top-bar.config'

describe('getTopBarElements', () => {
	test('should return default elements for root path', () => {
		const elements = getTopBarElements('/')
		expect(elements).toMatchSnapshot()
	})

	test('should return elements for /participant/:id/pools/', () => {
		const elements = getTopBarElements('/participant/123/pools/')
		expect(elements).toMatchSnapshot()
	})

	test('should return default elements for unknown paths', () => {
		const elements = getTopBarElements('/unknown/path')
		expect(elements).toMatchSnapshot()
	})

	test('should return default elements for /participant/:id/some-other-path', () => {
		const elements = getTopBarElements('/participant/123/some-other-path')
		expect(elements).toMatchSnapshot()
	})

	// Add more tests as needed for additional routes
})
