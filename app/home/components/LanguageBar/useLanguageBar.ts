import { useState, useEffect } from 'react'
import { LanguagePhrase } from '@/types/language-bar'
import { supabase } from '@/lib/supabase'

export function useLanguageBar(initialPhrases: LanguagePhrase[]) {
  const [phrases, setPhrases] = useState<LanguagePhrase[]>(initialPhrases)

  useEffect(() => {
    const channel = supabase.channel('language_phrases')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'language_phrases',
        },
        async () => {
          const { data, error } = await supabase
            .from('language_phrases')
            .select('*')
            .eq('is_active', true)
            .order('order_number', { ascending: true })

          if (!error && data) {
            setPhrases(data)
          }
        }
      )
      .subscribe()

    return () => {
      void channel.unsubscribe()
    }
  }, [])

  return { phrases }
} 