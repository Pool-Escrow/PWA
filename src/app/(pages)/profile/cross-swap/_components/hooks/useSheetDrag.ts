import { useEffect, useRef } from 'react'

export const useSheetDrag = (onClose: () => void) => {
    const sheetRef = useRef<HTMLDivElement>(null)
    const dragStartRef = useRef(0)
    const currentDragRef = useRef(0)
    const isDraggingRef = useRef(false)
    const animationFrameRef = useRef<number | null>(null)
    const dragThreshold = 150

    const updateSheetPosition = (deltaY: number) => {
        if (sheetRef.current) {
            const transform = `translateY(${Math.max(0, deltaY)}px)`
            sheetRef.current.style.transform = transform
        }
    }

    const handleDragStart = (e: React.PointerEvent) => {
        isDraggingRef.current = true
        dragStartRef.current = e.clientY
        currentDragRef.current = 0

        if (sheetRef.current) {
            sheetRef.current.style.transition = 'none'
        }

        e.preventDefault()
        e.currentTarget.setPointerCapture(e.pointerId)
    }

    const handleDrag = (e: React.PointerEvent) => {
        if (!isDraggingRef.current) return

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
        }

        animationFrameRef.current = requestAnimationFrame(() => {
            const deltaY = e.clientY - dragStartRef.current
            currentDragRef.current = deltaY
            updateSheetPosition(deltaY)
        })
    }

    const handleDragEnd = (e: React.PointerEvent) => {
        isDraggingRef.current = false
        e.currentTarget.releasePointerCapture(e.pointerId)

        if (sheetRef.current) {
            sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.19, 1, 0.22, 1)'

            if (currentDragRef.current > dragThreshold) {
                onClose()
            } else {
                updateSheetPosition(0)
            }
        }
    }

    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [])

    return {
        sheetRef,
        handleDragStart,
        handleDrag,
        handleDragEnd,
    }
}
