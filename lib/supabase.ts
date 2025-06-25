import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rafhkwpcmpzcfejmakzi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZmhrd3BjbXB6Y2Zlam1ha3ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODY0NjUsImV4cCI6MjA2NjM2MjQ2NX0.ir1xHiP5jjMQL356m-_Vkg9zDxy5JS3lhsXrM3vpRdU'

export const supabase = createClient(supabaseUrl, supabaseKey)
