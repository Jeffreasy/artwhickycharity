import { LanguagePhrase } from '@/types/language-bar'
import { supabase } from '@/lib/supabase'

export async function getLanguagePhrases(): Promise<LanguagePhrase[]> {
  console.log('Fetching language phrases...')
  
  const { data: phrases, error } = await supabase
    .from('language_phrases')
    .select('*')
    .eq('is_active', true)
    .order('order_number', { ascending: true })

  if (error) {
    console.error('Error fetching language phrases:', error)
    throw new Error('Failed to fetch language phrases')
  }

  console.log('Fetched phrases:', phrases)
  return phrases
}

export async function updateLanguagePhrase(id: string, updates: Partial<LanguagePhrase>) {
  const { error } = await supabase
    .from('language_phrases')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('Error updating language phrase:', error)
    throw new Error('Failed to update language phrase')
  }
}

export async function createLanguagePhrase(phrase: Omit<LanguagePhrase, 'id' | 'created_at' | 'updated_at'>) {
  const { error } = await supabase
    .from('language_phrases')
    .insert(phrase)

  if (error) {
    console.error('Error creating language phrase:', error)
    throw new Error('Failed to create language phrase')
  }
}

export async function deleteLanguagePhrase(id: string) {
  const { error } = await supabase
    .from('language_phrases')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    console.error('Error deleting language phrase:', error)
    throw new Error('Failed to delete language phrase')
  }
}

// Helper functie om te controleren of realtime werkt
export async function testRealtimeConnection() {
  const channel = supabase.channel('test-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'language_phrases',
      },
      (payload) => {
        console.log('Realtime event received:', payload)
      }
    )
    .subscribe((status) => {
      console.log('Channel status:', status)
    })

  return channel
} 