const ToggleButton = () => {
	return (
		<>
			<label className='inline-flex cursor-pointer items-center'>
				<input type='checkbox' value='' className='peer sr-only' />
				<div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full" />
			</label>
		</>
	)
}

export default ToggleButton
