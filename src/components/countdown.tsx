// import { formatCountdownTime } from '@/lib/utils'
// import React, { useState, useEffect } from 'react'

// const CountdownTimer = ({ initialTime }: { initialTime: number }) => {
// 	const [timeRemaining, setTimeRemaining] = useState<number>(initialTime)

// 	useEffect(() => {
// 		if (initialTime === null || initialTime === undefined) {
// 			console.log('timeleft component null')

// 			return
// 		} else {
// 			const id = setInterval(() => {
// 				setTimeRemaining((prevTime) => {
// 					console.log('tick')
// 					return prevTime - 1
// 				})
// 			}, 1000)
// 			return () => clearInterval(id)
// 		}
// 	}, [timeRemaining, initialTime])

// 	return <div>{formatCountdownTime(timeRemaining)}</div>
// }

// export default CountdownTimer

import { formatCountdownTime } from '@/lib/utils/date-time'
import React, { useEffect, useState } from 'react'

interface CountdownProps {
    timeleft: number | null | undefined
}

const CountdownTimer: React.FC<CountdownProps> = ({ timeleft }) => {
    const [countdown, setCountdown] = useState<number | null>(100000)

    useEffect(() => {
        if (timeleft === null || timeleft === undefined) {
            console.log('timeleft component null')

            return
        } else {
            console.log('timeleft component', timeleft)
            setCountdown(timeleft)
            const interval = setInterval(() => {
                setCountdown(prevCountdown => {
                    if (prevCountdown === null || prevCountdown <= 0) {
                        clearInterval(interval)
                        return null
                    } else {
                        return prevCountdown - 1
                    }
                })
            }, 1000)

            return () => clearInterval(interval)
        }
    }, [timeleft])

    return <div>{countdown !== null && countdown > 0 && <div>{formatCountdownTime(timeleft!)}</div>}</div>
}

export default CountdownTimer
