import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getAudioUrl(filePath: string): Promise<string> {
  // Get the signed URL from Supabase storage
  const { data, error } = await supabase
    .storage
    .from('audio')
    .createSignedUrl(filePath, 3600) // 1 hour expiry

  if (error || !data?.signedUrl) {
    throw new Error('Failed to get signed URL for audio file')
  }

  return data.signedUrl
}
