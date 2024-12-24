import { useRef, useEffect } from 'react'
import type { Swiper as SwiperType } from 'swiper'

interface SwiperController {
  swiper: SwiperType
  isTransitioning: boolean
}

const controllers: { [key: string]: SwiperController[] } = {}

export const useCarouselSync = (groupName: string) => {
  const swiperRef = useRef<SwiperType | null>(null)
  const isTransitioning = useRef(false)

  useEffect(() => {
    if (!swiperRef.current) return

    // Initialize group if it doesn't exist
    if (!controllers[groupName]) {
      controllers[groupName] = []
    }

    const controller: SwiperController = {
      swiper: swiperRef.current,
      isTransitioning: false
    }

    controllers[groupName].push(controller)

    return () => {
      controllers[groupName] = controllers[groupName].filter(
        ctrl => ctrl.swiper !== swiperRef.current
      )
    }
  }, [groupName])

  const syncSlides = (activeIndex: number, speed: number = 1000) => {
    if (!controllers[groupName]) return

    controllers[groupName].forEach(controller => {
      if (controller.swiper !== swiperRef.current && !controller.isTransitioning) {
        controller.isTransitioning = true
        controller.swiper.slideTo(activeIndex, speed)
        setTimeout(() => {
          controller.isTransitioning = false
        }, speed)
      }
    })
  }

  const handleSlideChange = () => {
    if (!swiperRef.current || isTransitioning.current) return

    isTransitioning.current = true
    const activeIndex = swiperRef.current.activeIndex
    syncSlides(activeIndex)
    
    setTimeout(() => {
      isTransitioning.current = false
    }, 1000)
  }

  return {
    onSwiper: (swiper: SwiperType) => {
      swiperRef.current = swiper
    },
    autoplayConfig: {
      delay: 3000,
      disableOnInteraction: false,
      stopOnLastSlide: false,
      waitForTransition: true
    },
    onSlideChange: handleSlideChange,
    onTouchStart: () => {
      if (swiperRef.current) {
        const activeIndex = swiperRef.current.activeIndex
        syncSlides(activeIndex)
      }
    }
  }
} 