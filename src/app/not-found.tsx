'use client'

import frog from '@/public/app/images/frog.png'
import { motion, useMotionValue, useTransform } from 'motion/react'
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
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [mouseX, mouseY])

    return (
        <div className='absolute inset-0 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800 p-4 text-white'>
            {/* Background tiles */}
            <div className='fixed inset-0 grid grid-cols-10 grid-rows-10 gap-x-2 opacity-10'>
                {tiles.map((active, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: active ? 0 : 1 }}
                        transition={{
                            type: 'tween',
                            duration: 0.5,
                            ease: 'easeOut',
                        }}
                        className='aspect-square'>
                        <div className='relative h-full w-full'>
                            <Image
                                src={frog.src}
                                alt=''
                                className='object-cover grayscale filter'
                                sizes='(max-width: 768px) 10vw, (max-width: 1200px) 8vw, 5vw'
                                priority
                                fill
                            />
                        </div>
                    </motion.div>
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
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                    }}>
                    404
                </motion.h1>
            </motion.div>

            <motion.div
                className='z-10 flex flex-col items-center gap-6'
                variants={{
                    initial: { opacity: 0, y: 50 },
                    animate: { opacity: 1, y: 0 },
                }}
                initial='initial'
                animate='animate'
                transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    delay: 0.2,
                }}>
                <motion.div
                    className='relative h-48 w-48'
                    whileHover={{
                        scale: 1.05,
                        transition: { type: 'spring', stiffness: 400, damping: 10 },
                    }}>
                    <Image
                        src={frog.src}
                        alt='Frog'
                        className='object-contain'
                        sizes='(max-width: 768px) 192px, (max-width: 1200px) 192px, 192px'
                        priority
                        fill
                    />
                </motion.div>
                <motion.p
                    className='mb-4 text-center text-xl md:text-2xl'
                    variants={{
                        initial: { opacity: 0, x: -20 },
                        animate: { opacity: 1, x: 0 },
                    }}
                    initial='initial'
                    animate='animate'
                    transition={{ delay: 0.4 }}>
                    Oops! The page you&apos;re looking for doesn&apos;t exist.
                </motion.p>
                <motion.p
                    className='mb-8 text-center text-base text-gray-400 md:text-lg'
                    variants={{
                        initial: { opacity: 0, x: 20 },
                        animate: { opacity: 1, x: 0 },
                    }}
                    initial='initial'
                    animate='animate'
                    transition={{ delay: 0.6 }}>
                    You tried to access: <span className='rounded-sm bg-gray-700 px-2 py-1 font-mono'>{pathname}</span>
                </motion.p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                        href='/'
                        className='transform rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:from-purple-600 hover:to-pink-600'>
                        Go Back Home
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    )
}
