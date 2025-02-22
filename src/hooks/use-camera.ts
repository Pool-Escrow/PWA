import { useEffect, useState } from 'react'

interface UseCameraResult {
    stream: MediaStream | null
    error: Error | null
}

export default function useCamera(): UseCameraResult {
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        async function setupCamera() {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                    audio: false,
                })
                setStream(mediaStream)
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to access camera'))
            }
        }

        void setupCamera()
    }, [])

    useEffect(() => {
        return () => {
            if (stream) {
                for (const track of stream.getTracks()) {
                    track.stop()
                }
            }
        }
    }, [stream])

    return { stream, error }
}
