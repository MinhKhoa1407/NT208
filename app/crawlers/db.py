from supabase import create_client

url = "https://rirrowtpomzxqguokvuc.supabase.co"
key = "sb_publishable_xD_-3ZQ8HdwD04OeQUvIoA_qmsN_Z60"

supabase = create_client(url, key)

def get_supabase():
    return supabase

print("Connected")