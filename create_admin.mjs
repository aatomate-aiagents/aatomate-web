import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xhmsndxwoxlasrcljqbq.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhobXNuZHh3b3hsYXNyY2xqcWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMjkzMzUsImV4cCI6MjA5ODgwNTMzNX0.N7zlygauXsyHhf3Cuny0ci4OEiNeG-xwTGGeGqji45I'

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log("Signing up user...")
  const { data, error } = await supabase.auth.signUp({
    email: 'info@aatomate.com',
    password: 'Gre@tAndhr@#2026',
  })
  
  if (error) {
    console.error("Error creating user:", error.message)
  } else {
    console.log("Success! User created.")
    console.log(data)
  }
}
main()
