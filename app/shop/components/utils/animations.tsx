import React from 'react'
import gsap from 'gsap'

export const addLetterHoverEffects = (element: HTMLElement, isLargeText: boolean) => {
  const letters = element.querySelectorAll('span')
  
  letters.forEach((letter) => {
    letter.addEventListener('mouseenter', () => {
      gsap.to(letter, {
        scale: isLargeText ? 1.05 : 1.08,
        textShadow: isLargeText 
          ? '0 0 15px rgba(255,255,255,0.3)'
          : '0 0 8px rgba(255,255,255,0.2)',
        duration: 0.15,
        ease: "power1.out"
      })
    })

    letter.addEventListener('mouseleave', () => {
      gsap.to(letter, {
        scale: 1,
        textShadow: 'none',
        duration: 0.1,
        ease: "power1.inOut"
      })
    })
  })
}

export const renderText = (content: string, isTitle: boolean = false): JSX.Element[] => {
  return content.split(' ').map((word, index, array) => (
    <React.Fragment key={index}>
      <span 
        className={`
          inline-block
          animate-letter
          ${isTitle ? 'text-4xl sm:text-5xl md:text-6xl font-bold' : 'text-lg sm:text-xl text-white/90'}
        `}
      >
        {word}
      </span>
      {index < array.length - 1 && (
        <span className="inline-block w-2 sm:w-2.5">&nbsp;</span>
      )}
    </React.Fragment>
  ))
} 