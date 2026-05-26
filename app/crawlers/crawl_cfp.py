import time
import random
import requests
from datetime import datetime
from bs4 import BeautifulSoup
from db import get_supabase

BASE_URL = "http://www.wikicfp.com"

# Khởi tạo kết nối Supabase và Session
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

print("🚀 Hệ thống kết nối thành công qua allcfp dynamic infinite route (Khớp Schema 100%)...")


# =====================================================================
# TẢI NỘI DUNG HTML CÓ CƠ CHẾ CHỐNG CHẶN (ANTI-BOT)
# =====================================================================
def fetch(url, retries=5):
    for i in range(retries):
        try:
            r = session.get(url, headers=headers, timeout=(10, 30))
            print(f"[HTTP {r.status_code}] {url}")

            if r.status_code == 200:
                return r.text
            elif r.status_code in [403, 429]:
                print(f"   ⚠️ [Cảnh báo] Rate limit hoặc bị chặn. Đang ngủ lâu hơn để giải phóng IP...")
                time.sleep(15 + i * 5)
            else:
                time.sleep(2 + i)
        except Exception as e:
            print(f"   ❌ [Lỗi tải trang] {url} -> {e}")
            time.sleep(2 + i)
    return None


# =====================================================================
# CÀO TỰ ĐỘNG ĐẾN KHI HẾT SẠCH TRANG ALLCFP
# =====================================================================
def get_latest_cfp_urls():
    cfp_urls = []
    seen = set()
    page = 1

    while True:
        url = f"{BASE_URL}/cfp/allcfp?page={page}"
        print(f"\n[Quét Danh Sách] Đang đọc dữ liệu trang {page}...")
        
        html = fetch(url)
        if not html:
            print(f"-> Không thể tải dữ liệu trang {page}. Dừng quét danh sách.")
            break

        soup = BeautifulSoup(html, "html.parser")
        links = soup.find_all("a", href=lambda h: h and "event.showcfp" in h)
        
        if not links:
            print(f"-> Trang {page} trống rỗng. Dừng quét.")
            break

        page_links_count = 0
        
        for a in links:
            href = a.get("href")
            full_url = BASE_URL + href if href.startswith("/") else BASE_URL + "/" + href
            
            if full_url not in seen:
                seen.add(full_url)
                cfp_urls.append(full_url)
                page_links_count += 1
                
        print(f"-> Trang {page}: Tìm thấy {page_links_count} URLs mới.")

        if page_links_count == 0:
            print(f"-> [DỪNG LẠI] Trang {page} không chứa bất kỳ URL mới nào nữa. Kết thúc quét danh sách.")
            break
        
        print(f"   (Tổng tích lũy hiện tại: {len(cfp_urls)} URLs)")
        
        page += 1
        time.sleep(random.uniform(2.5, 4.5))
        
    return cfp_urls


# =====================================================================
# BÓC TÁCH CHI TIẾT 1 TRANG CFP (SỬ DỤNG TEXT NODE LOGIC)
# =====================================================================
def parse_cfp_detail(wikicfp_url):
    html = fetch(wikicfp_url)
    if not html:
        return None

    soup = BeautifulSoup(html, "html.parser")

    title_tag = soup.find("title")
    full_name = title_tag.text.replace("| WikiCFP", "").strip() if title_tag else "Unknown Conference"
    acronym = full_name.split(":")[0].strip() if full_name else None

    deadline = None
    topics_list = []
    description = None
    location = None
    conference_date = None
    official_link = None

    link_text_node = soup.find(string=lambda t: t and "Link:" in t)
    if link_text_node:
        a_tag = link_text_node.find_next("a")
        if a_tag and a_tag.get("href"):
            official_link = a_tag["href"].strip()

    for row in soup.find_all("tr"):
        th = row.find("th")
        if not th:
            continue
        label = th.get_text(strip=True)

        if "Where" in label:
            td = row.find("td")
            if td:
                location = td.get_text(strip=True)

        if "Submission Deadline" in label:
            date_span = row.find("span", {"property": "v:startDate"})
            if date_span and date_span.get("content"):
                deadline = date_span["content"][:10]

    event_block = soup.find("span", {"typeof": "v:Event"})
    if event_block:
        start_span = event_block.find("span", {"property": "v:startDate"})
        if start_span and start_span.get("content"):
            conference_date = start_span["content"][:10]

    category_links = soup.select("td h5 a[href*='call?conference=']")
    for a in category_links:
        text = a.get_text(strip=True)
        if text.lower() == "categories":
            continue
        if text and text not in topics_list:
            topics_list.append(text)

    topics_text = ", ".join(topics_list) if topics_list else None

    cfp_div = soup.find("div", class_="cfp")
    if cfp_div:
        description = cfp_div.get_text("\n", strip=True)[:10000]
    else:
        body = soup.find("body")
        if body:
            description = body.get_text("\n", strip=True)[:5000]

    return {
        "full_name": full_name,
        "acronym": acronym,
        "location": location,
        "conference_date": conference_date,
        "deadline": deadline,
        "topics": topics_text,
        "description": description,
        "official_link": official_link,
        "wikicfp_url": wikicfp_url
    }


