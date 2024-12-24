'use client'

import React from 'react'

export function CharityTekst() {
  return (
    <section className="min-h-screen bg-black text-white py-24">
      <div className="container mx-auto px-6">
        <h1 className="text-5xl font-bold text-center mb-16">CHARITY</h1>
        
        <div className="max-w-4xl mx-auto space-y-8 text-center">
          <p className="text-lg leading-relaxed">
            The Refugee Foundation provides life-saving assistance to people who are victims of conflict, violence or natural disasters. 
            In line with this, they support communities in finding structural solutions, so that people can improve their future on their own. 
            Their assistance focuses on refugees, displaced persons and returnees. They provide assistance regardless of religion, political 
            views, ethnicity, nationality, gender and sexual orientation.
          </p>

          <p className="text-lg leading-relaxed">
            The Refugee Foundation is an impartial and independent organization that provides emergency aid to refugees and displaced 
            persons in crisis situations worldwide. It bases its assistance on its own assessment of human needs and available capacity, 
            with special attention to areas that are difficult to access and underexposed situation.
          </p>

          <p className="text-lg leading-relaxed">
            The Refugee Foundation places the individual person at the center, with human scale and dignity being paramount. The 
            organization is characterized by perseverance, creativity and flexibility, which allows it to quickly respond to global needs. 
            Innovation and support of special initiatives are encouraged, while openness and critical thinking form the basis for continuous 
            learning and improvement. The foundation guarantees a safe emergency situation, protects against (sexual) exploitation and 
            abuse, and creates a safe working environment where employees feel heard and treated with integrity.
          </p>

          <div className="mt-12">
            <p className="text-lg font-semibold">For more information look at</p>
            <a 
              href="https://www.vluchteling.nl" 
              className="text-blue-400 hover:text-blue-300 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.vluchteling.nl
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
