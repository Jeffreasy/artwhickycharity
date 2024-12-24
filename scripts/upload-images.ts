import { v2 as cloudinary } from 'cloudinary'
import { supabase } from '@/lib/supabase'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

async function uploadImages() {
  const images = [
    {
      cloudinary_id: '673effe1014d200884a17816_2-minTEST_y71lxe',
      alt: 'Art',
      url: '/art',
      order: 0
    },
    {
      cloudinary_id: '673efda82a5312b08ffd8f3c_Fles.Doos_ps066d',
      alt: 'Whisky', 
      url: '/whisky',
      order: 1
    },
    {
      cloudinary_id: '67193123a81afd0f845b81b6_charity_uvkgyg',
      alt: 'Charity',
      url: '/charity', 
      order: 2
    }
  ]

  for (const image of images) {
    // Update Supabase with existing Cloudinary IDs
    await supabase
      .from('circle_hero_images')
      .upsert({
        cloudinary_id: image.cloudinary_id,
        alt: image.alt,
        url: image.url,
        order_number: image.order
      })
  }
}

uploadImages() 