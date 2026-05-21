import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env.local")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase = create_client(url, key)

def get_supabase():
    return supabase

print("Connected")
