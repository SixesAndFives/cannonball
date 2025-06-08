'use client'

import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'

interface WaveformProps {
  audioUrl?: string
  media?: HTMLAudioElement | null
  isPlaying: boolean
  onReady?: () => void
  onFinish?: () => void
  onSeek?: (time: number) => void
  // Appearance options
  height?: number
  waveColor?: string
  progressColor?: string
  cursorColor?: string
  barWidth?: number
  barGap?: number
  // Wave style options
  fillParent?: boolean
  minPxPerSec?: number
  peaks?: number[]
  normalize?: boolean
  barRadius?: number
  barHeight?: number
  cursorWidth?: number
}

export default function Waveform({
  audioUrl,
  media,
  isPlaying,
  onReady,
  onFinish,
  onSeek,
  // Default appearance
  height = 64,
  waveColor = '#E2E8F0',
  progressColor = '#3B82F6',
  cursorColor = '#1D4ED8',
  barWidth = 1,
  barGap = 0,
  // Wave style defaults
  fillParent = true,
  minPxPerSec = 1,
  normalize = false,
  barRadius = 2,
  barHeight = 2.5,
  cursorWidth = 2,
}: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurfer = useRef<WaveSurfer | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current || !media) return
    
    // Clean up any existing instance
    if (wavesurfer.current) {
      wavesurfer.current.destroy()
      wavesurfer.current = null
    }

    const initWavesurfer = async () => {
      try {
        // Wait for media element to be ready
        if (!media.src) {
          console.log('Waiting for media source...')
          return
        }
        
        audioRef.current = media
        
        // Import WaveSurfer dynamically to fix TypeScript namespace error
        const WaveSurferModule = await import('wavesurfer.js')
        const ws = WaveSurferModule.default.create({
          // Container and media
          container: containerRef.current as HTMLElement,
          backend: 'MediaElement',
          media,
          // Basic appearance
          height,
          waveColor,
          progressColor,
          cursorColor,
          
          // Bar style
          barWidth,
          barGap,
          barRadius,
          barHeight,
          
          // Wave behavior
          normalize,
          fillParent,
          minPxPerSec,
          cursorWidth,
          plugins: []
        })
        
        console.log('9. WaveSurfer instance created:', ws)

        wavesurfer.current = ws

        ws.on('ready', () => {
          console.log('WaveSurfer ready')
          onReady?.()
        })

        ws.on('finish', () => {
          console.log('WaveSurfer finish')
          onFinish?.()
        })

        ws.on('seeking', () => {
          const time = ws.getCurrentTime()
          console.log('WaveSurfer seeking:', time)
          onSeek?.(time)
        })

        ws.on('loading', (percent) => {
          console.log('15. Loading:', percent + '%')
        })
        
        ws.on('decode', () => {
          console.log('16. Audio decoded')
        })

        ws.on('error', (err) => {
          console.error('17. Wavesurfer error:', err)
          console.error('Error details:', {
            message: err?.message,
            stack: err?.stack,
            type: typeof err,
            name: err?.name,
            full: err
          })
          setError(`Wavesurfer error: ${err?.message || JSON.stringify(err) || 'Unknown error'}`)
        })

        ws.on('interaction', (time) => {
          onSeek?.(time)
        })
      } catch (err) {
        console.error('Error initializing waveform:', err)
      }
    }

    initWavesurfer()



    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy()
      }
    }
  }, [media, media?.src])

  // Handle play/pause
  useEffect(() => {
    if (wavesurfer.current) {
      if (isPlaying) {
        wavesurfer.current.play()
      } else {
        wavesurfer.current.pause()
      }
    }
  }, [isPlaying])

  return (
    <div className="w-full">
      <div ref={containerRef} />
    </div>
  )
}
