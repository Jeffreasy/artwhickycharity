import { supabase } from '@/lib/supabase'
import { InstagramPost, CachedSocialPost } from '@/app/home/types/social-media'

interface TikTokPost {
  id: string
  video_url: string
  description: string
  create_time: string
  share_url: string
}

export async function getInstagramPosts() {
  // Hier komt de Instagram Graph API implementatie
  // Je hebt een Instagram Business/Creator account nodig
  // en een Facebook Developer account
  
  const INSTAGRAM_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN
  const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID
  
  if (!INSTAGRAM_TOKEN || !INSTAGRAM_USER_ID) {
    console.error('Missing Instagram credentials')
    return []
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/v12.0/${INSTAGRAM_USER_ID}/media?fields=id,caption,media_url,timestamp,permalink,media_type&access_token=${INSTAGRAM_TOKEN}`
    )
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching Instagram posts:', error)
    return []
  }
}

export async function getTikTokPosts(): Promise<TikTokPost[]> {
  // Hier komt de TikTok API implementatie
  // Je hebt een TikTok Developer account nodig
  
  const TIKTOK_TOKEN = process.env.TIKTOK_ACCESS_TOKEN
  
  if (!TIKTOK_TOKEN) {
    console.error('Missing TikTok credentials')
    return []
  }

  try {
    // Implementeer TikTok API calls hier
    return []
  } catch (error) {
    console.error('Error fetching TikTok posts:', error)
    return []
  }
}

// Cache social media posts in Supabase voor betere performance
export async function cacheSocialMediaPosts() {
  try {
    const [instagramPosts, tiktokPosts] = await Promise.all([
      getInstagramPosts(),
      getTikTokPosts()
    ])

    // Update Instagram posts
    await supabase
      .from('cached_social_posts')
      .upsert(
        instagramPosts.map((post: InstagramPost) => ({
          platform: 'instagram',
          post_id: post.id,
          data: post,
          cached_at: new Date().toISOString()
        }))
      )

    // Update TikTok posts
    if (tiktokPosts.length > 0) {
      await supabase
        .from('cached_social_posts')
        .upsert(
          tiktokPosts.map((post: TikTokPost) => ({
            platform: 'tiktok',
            post_id: post.id,
            data: post,
            cached_at: new Date().toISOString()
          }))
        )
    }
  } catch (error) {
    console.error('Error caching social media posts:', error)
  }
}

export async function fetchAndCacheInstagramPosts() {
  const INSTAGRAM_TOKEN = process.env.NEXT_PUBLIC_INSTAGRAM_TOKEN
  const INSTAGRAM_USER_ID = process.env.NEXT_PUBLIC_INSTAGRAM_USER_ID

  if (!INSTAGRAM_TOKEN || !INSTAGRAM_USER_ID) {
    console.error('Missing Instagram credentials')
    return []
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/v12.0/${INSTAGRAM_USER_ID}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{media_url,media_type}&access_token=${INSTAGRAM_TOKEN}`
    )
    
    const data = await response.json()
    const posts: InstagramPost[] = data.data

    const transformedPosts: CachedSocialPost[] = posts.map(post => ({
      platform: 'instagram',
      post_id: post.id,
      media_type: post.media_type,
      media_url: post.media_url,
      thumbnail_url: post.thumbnail_url,
      caption: post.caption,
      permalink: post.permalink,
      timestamp: new Date(post.timestamp).toISOString()
    }))

    // Update Supabase zonder 'returning'
    const { error } = await supabase
      .from('cached_social_posts')
      .upsert(transformedPosts, {
        onConflict: 'platform,post_id'
      })

    if (error) {
      console.error('Error caching posts:', error)
      return []
    }

    return transformedPosts
  } catch (error) {
    console.error('Error fetching Instagram posts:', error)
    return []
  }
}

// Functie om gecachte posts op te halen
export async function getCachedSocialPosts(platform: 'instagram' | 'tiktok' = 'instagram') {
  const { data, error } = await supabase
    .from('cached_social_posts')
    .select('*')
    .eq('platform', platform)
    .eq('is_active', true)
    .order('timestamp', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching cached posts:', error)
    return []
  }

  return data as CachedSocialPost[]
} 