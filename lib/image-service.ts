import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getImageUrl(filePath: string): Promise<string> {
  // Get the signed URL from Supabase storage
  const { data, error } = await supabase
    .storage
    .from('images')
    .createSignedUrl(filePath, 3600) // 1 hour expiry

  if (error || !data?.signedUrl) {
    throw new Error('Failed to get signed URL for image file')
  }

  return data.signedUrl
}
