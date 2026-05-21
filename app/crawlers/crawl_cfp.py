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

print("Connected to system via allcfp dynamic infinite route...")


# =====================================
# FETCH HTML
# =====================================
def fetch(url, retries=5):
    for i in range(retries):
        try:
            r = session.get(url, headers=headers, timeout=(10, 30))
            print(f"[HTTP {r.status_code}] {url}")

            if r.status_code == 200:
                return r.text
            elif r.status_code in [403, 429]:
                print(f"[Warning] Rate limit hoặc bị chặn. Đang ngủ lâu hơn...")
                time.sleep(15 + i * 5)
            else:
                time.sleep(2 + i)
        except Exception as e:
            print(f"[Fetch error] {url} -> {e}")
            time.sleep(2 + i)
    return None


# =====================================
# CÀO TỰ ĐỘNG ĐẾN KHI HẾT SẠCH TRANG ALLCFP
# =====================================
def get_latest_cfp_urls():
    """
    Tự động tăng số trang liên tục.
    Sẽ DỪNG NGAY LẬP TỨC nếu một trang danh sách không thu hoạch thêm được 
    bất kỳ URL mới nào (tất cả đều đã bị trùng hoặc trang trống).
    """
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
        
        # Điều kiện dừng 1: Trang hoàn toàn trống rỗng không có thẻ <a> nào
        if not links:
            print(f"-> Trang {page} trống rỗng. Dừng quét.")
            break

        page_links_count = 0  # Biến đếm số lượng URL MỚI của RIÊNG TRANG NÀY
        
        for a in links:
            href = a.get("href")
            full_url = BASE_URL + href if href.startswith("/") else BASE_URL + "/" + href
            
            # Nếu URL này CHƯA TỪNG xuất hiện ở các trang trước
            if full_url not in seen:
                seen.add(full_url)
                cfp_urls.append(full_url)
                page_links_count += 1 # Tăng số lượng URL mới của trang hiện tại lên
                
        print(f"-> Trang {page}: Tìm thấy {page_links_count} URLs mới.")

        # ĐIỀU KIỆN DỪNG THEO LOGIC CỦA CẬU: 
        # Nếu đã duyệt qua hết các link trên trang này mà page_links_count vẫn bằng 0 
        # (nghĩa là trang này toàn đồ cũ, không thu hoạch được gì mới nữa) -> DỪNG LUÔN!
        if page_links_count == 0:
            print(f"-> [DỪNG LẠI] Trang {page} không chứa bất kỳ URL mới nào nữa. Kết thúc quét danh sách tại đây.")
            break
        
        print(f"   (Tổng tích lũy hiện tại: {len(cfp_urls)} URLs)")
        
        page += 1
        # Giãn cách nhẹ nhàng giữa các trang danh sách
        time.sleep(random.uniform(2.5, 4.5))
        
    return cfp_urls


# =====================================
# BÓC TÁCH CHI TIẾT 1 TRANG CFP
# =====================================
def parse_cfp_detail(url):
    html = fetch(url)
    if not html:
        return None

    soup = BeautifulSoup(html, "html.parser")

    # 1. Parse Title & Acronym
    title_tag = soup.find("title")
    full_name = title_tag.text.replace("| WikiCFP", "").strip() if title_tag else "Unknown Conference"
    acronym = full_name.split(":")[0].strip() if full_name else None

    deadline = None
    topics_list = []
    description = None
    location = None
    conference_date = None

    # 2. Parse các thông tin dạng bảng (Where, Submission Deadline, v.v.)
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

    # 3. Parse Conference Date (Thời gian diễn ra hội nghị)
    event_block = soup.find("span", {"typeof": "v:Event"})
    if event_block:
        start_span = event_block.find("span", {"property": "v:startDate"})
        if start_span and start_span.get("content"):
            conference_date = start_span["content"][:10]

    # 4. Parse Topics (Đồng bộ logic dấu phẩy)
    category_links = soup.select("td h5 a[href*='call?conference=']")
    for a in category_links:
        text = a.get_text(strip=True)
        if text.lower() == "categories":
            continue
        if text and text not in topics_list:
            topics_list.append(text)

    topics_text = ", ".join(topics_list) if topics_list else None

    # 5. Parse Description
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
        "cfp_url": url
    }


