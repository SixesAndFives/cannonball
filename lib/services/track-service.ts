import { supabase } from '@/lib/supabase-client'

export async function incrementTrackPlays(trackId: string): Promise<void> {
  // First get the current play count
  const { data, error: fetchError } = await supabase
    .from('tracks')
    .select('plays')
    .eq('id', trackId)
    .single()

  if (fetchError) {
    console.error('Error fetching track plays:', fetchError)
    return
  }

  // Then increment it
  const { error: updateError } = await supabase
    .from('tracks')
    .update({ plays: (data?.plays || 0) + 1 })
    .eq('id', trackId)

  if (updateError) {
    console.error('Error incrementing track plays:', updateError)
  }
}
