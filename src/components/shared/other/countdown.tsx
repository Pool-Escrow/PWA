import { formatCountdownTime } from '@/lib/utils/date-time'
import { useEffect, useState } from 'react'

interface CountdownProps {
	timeleft: number | null | undefined
}

const Countdown: React.FC<CountdownProps> = ({ timeleft }) => {
	const [countdown, setCountdown] = useState<number | null>(100000)

	useEffect(() => {
		if (timeleft === null || timeleft === undefined) {
			console.log('timeleft component null')

			return
		} else {
			console.log('timeleft component', timeleft)
			setCountdown(timeleft)
			const interval = setInterval(() => {
				setCountdown((prevCountdown) => {
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

	return (
		<div>
			{countdown !== null && countdown > 0 && (
				<div>{formatCountdownTime(timeleft!)}</div>
			)}
		</div>
	)
}

export default Countdown
