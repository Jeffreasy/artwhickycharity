import { getLanguagePhrases } from '../../lib/language-bar'
import { LanguageBarClient } from './LanguageBarClient'

export async function LanguageBarServer() {
  try {
    const phrases = await getLanguagePhrases()
    if (!phrases?.length) {
      console.warn('No language phrases found')
      return null
    }
    
    return <LanguageBarClient initialPhrases={phrases} />
  } catch (error) {
    console.error('Failed to load language phrases:', error)
    return null
  }
} 