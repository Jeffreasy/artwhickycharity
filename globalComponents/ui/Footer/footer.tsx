'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-black text-white/80 py-8 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Info */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold">WhiskyForCharity</h3>
            <p className="text-sm text-white/60">
              Uniting fine whisky, impactful art, and meaningful change.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-1">
              <li>
                <Link href="/art" className="text-sm hover:text-white transition-colors">
                  Art
                </Link>
              </li>
              <li>
                <Link href="/whisky" className="text-sm hover:text-white transition-colors">
                  Whisky
                </Link>
              </li>
              <li>
                <Link href="/charity" className="text-sm hover:text-white transition-colors">
                  Charity
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold">Contact</h4>
            <ul className="space-y-1">
              <li className="text-sm">
                <a 
                  href="mailto:info@whiskyforcharity.com"
                  className="hover:text-white transition-colors"
                >
                  info@whiskyforcharity.com
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold">Follow Us</h4>
            <div className="flex space-x-4">
              <motion.a
                href="https://www.instagram.com/whiskyforcharity/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-white/60 hover:text-white transition-colors"
              >
                Instagram
              </motion.a>
              <motion.a
                href="https://www.tiktok.com/@whisky_art_charity?_t=ZN-8tdGke3XXza&_r=1"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-white/60 hover:text-white transition-colors"
              >
                TikTok
              </motion.a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 text-center text-sm text-white/60">
          <p>
            © {currentYear} WhiskyForCharity. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
