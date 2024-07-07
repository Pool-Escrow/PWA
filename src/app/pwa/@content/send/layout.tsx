export default function ProfileLayout({ balance, amount }: LayoutWithSlots<'balance' | 'amount'>) {
    return (
        <div className='flex flex-1 flex-col gap-6'>
            {balance}
            {amount}
        </div>
    )
}
