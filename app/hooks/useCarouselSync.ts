import { useState, useEffect } from 'react'

export const useCarouselSync = () => {
  const [time, setTime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return time
} 