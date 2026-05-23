import time
import random
import requests
from datetime import datetime
from bs4 import BeautifulSoup
from db import get_supabase

BASE_URL = "http://www.wikicfp.com"

supabase = get_supabase()
session = requests.Session()  # Tối ưu kết nối mạng liên tục

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive"
}

print("Connected to Supabase Client.")

def extract_official_link(soup):
    """Trích xuất Link Website chính thức trực tiếp từ Soup HTML của trang chi tiết WikiCFP"""
    try:
        link_text_node = soup.find(string=lambda t: t and "Link:" in t)
        if link_text_node:
            a_tag = link_text_node.find_next("a")
            if a_tag and a_tag.get("href"):
                return a_tag["href"].strip()
        return None
    except Exception as e:
        print(f"   ⚠️ Lỗi khi trích xuất link chính thức từ HTML: {e}")
        return None

# =========================
# FETCH WITH RETRY
# =========================
def fetch(url, retries=5):
    for i in range(retries):
        try:
            r = session.get(url, headers=headers, timeout=(10, 30))
            print(f"[HTTP {r.status_code}] {url}")
            if r.status_code == 200:
                return r.text
            time.sleep(2 + i)
        except Exception as e:
            print(f"[Fetch error] {url} ({i+1}) -> {e}")
            time.sleep(2 + i)
    return None

# =========================
# STEP 1: SERIES
# =========================
def crawl_series(letter="A"):
    url = f"{BASE_URL}/cfp/series?t=c&i={letter}"
    html = fetch(url)
    if not html:
        return []

    soup = BeautifulSoup(html, "html.parser")
    links = []
    seen = set()

    for a in soup.select("a[href*='/cfp/program?id=']"):
        href = a.get("href")
        if not href:
            continue
        full_url = BASE_URL + href
        if full_url not in seen:
            seen.add(full_url)
            links.append(full_url)

    print(f"Found {len(links)} series for {letter}")
    return links

# =========================
# STEP 2: PROGRAM -> EVENTS
# =========================
def crawl_program(url):
    html = fetch(url)
    if not html:
        return []

    soup = BeautifulSoup(html, "html.parser")
    events = []
    seen = set()

    current_year = datetime.now().year
    min_year = current_year - 2

    rows = soup.find_all("tr")
    for row in rows:
        a = row.find("a", href=lambda h: h and "event.showcfp" in h)
        if not a:
            continue

        href = a.get("href")
        full_url = BASE_URL + href

        row_text = row.get_text(" ", strip=True)
        year_found = None
        for y in range(current_year + 1, current_year - 20, -1):
            if str(y) in row_text:
                year_found = y
                break

        if year_found and year_found < min_year:
            continue

        if full_url not in seen:
            seen.add(full_url)
            events.append(full_url)

    print(f"{len(events)} recent events from {url}")
    return events

# =========================
# STEP 3: PARSE EVENT
# =========================
def parse_event(url):
    html = fetch(url)
    if not html:
        return None

    soup = BeautifulSoup(html, "html.parser")

    # Full Name
    title = soup.find("title")
    full_name = None
    if title:
        full_name = title.text.replace("| WikiCFP", "").strip()

    # Acronym
    acronym = None
    if full_name:
        acronym = full_name.split(":")[0].strip()

    # Location & Deadlines
    location = None
    submission_deadline = None
    conference_date = None

    # Where
    for row in soup.find_all("tr"):
        th = row.find("th")
        if not th:
            continue
        if "Where" in th.get_text(strip=True):
            td = row.find("td")
            if td:
                location = td.get_text(strip=True)
            break

    # Submission Deadline
    for row in soup.find_all("tr"):
        th = row.find("th")
        if not th:
            continue
        if "Submission Deadline" in th.get_text(strip=True):
            date_span = row.find("span", {"property": "v:startDate"})
            if date_span and date_span.get("content"):
                submission_deadline = date_span["content"][:10]
            break

    # Conference Date
    event_block = soup.find("span", {"typeof": "v:Event"})
    if event_block:
        start_span = event_block.find("span", {"property": "v:startDate"})
        if start_span and start_span.get("content"):
            conference_date = start_span["content"][:10]

    if conference_date:
        try:
            conf_year = int(conference_date[:4])
            current_year = datetime.now().year
            if conf_year < current_year - 2:
                print(f"Skip old conf: {conference_date} | {full_name}")
                return None
        except:
            return None

    # Categories
    field = None
    categories = []
    category_links = soup.select("td h5 a[href*='../call?conference=']")
    for a in category_links:
        text = a.get_text(strip=True)
        if text.lower() == "categories":
            continue
        if text:
            categories.append(text)
    if categories:
        field = ", ".join(categories)

    # 🎯 ĐOẠN SỬA LẠI URL CHÍNH THỨC:
    # Lấy link Website chính thức từ chính soup đang có sẵn của trang hiện tại luôn
    official_url = extract_official_link(soup)

    return {
        "full_name": full_name,
        "acronym": acronym,
        "field": field,
        "location": location,
        "submission_deadline": submission_deadline,
        "conference_date": conference_date,
        "official_url_scraped": official_url  # Trả về tạm thời link cào được để xử lý lưu DB
    }

