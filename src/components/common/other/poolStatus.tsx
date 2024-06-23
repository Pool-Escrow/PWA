import React, { useState } from 'react'

interface poolStatusProps {
	status: number | undefined
}
const PoolStatus = (poolStatus: poolStatusProps) => {
	return (
		<div className='absolute bottom-0 bg-black bg-opacity-40 md:text-xl text-md w-full text-center flex items-center justify-center space-x-3 text-white md:py-3 py-1'>
			{poolStatus.status == 0 && (
				<div className='flex flex-row space-x-3 items-center'>
					<div
						className={`dotBackground rounded-full md:w-3 md:h-3 h-1.5 w-1.5`}
					></div>
					<div className='md:text-2xl text-xs'>Unavailable</div>
				</div>
			)}
			{poolStatus.status == 1 && (
				<div className='flex flex-row space-x-3 items-center'>
					<div
						className={`dotBackground rounded-full md:w-3 md:h-3 h-1.5 w-1.5`}
					></div>
					<div className='md:text-2xl text-xs'>Upcoming</div>
				</div>
			)}
			{poolStatus.status == 2 && (
				<div className='flex flex-row space-x-3 items-center'>
					<div
						className={`liveDotBackground rounded-full md:w-3 md:h-3 h-1.5 w-1.5`}
					></div>
					<div className='md:text-2xl text-xs'>Live</div>
				</div>
			)}
			{poolStatus.status == 3 && (
				<div className='flex flex-row space-x-3 items-center'>
					<div
						className={`dotBackground rounded-full md:w-3 md:h-3 h-1.5 w-1.5`}
					></div>
					<div className='md:text-2xl text-xs'>Ended</div>
				</div>
			)}
			{poolStatus.status == 4 && (
				<div className='flex flex-row space-x-3 items-center'>
					<div
						className={`dotBackground rounded-full md:w-3 md:h-3 h-1.5 w-1.5`}
					></div>
					<div className='md:text-2xl text-xs'>Deleted</div>
				</div>
			)}
		</div>
	)
}

export default PoolStatus
