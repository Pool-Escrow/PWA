import React, { useState } from 'react'

interface myProgressBarProps {
	percent: number | undefined
}
const MyProgressBar = (props: myProgressBarProps) => {
	return (
		<div className='w-full h-full flex rounded-full overflow-hidden'>
			<div
				style={{ width: `100%` }}
				className={`flex h-3 md:h-6 rounded-full barBackground`}
			>
				<div
					style={{ width: `${props.percent}%` }}
					className={`flex h-3 md:h-6 rounded-full barForeground`}
				></div>
			</div>
		</div>
	)
}

export default MyProgressBar
