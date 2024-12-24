'use client'

import React from 'react'
import { HiOutlineMail } from 'react-icons/hi'
import Link from 'next/link'

export function AboutTekst() {
  return (
    <section className="min-h-screen bg-black text-white py-24">
      <div className="container mx-auto px-6">
        <h1 className="text-5xl font-bold text-center mb-16">ABOUT</h1>
        
        <div className="max-w-4xl mx-auto space-y-8 text-center">
          <p className="text-lg leading-relaxed">
            Whisky for Charity: an exclusive convergence of whisky, art, and goodwill. Welcome to an extraordinary journey where fine whisky, exquisite art, 
            and genuine charity elegantly intersect. 'Whisky for Charity' combines the rich heritage of whisky with the creative brilliance of renowned artists, 
            all for the benefit of a charitable cause.
          </p>

          <p className="text-lg leading-relaxed">
            Each year, 'Whisky for Charity' offers the exclusive opportunity to own a rare piece of artistry. Only 50 numbered bottles of a meticulously crafted 
            single malt are released, each adorned with distinctive art.
          </p>

          <p className="text-lg leading-relaxed">
            For the inaugural edition, the Annandale Distillery in Scotland has been selected, where centuries-old expertise ensures that every drop embodies 
            the essence of tradition and excellence.
          </p>

          <p className="text-lg leading-relaxed">
            Renowned artist Luuk Bode is currently channeling his creative genius into designing the box and label for our exclusive whisky bottles. Each piece 
            promises to be a stunning visual ode to the rich flavors it contains.
          </p>

          <p className="text-lg leading-relaxed">
            What truly makes these bottles extraordinary is their purpose. Every purchase directly contributes to the Refugee Foundation, with all profits 
            transparently channeled to support their vital work. By purchasing this limited edition whisky, you join a noble cause and help refugees and 
            displaced persons worldwide. The Refugee Foundation tirelessly works to provide critical assistance to victims of conflict, violence, or natural disasters.
          </p>

          <p className="text-lg leading-relaxed">
            Each year, Whisky for Charity selects a distillery, artist, and charity.
          </p>

          <p className="text-lg leading-relaxed">
            This year's limited edition is a true collector's item. This edition is expected in mid-January/beginning of February 2025 for delivery. Are you ready 
            to own a piece of this exclusive, artistic indulgence that supports a good cause?
          </p>

          <p className="text-lg leading-relaxed">
            Feel free to contact us with any questions you may have about this unique blend of whisky, art, and philanthropy. Don't miss this chance to be part 
            of something truly special.
          </p>

          <div className="mt-16">
            <Link 
              href="mailto:info@whisky4charity.com"
              className="inline-flex items-center justify-center gap-2 text-xl hover:text-blue-400 transition-colors"
            >
              <HiOutlineMail className="w-8 h-8" />
              <span className="sr-only">Email us</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
