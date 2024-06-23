import PoolTopLogo from '@/components/common/icons/pool-top-logo'

export default function TopBarLogo() {
    return (
        <div className='flex-center'>
            <PoolTopLogo />
        </div>

        // Alternative with text instead of svg/png:
        // <h1 className='text-center text-[42px] font-bold text-shadow-inner font-logo bg-clip-text text-transparent bg-text-inner'>
        // 	pool
        // </h1>
    )
}
