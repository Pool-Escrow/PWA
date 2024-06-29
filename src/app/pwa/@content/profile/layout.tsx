export default function ProfileLayout({ info, main }: LayoutWithSlots<'info' | 'main'>) {
    return (
        <div className='flex flex-1 flex-col gap-6'>
            {info}
            {main}
        </div>
    )
}