# =========================
# MAIN EXECUTION
# =========================
if __name__ == "__main__":
    for letter in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
        print(f"\n========== LETTER {letter} ==========")
        series_urls = crawl_series(letter)

        for s_url in series_urls:
            try:
                event_urls = crawl_program(s_url)

                for e_url in event_urls:
                    # 🎯 CHECK TRÙNG AN TOÀN: Kiểm tra xem link WikiCFP gốc (e_url) đã tồn tại trong bảng sources chưa
                    check_src = supabase.table("sources").select("id").eq("base_url", e_url).execute()
                    
                    if check_src.data:
                        print(f"   ⏩ Link WikiCFP này đã được cào từ trước: {e_url}. BỎ QUA THẲNG!")
                        continue

                    # Nếu CHƯA CÓ -> Tiến hành cào chi tiết trang Event
                    print(f"   🔥 Phát hiện Event mới, tiến hành tải trang: {e_url}")
                    conf = parse_event(e_url)

                    if conf and conf["full_name"]:
                        acronym = conf["acronym"] or "CONF"
                        source_id = None

                        # 1. Đồng bộ và lưu dữ liệu vào bảng sources trước để lấy source_id
                        try:
                            source_payload = {
                                "name": f"WikiCFP - {acronym}",
                                "base_url": e_url,
                                "source_type": "Conference Call"
                            }
                            source_res = supabase.table("sources").upsert(source_payload, on_conflict="base_url").execute()
                            if source_res.data:
                                source_id = source_res.data[0]["id"]
                                print(f"   + Đã tạo nguồn thành công bảng sources -> Source ID: {source_id}")
                        except Exception as src_err:
                            print(f"   ❌ Lỗi sync dữ liệu vào bảng sources: {src_err}")

                        # 2. Xử lý chuẩn hóa trường conference_url cho bảng conferences
                        # Lấy link chính thức ra, nếu trống thì tạo link FALLBACK bằng chính ID của bản ghi sources mới tạo
                        scraped_url = conf.pop("official_url_scraped")  # Lấy ra đồng thời xóa key tạm này khỏi payload
                        
                        if scraped_url:
                            conf["conference_url"] = scraped_url
                            print(f"   + 🎯 Đã lấy được link Website chính thức: {scraped_url}")
                        else:
                            # Nếu không tìm thấy link web, dùng fallback dựa trên source_id vừa sinh
                            fallback_id = source_id if source_id else random.randint(100000, 999999)
                            conf["conference_url"] = f"FALLBACK_OFFICIAL_CONF_{fallback_id}"
                            print(f"   + ⚠️ Không có website riêng, gán fallback: {conf['conference_url']}")

                        if source_id:
                            conf["source_id"] = source_id

                        # 3. Tiến hành Insert dòng mới vào bảng conferences
                        try:
                            supabase.table("conferences").insert(conf).execute()
                            print(f"   ✅ Đã lưu thành công hội nghị mới: {conf['conference_date']} | {conf['full_name']}")
                        except Exception as db_err:
                            print(f"   ❌ Thất bại khi lưu vào bảng conferences: {db_err}")

                        # Giãn cách thời gian chống bị chặn (chỉ ngủ khi thực sự gửi request tải trang chi tiết)
                        time.sleep(random.uniform(2.0, 4.0))

                print("Done program:", s_url)
            except Exception as e:
                print("Program error:", s_url, e)

    print("Finished All Letters!")