import os
import asyncio
from supabase import create_client

url = os.environ.get("SUPABASE_URL", "https://xhmsndxwoxlasrcljqbq.supabase.co")
key = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhobXNuZHh3b3hsYXNyY2xqcWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMjkzMzUsImV4cCI6MjA5ODgwNTMzNX0.N7zlygauXsyHhf3Cuny0ci4OEiNeG-xwTGGeGqji45I")
supabase = create_client(url, key)

res = supabase.auth.sign_up({
    "email": "info@aatomate.com",
    "password": "Gre@tAndhr@#2026"
})
print("Sign up response:", res)
