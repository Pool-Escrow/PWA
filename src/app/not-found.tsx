'use client'

import frog from '@/public/app/images/frog.png'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const GRID_SIZE = 10

export default function NotFound() {
    const pathname = usePathname()
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const [tiles, setTiles] = useState<boolean[]>(Array(GRID_SIZE * GRID_SIZE).fill(false))

    const rotateX = useTransform(mouseY, [-500, 500], [60, -60])
    const rotateY = useTransform(mouseX, [-500, 500], [-60, 60])

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            const { clientX, clientY } = event
            const { innerWidth, innerHeight } = window
            mouseX.set(clientX - innerWidth / 2)
            mouseY.set(clientY - innerHeight / 2)

            // Update tiles
            const x = Math.floor((clientX / innerWidth) * GRID_SIZE)
            const y = Math.floor((clientY / innerHeight) * GRID_SIZE)
            const index = y * GRID_SIZE + x
            setTiles(prev => {
                const newTiles = [...prev]
                newTiles[index] = true
                return newTiles
            })
        }

        window.addEventListener('mousemove', handleMouseMove)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [mouseX, mouseY])

    return (
        <div className='absolute inset-0 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800 p-4 text-white'>
            {/* Background tiles */}
            <div className='fixed inset-0 grid grid-cols-10 grid-rows-10 gap-x-2 opacity-10'>
                {tiles.map((active, index) => (
                    <div
                        key={index}
                        className={`aspect-square transition-opacity duration-500 ${
                            !active ? 'opacity-100' : 'opacity-0'
                        }`}>
                        <div className='relative size-full'>
                            <Image
                                src={frog.src}
                                alt=''
                                className='object-cover grayscale'
                                sizes='(max-width: 768px) 10vw, (max-width: 1200px) 8vw, 5vw'
                                priority
                                fill
                            />
                        </div>
                    </div>
                ))}
            </div>

            <motion.div
                className='relative z-10'
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: 'preserve-3d',
                }}>
                <motion.h1
                    className='mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-6xl font-bold text-transparent md:text-9xl'
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}>
                    404
                </motion.h1>
            </motion.div>

            <motion.div
                className='z-10 flex flex-col items-center gap-6'
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}>
                <div className='relative size-48'>
                    <Image
                        src={frog.src}
                        alt='Frog'
                        className='object-contain'
                        sizes='(max-width: 768px) 192px, (max-width: 1200px) 192px, 192px'
                        priority
                        fill
                    />
                </div>
                <p className='mb-4 text-center text-xl md:text-2xl'>
                    Oops! The page you&apos;re looking for doesn&apos;t exist.
                </p>
                <p className='mb-8 text-center text-base text-gray-400 md:text-lg'>
                    You tried to access: <span className='rounded bg-gray-700 px-2 py-1 font-mono'>{pathname}</span>
                </p>
                <Link
                    href='/'
                    className='rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:scale-105 hover:from-purple-600 hover:to-pink-600'>
                    Go Back Home
                </Link>
            </motion.div>
        </div>
    )
}
