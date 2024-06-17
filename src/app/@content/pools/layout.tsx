export default function PoolsLayout({
	yours,
	upcoming,
}: LayoutWithSlots<'yours' | 'upcoming'>) {
	return (
		<div className='space-y-6'>
			{yours}
			{upcoming}
		</div>
	)
}
