import { supabase } from '@/lib/supabase'
import { CircleSection } from '@/types/circle-sections'

export async function getCircleSections(): Promise<CircleSection[]> {
  const { data: words, error } = await supabase
    .from('circle_hero_words')
    .select('*')
    .order('order_number', { ascending: true })

  if (error) {
    console.error('Error fetching circle sections:', error)
    throw new Error('Failed to fetch circle sections')
  }

  console.log('Raw words from database:', words) // Debug log

  // Map de korte woorden naar de juiste URLs
  const urlMap: { [key: string]: string } = {
    'Ar': '/art',
    'Whisk': '/whisky',
    'Charit': '/charity'
  }

  // Transformeert de data naar het juiste formaat voor de cirkels
  return words.map(word => ({
    id: word.id,
    text: word.word,
    href: urlMap[word.word] || `/${word.word.toLowerCase()}`,
    order_number: word.order_number,
    glowColor: getGlowColor(word.word)
  }))
}

function getGlowColor(text: string) {
  // Match de exacte woorden uit de database
  switch (text) {
    case 'Ar':
      return {
        background: 'rainbow',
        shadow: 'rainbow'
      }
    case 'Whisk':
      return {
        background: 'rgba(218,165,32,0.1)',
        shadow: '0 0 40px 0px rgba(218,165,32,0.4)'
      }
    case 'Charit':
      return {
        background: 'rgba(3,117,255,0.1)',
        shadow: '0 0 40px 0px rgba(3,117,255,0.4)'
      }
    default:
      return {
        background: 'rgba(255,255,255,0.1)',
        shadow: '0 0 40px 0px rgba(255,255,255,0.4)'
      }
  }
} 