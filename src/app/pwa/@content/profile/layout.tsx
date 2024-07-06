export default function ProfileLayout({ info, main, balance }: LayoutWithSlots<'info' | 'balance' | 'main'>) {
    return (
        <div className='flex flex-1 flex-col gap-6'>
            {info}
            {balance}
            {main}
        </div>
    )
}