# =====================================================================
# LƯU DỮ LIỆU VÀO SUPABASE (CHÍNH XÁC: TRẢ VỀ CFP_ID KHI CÓ BÀI MỚI TINH)
# =====================================================================
def save_cfp(cfp):
    """
    Hàm lưu dữ liệu.
    Trả về: cfp_id (int) từ bảng public.cfp nếu đây là bài viết MỚI TINH được thêm vào hệ thống.
    Trả về: None nếu bài viết này đã tồn tại sẵn từ trước và chỉ chạy UPDATE.
    """
    try:
        source_id = None
        conference_id = None
        is_brand_new = False # Đánh dấu xem có phải bài đăng mới tinh không
        
        wikicfp_url = cfp["wikicfp_url"]
        acronym = cfp["acronym"] or "CONF"
        full_name = cfp["full_name"]

        final_official_url = cfp["official_link"] if cfp["official_link"] else f"FALLBACK_OFFICIAL_CONF_{acronym}_{int(time.time())}"

        # 1. TRA CỨU LINK WIKICFP NÀY TRONG BẢNG SOURCES
        source_check = (
            supabase
            .table("sources")
            .select("id")
            .eq("base_url", wikicfp_url)
            .execute()
        )

        if source_check.data:
            # 👉 TRƯỜNG HỢP A: LINK WIKICFP NÀY ĐÃ CÓ TRONG HỆ THỐNG
            source_id = source_check.data[0]["id"]
            print(f"   + [Sources] Link đã tồn tại. Source ID: {source_id}")

            conf_check = (
                supabase
                .table("conferences")
                .select("id")
                .eq("source_id", source_id)
                .execute()
            )
            
            if conf_check.data:
                # Tìm thấy hội nghị cũ -> CHỈ UPDATE (Không cần gửi thông báo mới)
                conference_id = conf_check.data[0]["id"]
                print(f"   + [Conferences] Tìm thấy hội nghị cũ qua source_id. ID: {conference_id}")
                
                update_payload = {}
                if cfp["deadline"]:
                    update_payload["submission_deadline"] = cfp["deadline"]
                if cfp["location"]:
                    update_payload["location"] = cfp["location"]
                if cfp["conference_date"]:
                    update_payload["conference_date"] = cfp["conference_date"]
                
                if update_payload:
                    supabase.table("conferences").update(update_payload).eq("id", conference_id).execute()
            else:
                # XỬ LÝ SOURCE MỒ CÔI: Có nguồn nhưng chưa có thông tin hội nghị -> TẠO MỚI TINH
                print(f"   ⚠️ [Phát hiện Source mồ côi] Tiến hành tạo bù hội nghị cho Source ID: {source_id}...")
                is_brand_new = True 
                
                new_conf = {
                    "full_name": full_name,
                    "acronym": acronym,
                    "field": cfp["topics"], 
                    "location": cfp["location"],
                    "conference_date": cfp["conference_date"],
                    "submission_deadline": cfp["deadline"],
                    "conference_url": final_official_url,
                    "source_id": source_id,
                    "rank": "Unranked"
                }
                
                try:
                    insert_res = (
                        supabase
                        .table("conferences")
                        .upsert(new_conf, on_conflict="acronym,full_name,rank") 
                        .execute()
                    )
                    if insert_res.data:
                        conference_id = insert_res.data[0]["id"]
                        print(f"   + [Conferences] Đã sửa lỗi mồ côi và tạo mới hội nghị thành công. ID: {conference_id}")
                except Exception as e:
                    print(f"   ❌ Thất bại khi tạo bù hội nghị mồ côi: {e}")
        
        else:
            # 👉 TRƯỜNG HỢP B: LINK WIKICFP NÀY MỚI TINH VÀ CHƯA CÓ TRONG SOURCES
            print(f"   + [Sources] Link mới tinh! Tiến hành thêm nguồn và hội nghị mới...")
            is_brand_new = True # 🌟 Xác nhận đây là bài đăng hội nghị mới tinh!
            
            # Tạo nguồn mới
            try:
                source_payload = {
                    "name": f"WikiCFP - {acronym}",
                    "base_url": wikicfp_url,
                    "source_type": "Conference Call"
                }
                source_res = supabase.table("sources").insert(source_payload).execute()
                if source_res.data:
                    source_id = source_res.data[0]["id"]
            except Exception as e:
                print(f"   ❌ Thất bại khi tạo nguồn mới: {e}")

            # Thêm mới vào bảng conferences
            new_conf = {
                "full_name": full_name,
                "acronym": acronym,
                "field": cfp["topics"], 
                "location": cfp["location"],
                "conference_date": cfp["conference_date"],
                "submission_deadline": cfp["deadline"],
                "conference_url": final_official_url,
                "source_id": source_id,
                "rank": "Unranked"
            }
            
            try:
                insert_res = (
                    supabase
                    .table("conferences")
                    .upsert(new_conf, on_conflict="acronym,full_name,rank") 
                    .execute()
                )
                if insert_res.data:
                    conference_id = insert_res.data[0]["id"]
                    print(f"   + [Conferences] Thêm mới thành công hội nghị unranked. ID: {conference_id}")
            except Exception as e:
                print(f"   ❌ Thất bại khi thêm hội nghị mới: {e}")

        # 2. ĐỒNG BỘ DỮ LIỆU VÀO BẢNG CFP (LUÔN CHẠY)
        if conference_id:
            cfp_data_to_save = {
                "title": full_name,
                "journal_id": None,
                "conference_id": conference_id,
                "deadline": cfp["deadline"],
                "topics": cfp["topics"],
                "description": cfp["description"],
                "cfp_url": wikicfp_url
            }
            
            # 🌟 SỬA ĐỔI QUAN TRỌNG: Thực hiện upsert và lấy data trả về trực tiếp từ bảng 'cfp'
            cfp_res = supabase.table("cfp").upsert(cfp_data_to_save, on_conflict="cfp_url").execute()
            print(f"   🎯 [THÀNH CÔNG] Đã lưu dữ liệu public.cfp cho hội nghị: {acronym}\n")
            
            # 🌟 XỬ LÝ LẤY CHÍNH XÁC ID CỦA BẢNG public.cfp
            if is_brand_new and cfp_res.data:
                actual_cfp_id = cfp_res.data[0]["id"] # <--- Lấy id tự tăng của bảng cfp thay vì conference_id!
                return actual_cfp_id
        else:
            print(f"   ⚠️ [Bỏ qua] Không có conference_id, hủy đồng bộ sang bảng cfp cho {acronym}\n")

    except Exception as e:
        print(f"❌ Lỗi quy trình lưu DB cho {cfp['full_name']}:", e)
        
    return None 


