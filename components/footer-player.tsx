'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Loader2, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface FooterPlayerProps {
  src: string
  title: string
  album_title: string
  cover_image?: string
  onNext?: () => void
  onPrevious?: () => void
  className?: string
  autoPlay?: boolean
}

export function FooterPlayer({ 
  src, 
  title, 
  album_title,
  cover_image,
  onNext, 
  onPrevious, 
  className, 
  autoPlay 
}: FooterPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (autoPlay) {
      audio.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {
        setError('Autoplay blocked. Click play to start.')
        setIsPlaying(false)
      })
    }

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoading(false)
      setLoadingProgress(100)
    }
    const handleEnded = () => {
      setIsPlaying(false)
      if (onNext) onNext()
    }
    const handleError = () => {
      setError('Error loading audio')
      setIsPlaying(false)
    }
    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1)
        const progress = (bufferedEnd / audio.duration) * 100
        setLoadingProgress(progress)
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('progress', handleProgress)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('progress', handleProgress)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [onNext])

  useEffect(() => {
    // Reset state when src changes
    setCurrentTime(0)
    setDuration(0)
    setError(null)
    setIsLoading(true)
    setLoadingProgress(0)
    // Don't reset isPlaying - let autoPlay handle it
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
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-blue-50/95 backdrop-blur-md border-t border-blue-200 transition-all duration-300 ease-in-out z-50",
        isExpanded ? "h-32 md:h-24" : "h-16 md:h-12",
        className
      )}
    >
      <div className="container mx-auto px-4 h-full">
        {/* Mobile Layout */}
        <div className="md:hidden h-full">
          {isExpanded ? (
            <div className="flex flex-col h-full py-2">
              {/* Track Info Row */}
              <div className="flex items-center gap-3 mb-2">
                {cover_image && (
                  <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={cover_image} 
                      alt={album_title}
                      className="object-cover"
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium text-gray-900">{title}</div>
                  <div className="truncate text-xs text-gray-500">{album_title}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-10 w-10"
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </div>

              {/* Progress Bar Row */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500 w-10 text-right">{formatTime(currentTime)}</span>
                <Slider
                  value={[currentTime]}
                  min={0}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="flex-1"
                />
                <span className="text-xs text-gray-500 w-10">{formatTime(duration)}</span>
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-center gap-4">
                {onPrevious && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onPrevious}
                    className="h-12 w-12"
                  >
                    <SkipBack className="h-6 w-6" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlayPause}
                  className="h-12 w-12"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>

                {onNext && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onNext}
                    className="h-12 w-12"
                  >
                    <SkipForward className="h-6 w-6" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {cover_image && (
                  <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={cover_image} 
                      alt={album_title}
                      className="object-cover"
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium text-gray-900">{title}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlayPause}
                  className="h-10 w-10"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-10 w-10"
                >
                  <ChevronUp className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Layout (unchanged) */}
        <div className="hidden md:flex items-center justify-between h-full">
          {/* Track Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {cover_image && (
              <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                <img 
                  src={cover_image} 
                  alt={album_title}
                  className="object-cover"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            )}
            <div>
              <div className="truncate text-sm font-medium text-gray-900">{title}</div>
              <div className="truncate text-xs text-gray-500">{album_title}</div>
            </div>
          </div>

          {/* Player Controls */}
          <div className={cn(
            "flex-1 max-w-2xl transition-opacity duration-300",
            isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            {isLoading && (
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <Progress value={loadingProgress} className="h-1" />
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-12 text-right">{formatTime(currentTime)}</span>
                <Slider
                  value={[currentTime]}
                  min={0}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="flex-1"
                />
                <span className="text-xs text-gray-500 w-12">{formatTime(duration)}</span>
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
          </div>

          {/* Expand/Collapse Button */}
          <div className="flex-1 flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      <audio ref={audioRef} src={src} preload="metadata" />
    </div>
  )
}
