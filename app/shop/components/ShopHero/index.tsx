'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { renderText, addLetterHoverEffects } from '../utils/animations'
import { Product } from '@/types/product'

interface ShopHeroProps {
  hopeProduct: Product | null;
}

export function ShopHero({ hopeProduct }: ShopHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    
    const container = containerRef.current
    if (!container) return

    // Scroll animaties
    const animateTextIn = (elements: NodeListOf<Element>, delay: number = 0) => {
      gsap.set(elements, { 
        opacity: 0,
        y: 10,
        rotateX: 15
      })

      gsap.to(elements, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.6,
        stagger: 0.005,
        ease: "power2.out",
        delay,
        scrollTrigger: {
          trigger: container,
          start: "top 70%",
          end: "bottom 80%",
        }
      })
    }

    // Toepassen van animaties
    const letters = container.querySelectorAll('.animate-letter')
    animateTextIn(letters, 0.3)

    // Hover effecten toevoegen
    if (titleRef.current) addLetterHoverEffects(titleRef.current, true)
    if (textRef.current) addLetterHoverEffects(textRef.current, false)

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  // Function to process description and inject stock status
  const renderHopeDescription = () => {
    if (!hopeProduct) return null;

    const description = hopeProduct.description;
    const stock = hopeProduct.stock;
    const staticText = "Edition of 50 bottles.";

    const stockStatusSpan = stock > 0 ? (
      <span className="font-semibold text-green-400">
        Available: {stock} / 50 bottles
      </span>
    ) : (
      <span className="font-semibold text-red-500">
        Sold Out
      </span>
    );

    // Check if the static text exists in the description
    if (description.includes(staticText)) {
      // Split the description and insert the dynamic span
      const parts = description.split(staticText);
      return (
        <>
          {parts[0]}
          {stockStatusSpan}
          {parts[1]} 
        </>
      );
    } else {
      // Fallback: show original description and stock status below
      return (
        <>
          {description}
          <br />
          {stockStatusSpan}
        </>
      );
    }
  };

  return (
    <section 
      ref={containerRef}
      className="min-h-[25vh] bg-black text-white pb-12 flex items-center"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 ref={titleRef} className="mb-6">
            {renderText('SHOP', true)}
          </h1>
          <p ref={textRef}>
            {renderText(
              'Discover our exclusive collection of limited edition whisky bottles, where art meets craftsmanship for a noble cause.'
            )}
          </p>
          
          {/* HOPE Product Specific Info - Display if product exists */}
          {hopeProduct && (
            <div className="mt-6 pt-6 border-t border-white/10 max-w-xl mx-auto">
              <h2 className="text-xl font-semibold mb-2 text-yellow-400">{hopeProduct.name}</h2>
              {/* Display the processed description from the database */}
              <p className="text-sm text-white/80 mb-3">
                {renderHopeDescription()}
              </p>
              {/* Stock status is now injected into the description above */}
            </div>
          )}

        </div>
      </div>
    </section>
  )
} 