# =====================================================================
# ĐIỀU KHIỂN CHÍNH (MAIN CONTROL)
# =====================================================================
if __name__ == "__main__":
    print("\n=== KÍCH HOẠT TIẾN TRÌNH CÀO TOÀN DIỆN ALLCFP ===")
    
    # Bước 1: Quét lấy danh sách URL
    latest_urls = get_latest_cfp_urls()
    print(f"\n=== ĐÃ QUÉT XONG DANH SÁCH ===")
    print(f"Tổng số lượng bài viết CFP mới tìm thấy: {len(latest_urls)}\n")

    # 🌟 MẢNG CHỨA CÁC ID CỦA CFP MỚI TINH (LẤY TỪ BẢNG public.cfp)
    new_cfp_ids = []

    # Bước 2: Duyệt chi tiết từng URL để cào dữ liệu sâu và ghi DB
    for index, url in enumerate(latest_urls, 1):
        try:
            print(f"[{index}/{len(latest_urls)}] Đang bóc tách chi tiết bài đăng...")
            cfp_data = parse_cfp_detail(url)
            if cfp_data:
                # Nhận về cfp_id nếu là bài mới tinh, nhận về None nếu là bài cũ cập nhật
                inserted_cfp_id = save_cfp(cfp_data)
                
                if inserted_cfp_id:
                    new_cfp_ids.append(inserted_cfp_id)
            
            time.sleep(random.uniform(3.5, 5.5))
        except Exception as e:
            print(f"❌ Lỗi nghiêm trọng tại URL {url} -> {e}")

    print("🎉 HOÀN THÀNH TIẾN TRÌNH: HỆ THỐNG ĐÃ ĐỒNG BỘ SẠCH SẼ!")
    print(f"📊 Kết quả: Tìm thấy {len(new_cfp_ids)} bài viết CfP mới tinh cần tạo thông báo.")
    print(f"📋 Danh sách CFP IDs mới: {new_cfp_ids}")

    # BƯỚC CUỐI CÙNG: Đẩy mảng ID này sang cho Next.js Backend xử lý thông báo bằng API Route
    if len(new_cfp_ids) > 0:
        print("🚀 Đang gửi dữ liệu sang Next.js Backend để tạo thông báo cho User...")
        
        # Khi test ở Local:
        API_URL = "http://localhost:3000/api/notifications"
        
        # Khi deploy lên Production:
        # API_URL = "https://sciwrite.vercel.app/api/notifications"
        
        try:
            response = requests.post(
                API_URL, 
                json={"cfpIds": new_cfp_ids},
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            if response.status_code == 200:
                print(f"✅ Kết quả Backend: {response.json().get('message')}")
            else:
                print(f"❌ Lỗi Backend xử lý thất bại (Status: {response.status_code}): {response.text}")
        except Exception as e:
            print(f"❌ Không thể kết nối tới Server Next.js: {e}")