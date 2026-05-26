import { createClient } from '@supabase/supabase-js'

// Sử dụng tiền tố NEXT_PUBLIC_ để chạy mượt mà ở cả file "use client" (Front-end) và API Route (Back-end)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Thiếu cấu hình NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_KEY trong file .env.local')
}

// Khởi tạo thực thể Client duy nhất và export trực tiếp
export const supabase = createClient(supabaseUrl!, supabaseKey!)