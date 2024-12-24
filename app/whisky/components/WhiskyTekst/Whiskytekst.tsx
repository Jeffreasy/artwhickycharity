'use client'

import React from 'react'

export function WhiskyTekst() {
  return (
    <section className="min-h-screen bg-black text-white py-24">
      <div className="container mx-auto px-6">
        <h1 className="text-5xl font-bold text-center mb-16">WHISKY</h1>
        
        <div className="max-w-4xl mx-auto space-y-8 text-center">
          <p className="text-lg leading-relaxed">
            Annandale Distillery founded in 1836, reborn in 2014, Annandale was one of Scotland's oldest working distilleries. 
            A legacy carved from Pink Sandstone nestled in a picturesque setting, the Annandale Distillery, established in 1830 
            by George Donald, is a testament to the art of whisky-making.
          </p>

          <p className="text-lg leading-relaxed">
            George Donald, a former excise officer from Banff in Aberdeenshire, chose the site for building the distillery as 
            there was a pre-existing clearing in the woods with a plentiful water source, which is essential for both the 
            production of whisky and to power the water wheel which would run the internal grain mill for the barley. This all 
            plays a pivotal role in crafting their unique single malt.
          </p>

          <p className="text-lg leading-relaxed">
            The iconic pink sandstone, quarried locally, not only lends a distinct character to the distillery's architecture but 
            also to the spirit it nurtures. The mild, damp climate of the region contributes to the whisky's maturation, offering 
            a flavor that is as rich and diverse as its history. The abundance of peat in the area meant that George Donald could 
            fuel the kiln for the malted grain by using locally sourced peat from peat bogs just three miles away.
          </p>

          <p className="text-lg leading-relaxed">
            Each sip of their limited edition whisky invites you on a journey through time, celebrating a legacy of 
            craftsmanship and the natural bounty of the Scottish landscape.
          </p>

          <p className="text-lg leading-relaxed">
            Indulge in the exquisite taste of single malt whisky. Each bottle of this limited edition series captures the essence 
            of a storied tradition, matured to perfection. The rich, complex flavors are a tribute to the mastery of whisky-
            making, offering connoisseurs a sip of history blended with modern excellence.
          </p>

          <div className="mt-12">
            <p className="text-lg font-semibold">For more information:</p>
            <a 
              href="https://www.annandaledistillery.com" 
              className="text-blue-400 hover:text-blue-300 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.annandaledistillery.com
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