# =====================================
# LƯU DỮ LIỆU VÀO SUPABASE (TỰ ĐỘNG UPSERT)
# =====================================
def save_cfp(cfp):
    try:
        # Bước 1: Tìm theo URL xem hội nghị đã tồn tại trong bảng conferences chưa
        conf_res = (
            supabase
            .table("conferences")
            .select("id")
            .eq("conference_url", cfp["cfp_url"])
            .execute()
        )
        
        conference_id = None

        if conf_res.data:
            # TRƯỜNG HỢP 1: Tìm thấy bằng URL
            conference_id = conf_res.data[0]["id"]
            print(f"[Tìm thấy bằng URL] Hội nghị đã tồn tại với ID: {conference_id}")
            
            # Cập nhật hạn deadline mới nhất cho bảng conferences
            if cfp["deadline"]:
                (
                    supabase
                    .table("conferences")
                    .update({"submission_deadline": cfp["deadline"]})
                    .eq("id", conference_id)
                    .execute()
                )
        else:
            # TRƯỜNG HỢP 2: Chưa thấy bằng URL, tiến hành Upsert theo Unique Constraint.
            # Nếu trùng lặp cặp (full_name, conference_date), Supabase tự cập nhật bản ghi cũ và trả về ID.
            print(f"[Đồng bộ] Đang xử lý hội nghị vào bảng conferences: {cfp['full_name']}")
            
            new_conf = {
                "full_name": cfp["full_name"],
                "acronym": cfp["acronym"],
                "field": cfp["topics"], 
                "location": cfp["location"],
                "conference_date": cfp["conference_date"],
                "submission_deadline": cfp["deadline"],
                "conference_url": cfp["cfp_url"]
            }
            
            insert_res = (
                supabase
                .table("conferences")
                .upsert(new_conf, on_conflict="full_name,conference_date")
                .execute()
            )
            
            if insert_res.data:
                conference_id = insert_res.data[0]["id"]
                print(f"[Đồng bộ thành công] Đã đồng bộ ID: {conference_id}")

        # Bước 2: Tiến hành Upsert dữ liệu sạch vào bảng cfp
        if conference_id:
            cfp_data_to_save = {
                "title": cfp["full_name"],
                "conference_id": conference_id,
                "journal_id": None,
                "deadline": cfp["deadline"],
                "topics": cfp["topics"],
                "description": cfp["description"],
                "cfp_url": cfp["cfp_url"]
            }
            
            supabase.table("cfp").upsert(cfp_data_to_save, on_conflict="cfp_url").execute()
            print(f"[THÀNH CÔNG] Đã lưu dữ liệu CFP cho: {cfp['full_name']}\n")
        else:
            print(f"[Bỏ qua] Không thể phân tích hoặc cấp conference_id cho {cfp['full_name']}")

    except Exception as e:
        print(f"Lỗi quy trình lưu DB cho {cfp['full_name']}:", e)


# =====================================
# MAIN CONTROL
# =====================================
if __name__ == "__main__":
    # Bắt đầu quét cạn kiệt toàn bộ các trang trên allcfp
    latest_urls = get_latest_cfp_urls()
    print(f"\n=== ĐÃ QUÉT XONG DANH SÁCH ===")
    print(f"Tổng số lượng bài viết CFP tìm thấy: {len(latest_urls)}\n")

    # Duyệt chi tiết từng URL
    for index, url in enumerate(latest_urls, 1):
        try:
            print(f"[{index}/{len(latest_urls)}] Đang xử lý chi tiết bài đăng...")
            cfp_data = parse_cfp_detail(url)
            if cfp_data:
                save_cfp(cfp_data)
            
            # Thời gian ngủ ngẫu nhiên an toàn (3.5 - 5.5 giây) cực kỳ quan trọng khi quét số lượng lớn
            time.sleep(random.uniform(3.5, 5.5))
        except Exception as e:
            print(f"Lỗi khi xử lý URL {url} -> {e}")

    print("DONE")