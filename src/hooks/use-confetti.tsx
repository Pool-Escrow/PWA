import { useEffect, useState } from 'react'
import ReactConfetti from 'react-confetti'

export const useConfetti = () => {
    const [isActive, setIsActive] = useState(false)
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

    const startConfetti = () => {
        setIsActive(true)
    }

    useEffect(() => {
        // Set initial window size
        const updateSize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }

        // Set initial size
        updateSize()

        // Add event listener for window resize
        window.addEventListener('resize', updateSize)

        return () => window.removeEventListener('resize', updateSize)
    }, [])

    useEffect(() => {
        if (isActive) {
            const timer = setTimeout(() => {
                setIsActive(false)
            }, 5000) // Run confetti for 5 seconds

            return () => clearTimeout(timer)
        }
    }, [isActive])

    const ConfettiComponent = () =>
        isActive && windowSize.width > 0 && windowSize.height > 0 ? (
            <ReactConfetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={200} />
        ) : null

    return { startConfetti, ConfettiComponent }
}
