'use client'

import React from 'react'

export function BottomButton() {
  return (
    <div className="flex justify-center items-center w-full pt-12 pb-32">
      <div className="flex justify-center items-center [transform-style:preserve-3d] w-[30px] h-[30px] rounded-full border-t-2 border-t-white/25 border-b-2 border-b-black/10 shadow-[0_0_60px_0px_rgba(137,243,255,0.8)] animate-[spin_4000ms_ease_4s_infinite,rainbow_5000ms_linear_infinite]">
        <div className="flex justify-center items-center [transform-style:preserve-3d] w-[60px] h-[60px] rounded-full border-t-2 border-t-white/25 border-b-2 border-b-black/10 animate-[spin_8000ms_ease_3s_infinite,rainbow_10000ms_linear_infinite]">
          <div className="flex justify-center items-center [transform-style:preserve-3d] w-[60px] h-[60px] rounded-full border-t-2 border-t-white/25 border-b-2 border-b-black/10 animate-[spin_16000ms_ease_1s_infinite,rainbow_20000ms_linear_infinite]">
          </div>
        </div>
      </div>
    </div>
  )
}
