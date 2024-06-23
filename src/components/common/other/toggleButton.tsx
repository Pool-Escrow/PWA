import React, { useState } from 'react'

const ToggleButton = () => {
	const [isChecked, setIsChecked] = useState(false)

	const handleCheckboxChange = () => {
		setIsChecked(!isChecked)
	}

	return (
		<>
			<label className='inline-flex items-center cursor-pointer'>
				<input type='checkbox' value='' className='sr-only peer' />
				<div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
			</label>
		</>
	)
}

export default ToggleButton
