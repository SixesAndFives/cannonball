import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getAudioUrl(filePath: string): Promise<string> {
  console.log('=== Getting Audio URL ===', {
    time: new Date().toISOString(),
    filePath,
    stage: 'start'
  })

  // If it's already a full Backblaze URL, return it directly
  if (filePath.startsWith('https://')) {
    console.log('=== Audio URL Success ===', {
      time: new Date().toISOString(),
      filePath,
      isBackblazeUrl: true,
      stage: 'complete'
    })
    return filePath;
  }

  // Otherwise construct the Backblaze URL
  const fullUrl = `https://f004.backblazeb2.com/file/cannonball-music/${filePath}`;
  
  console.log('=== Audio URL Success ===', {
    time: new Date().toISOString(),
    filePath,
    fullUrl,
    stage: 'complete'
  })

  return fullUrl
}
