import { useState, useEffect } from 'react'
import ReactConfetti from 'react-confetti'

export const useConfetti = () => {
    const [isActive, setIsActive] = useState(false)

    const startConfetti = () => {
        setIsActive(true)
    }

    useEffect(() => {
        if (isActive) {
            const timer = setTimeout(() => {
                setIsActive(false)
            }, 5000) // Run confetti for 5 seconds

            return () => clearTimeout(timer)
        }
    }, [isActive])

    const ConfettiComponent = () =>
        isActive ? (
            <ReactConfetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} />
        ) : null

    return { startConfetti, ConfettiComponent }
}
