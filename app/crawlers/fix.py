import time
import random
import requests
from bs4 import BeautifulSoup
from db import get_supabase

supabase = get_supabase()
session = requests.Session()

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9"
}

def extract_official_link(wikicfp_url):
    """Cào trực tiếp lấy Link Website chính thức từ WikiCFP"""
    try:
        if not wikicfp_url or "FALLBACK" in wikicfp_url or not wikicfp_url.startswith("http"):
            return None

        r = session.get(wikicfp_url, headers=headers, timeout=10)
        if r.status_code != 200:
            print(f"   ⚠️ Lỗi HTTP {r.status_code} khi tải trang WikiCFP.")
            return None
        
        soup = BeautifulSoup(r.text, "html.parser")
        link_text_node = soup.find(string=lambda t: t and "Link:" in t)
        if link_text_node:
            a_tag = link_text_node.find_next("a")
            if a_tag and a_tag.get("href"):
                return a_tag["href"].strip()
        return None
    except Exception as e:
        print(f"   ⚠️ Lỗi khi cào link {wikicfp_url}: {e}")
        return None

def main():
    print("🚀 [PRODUCTION MODE] BẮT ĐẦU DUYỆT VÀ GHI DỮ LIỆU THẬT VÀO DATABASE...")
    print("📖 Đang quét cuốn chiếu toàn bộ bảng conferences theo cơ chế Keyset Pagination (An toàn tuyệt đối)...")
    
    page_size = 1000
    last_id = 0  # Bắt đầu quét từ bản ghi có ID lớn hơn 0
    total_processed = 0

    while True:
        # 🎯 TỐI ƯU: Lấy 1000 dòng có ID lớn hơn last_id trước đó, sắp xếp theo ID tăng dần
        res = (
            supabase.table("conferences")
            .select("id", "acronym", "conference_url")
            .gt("id", last_id)
            .order("id")
            .limit(page_size)
            .execute()
        )
        
        records = res.data
        if not records:
            break  # Hết sạch dữ liệu (không còn ID nào lớn hơn last_id) -> Dừng hệ thống

        print(f"\n📦 [ĐANG ĐỌC] Lấy thành công đợt dữ liệu mới (Sau ID: {last_id})")
        print(f"🔥 Tìm thấy {len(records)} dòng trong lượt này. Đang rà soát điều kiện...")

        for record in records:
            total_processed += 1
            conf_id = record["id"]
            acronym = record["acronym"] or "CONF"
            old_url = record["conference_url"] or ""

            # Cập nhật mốc last_id liên tục để gối đầu cho đợt truy vấn sau
            last_id = conf_id

            print(f"[{total_processed}] 🔄 Đang rà soát ID: {conf_id} | Acronym: {acronym}")

            # 🎯 ĐIỀU KIỆN LỌC: Chỉ xử lý link WikiCFP gốc
            if old_url and "wikicfp.com" in old_url and not old_url.startswith("FALLBACK"):
                source_id = None
                
                # 1. Đưa link cũ vào bảng sources
                try:
                    source_payload = {
                        "name": f"WikiCFP - {acronym}",
                        "base_url": old_url,
                        "source_type": "Conference Call"
                    }
                    source_res = supabase.table("sources").upsert(source_payload, on_conflict="base_url").execute()
                    if source_res.data:
                        source_id = source_res.data[0]["id"]
                        print(f"   + Đã upsert bảng sources -> Source ID thật: {source_id}")
                except Exception as e:
                    print(f"   ❌ Thất bại khi ghi nhận vào bảng sources: {e}")

                # 2. Cào lấy link chính thức mới
                new_url = extract_official_link(old_url)
                
                if new_url:
                    print(f"   + 🎯 Đã lấy được link Website mới: {new_url}")
                else:
                    new_url = f"FALLBACK_OFFICIAL_CONF_{conf_id}"
                    print(f"   + ⚠️ Không tìm thấy link web riêng, dùng fallback: {new_url}")

                # 3. Ghi đè cập nhật lại vào bảng conferences
                try:
                    update_payload = {
                        "conference_url": new_url
                    }
                    if source_id:
                        update_payload["source_id"] = source_id

                    supabase.table("conferences").update(update_payload).eq("id", conf_id).execute()
                    print(f"   ✅ Cập nhật thành công bảng conferences cho dòng ID: {conf_id}")
                except Exception as db_err:
                    print(f"   ❌ Lỗi khi update bảng conferences dính dòng ID {conf_id}: {db_err}")

                # Giãn cách thời gian an toàn tránh bị WikiCFP chặn IP
                time.sleep(random.uniform(1.5, 3.0))
            
            else:
                # Bỏ qua ngay lập tức, chạy lướt qua luôn cực kỳ nhanh
                print("   ⏩ Không phải link WikiCFP gốc hoặc dính link Fallback. Bỏ qua thẳng!")
                
            print("-" * 80)

    print(f"\n🎉 HOÀN THÀNH QUY TRÌNH CHẠY THẬT! Tổng cộng đã duyệt sạch {total_processed} dòng trong table.")

if __name__ == "__main__":
    main()