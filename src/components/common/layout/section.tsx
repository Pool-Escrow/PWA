interface Props {
	children: React.ReactNode
}

const Section = ({ children }: Props) => (
	<section className='h-full'>{children}</section>
)

export default Section
