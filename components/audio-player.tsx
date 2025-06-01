'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface AudioPlayerProps {
  src: string
  title: string
  onNext?: () => void
  onPrevious?: () => void
  className?: string
}

export function AudioPlayer({ src, title, onNext, onPrevious, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      if (onNext) onNext()
    }
    const handleError = () => {
      setError('Error loading audio')
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [onNext])

  useEffect(() => {
    // Reset state when src changes
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(false)
    setError(null)
  }, [src])

  const togglePlayPause = async () => {
    if (!audioRef.current) return

    try {
      if (isPlaying) {
        await audioRef.current.pause()
      } else {
        await audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    } catch (err) {
      setError('Unable to play audio. Please try again.')
      setIsPlaying(false)
      console.error('Audio playback error:', err)
    }
  }

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={cn('flex flex-col gap-2 p-4 bg-white rounded-lg shadow', className)}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-900 truncate flex-1">
          {title}
        </div>
        {error && (
          <div className="text-xs text-red-500">{error}</div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 w-10">
          {formatTime(currentTime)}
        </span>
        
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          className="flex-1"
        />
        
        <span className="text-xs text-gray-500 w-10">
          {formatTime(duration)}
        </span>
      </div>

      <div className="flex items-center justify-center gap-2">
        {onPrevious && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            className="h-8 w-8"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlayPause}
          className="h-8 w-8"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        {onNext && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            className="h-8 w-8"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
