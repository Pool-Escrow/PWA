import { Button } from '@/components/ui/button'

export default function BottomBar() {
	return (
		<footer className='fixed flex-center bottom-0 left-0 min-h-bottom-bar rounded-t-3xl bg-neutral-100 pt-4 pb-safe-or-4 px-3 shadow-black/25 shadow backdrop-blur-[32.10px]'>
			<Button className='w-full h-full bg-cta text-center text-white text-base font-semibold leading-normal rounded-[2rem] p-3'>
				Register for $25 USDC
			</Button>
			{/* <Button className='bottom-6 w-[345px] rounded-[32px]  py-[11px] shadow-[inset_0px_1.75px_0px_0px_rgba(255,255,255,0.25)]'>
				Create Pool
			</Button> */}
		</footer>
	)
}

// export default function BottomBar() {
// 	return (
// 		<footer className='fixed flex-center bottom-0 bg-white border-t border-gray-200 h-bottom-bar pb-safe-offset-4 px-safe-offset-3'>
// 			<nav className='w-[369px] h-[46px] px-[97px] py-[11px] bg-cta rounded-[32px] shadow-inner justify-center items-center inline-flex'>
// 				<div className='text-center text-white text-base font-semibold leading-normal'>
// 					Register for $25 USDC
// 				</div>
// 			</nav>
// 			{/* <Button className='bottom-6 w-[345px] rounded-[32px]  py-[11px] shadow-[inset_0px_1.75px_0px_0px_rgba(255,255,255,0.25)]'>
// 				Create Pool
// 			</Button> */}
// 		</footer>
// 	)
// }
