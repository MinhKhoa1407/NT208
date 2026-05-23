import time
import random
import requests
from datetime import datetime
from bs4 import BeautifulSoup
from db import get_supabase

BASE_URL = "http://www.wikicfp.com"

# Khởi tạo kết nối Supabase
supabase = get_supabase()
session = requests.Session()

headers = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive"
}


def fetch(url, retries=3):
    for i in range(retries):
        try:
            r = session.get(url, headers=headers, timeout=(10, 20))
            if r.status_code == 200:
                return r.text
            elif r.status_code in [403, 429]:
                print(f"   [Cảnh báo] Bị giới hạn bởi WikiCFP. Đọc chậm lại...")
                time.sleep(10 + i * 5)
        except Exception as e:
            time.sleep(2 + i)
    return None


def parse_only_details(html):
    """Bóc tách phần Topics và Description từ HTML trang chi tiết"""
    soup = BeautifulSoup(html, "html.parser")
    
    # 1. Bóc tách Topics
    topics_list = []
    category_links = soup.select("td h5 a[href*='call?conference=']")
    for a in category_links:
        text = a.get_text(strip=True)
        if text.lower() == "categories":
            continue
        if text and text not in topics_list:
            topics_list.append(text)
    topics_text = ", ".join(topics_list) if topics_list else None

    # 2. Bóc tách Description
    description = None
    cfp_div = soup.find("div", class_="cfp")
    if cfp_div:
        description = cfp_div.get_text("\n", strip=True)[:10000]
    else:
        body = soup.find("body")
        if body:
            description = body.get_text("\n", strip=True)[:5000]
            
    return topics_text, description


def sync_conferences_to_cfp():
    try:
        today_str = datetime.now().strftime("%Y-%m-%d")
        print(f"=== BẮT ĐẦU ĐỒNG BỘ CFP TỪ CÁC CONF CÒN HẠN ({today_str}) ===")

        # 🎯 BƯỚC 1: Lấy các hội nghị có hạn nộp bài >= hôm nay và có liên kết source_id
        active_confs_res = (
            supabase
            .table("conferences")
            .select("id", "full_name", "submission_deadline", "source_id")
            .gte("submission_deadline", today_str)
            .not_.is_("source_id", "null") # Phải có source_id mới truy xuất được link cào
            .execute()
        )

        active_confs = active_confs_res.data

        if not active_confs:
            print("-> Không tìm thấy hội nghị nào còn hạn nộp bài phù hợp.")
            return

        print(f"-> Tìm thấy {len(active_confs)} hội nghị còn hạn. Bắt đầu đối chiếu source...")

        # 🎯 BƯỚC 2: Duyệt qua từng hội nghị để tìm link WikiCFP gốc và cào bù dữ liệu
        for index, conf in enumerate(active_confs, 1):
            conf_id = conf["id"]
            conf_name = conf["full_name"]
            deadline = conf["submission_deadline"]
            source_id = conf["source_id"]

            print(f"\n[{index}/{len(active_confs)}] Đang xử lý: {conf_name}")

            # Truy vết ngược bảng sources bằng source_id để lấy base_url (Link WikiCFP thực sự)
            source_res = (
                supabase
                .table("sources")
                .select("base_url")
                .eq("id", source_id)
                .execute()
            )

            if not source_res.data or not source_res.data[0]["base_url"]:
                print(f"   ⚠️ [Bỏ qua] Không tìm thấy link WikiCFP gốc trong bảng sources cho ID nguồn: {source_id}")
                continue

            wikicfp_url = source_res.data[0]["base_url"]

            # Tiến hành tải dữ liệu từ link WikiCFP gốc
            print(f"   -> [Cào dữ liệu] Đang tải trang WikiCFP: {wikicfp_url}")
            html = fetch(wikicfp_url)
            if not html:
                print(f"   -> [Lỗi] Không thể tải dữ liệu từ URL.")
                continue

            # Bóc tách thông tin topics và description từ trang chi tiết
            topics, description = parse_only_details(html)

            # 🎯 BƯỚC 3: Chuẩn bị dữ liệu lưu khớp 100% cấu trúc Schema bảng public.cfp
            cfp_data = {
                "title": conf_name,                # text NOT NULL
                "journal_id": None,                # bigint
                "conference_id": conf_id,          # bigint FOREIGN KEY
                "deadline": deadline,              # date
                "topics": topics,                  # text
                "description": description,        # text
                "cfp_url": wikicfp_url             # text UNIQUE (Dùng link WikiCFP đồng bộ với file cào chính)
            }

            # Thực hiện Upsert chặn trùng mượt mà theo cột cfp_url đã cấu hình UNIQUE trên Postgres
            supabase.table("cfp").upsert(cfp_data, on_conflict="cfp_url").execute()
            print(f"   🎯 [THÀNH CÔNG] Đã đồng bộ (Upsert) dữ liệu sang bảng public.cfp")

            # Ngủ ngẫu nhiên chống quét dồn dập
            time.sleep(random.uniform(3.5, 5.5))

        print("\n=== HOÀN THÀNH TIẾN TRÌNH ĐỒNG BỘ DỮ LIỆU ===")

    except Exception as e:
        print("❌ Đã xảy ra lỗi hệ thống trong quá trình xử lý:", e)


if __name__ == "__main__":
    sync_conferences_to_cfp()