import os
import time
import random
import requests
import urllib.parse
from datetime import datetime
import pandas as pd
from bs4 import BeautifulSoup

# IMPORT TỪ FILE DB.PY CỦA BẠN
from db import get_supabase

BASE_URL = "http://www.wikicfp.com"
session = requests.Session()

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive"
}

# Khởi tạo Supabase client từ file db.py
supabase_client = get_supabase()

# =====================================================================
# TỪ ĐIỂN ÁNH XẠ ĐẦY ĐỦ VÀ TOÀN VẸN (FULL MAPPING DICTIONARY)
# =====================================================================
FULL_MAPPING = {
    # --- CHUẨN MỚI: DIVISION 46 & CSE ---
    "46": "Information and Computing Sciences (General)",
    "4601": "Applied Computing",
    "4602": "Artificial Intelligence",
    "4603": "Computer Vision and Multimedia Computation",
    "4604": "Cybersecurity and Privacy",
    "4605": "Data Management and Data Science",
    "4606": "Distributed Computing and Systems Software",
    "4607": "Graphics, Augmented Reality and Games",
    "4608": "Human-Centred Computing",
    "4611": "Machine Learning",
    "4612": "Software Engineering",
    "4613": "Theory of Computation",
    "4699": "Other Information and Computing Sciences",
    "CSE": "Computer Systems Engineering",

    # --- CHUẨN CŨ: DIVISION 08 ---
    "08": "Information and Computing Sciences (General)",
    "0801": "Artificial Intelligence and Image Processing",
    "0802": "Computation Theory and Mathematics",
    "0803": "Computer Software",
    "0804": "Data Format",
    "0805": "Distributed Computing",
    "0806": "Information Systems",
    "0807": "Library and Information Studies",
    "0899": "Other Information and Computing Sciences",

    # --- ĐẦU 01 ĐẾN 22: KHOA HỌC KHÁC & LIÊN NGÀNH ---
    "01": "Mathematical Sciences", "0101": "Pure Mathematics", "0102": "Applied Mathematics", "0103": "Numerical and Computational Mathematics", "0104": "Statistics", "0105": "Mathematical Physics", "0199": "Other Mathematical Sciences",
    "02": "Physical Sciences", "0201": "Astronomical and Space Sciences", "0202": "Atomic, Molecular, Nuclear, Particle and Plasma Physics", "0203": "Classical Physics", "0204": "Condensed Matter Physics", "0205": "Optical Physics", "0206": "Quantum Physics", "0299": "Other Physical Sciences",
    "03": "Chemical Sciences", "0301": "Analytical Chemistry", "0302": "Inorganic Chemistry", "0303": "Macromolecular and Materials Chemistry", "0304": "Medicinal and Biomolecular Chemistry", "0305": "Organic Chemistry", "0306": "Physical Chemistry (Incl. Structural)", "0307": "Theoretical and Computational Chemistry", "0399": "Other Chemical Sciences",
    "04": "Earth Sciences", "0401": "Atmospheric Sciences", "0402": "Geochemistry", "0403": "Geology", "0404": "Geophysics", "0405": "Oceanography", "0406": "Physical Geography and Environmental Geoscience", "0499": "Other Earth Sciences",
    "05": "Environmental Sciences", "0501": "Ecological Applications", "0502": "Environmental Science and Management", "0503": "Soil Sciences", "0599": "Other Environmental Sciences",
    "06": "Biological Sciences", "0601": "Biochemistry and Cell Biology", "0602": "Ecology", "0603": "Evolutionary Biology", "0604": "Genetics", "0605": "Microbiology", "0606": "Physiology", "0607": "Plant Biology", "0608": "Zoology", "0699": "Other Biological Sciences",
    "07": "Agricultural and Veterinary Sciences", "0701": "Agriculture, Land and Farm Management", "0702": "Animal Production", "0703": "Crop and Pasture Production", "0704": "Fisheries Sciences", "0705": "Forestry Sciences", "0706": "Horticultural Production", "0707": "Veterinary Sciences", "0799": "Other Agricultural and Veterinary Sciences",
    "09": "Engineering", "0901": "Aerospace Engineering", "0902": "Automotive Engineering", "0903": "Biomedical Engineering", "0904": "Chemical Engineering", "0905": "Civil Engineering", "0906": "Electrical and Electronic Engineering", "0907": "Environmental Engineering", "0908": "Food Sciences", "0909": "Geomatic Engineering", "0910": "Manufacturing Engineering", "0911": "Maritime Engineering", "0912": "Materials Engineering", "0913": "Mechanical Engineering", "0914": "Resources Engineering and Extractive Metallurgy", "0915": "Interdisciplinary Engineering", "0999": "Other Engineering",
    "10": "Technology", "1001": "Agricultural Biotechnology", "1002": "Environmental Biotechnology", "1003": "Industrial Biotechnology", "1004": "Medical Biotechnology", "1005": "Communications Technologies", "1006": "Computer Hardware", "1007": "Nanotechnology", "1099": "Other Technology",
    "11": "Medical and Health Sciences", "1101": "Medical Biochemistry and Metabolomics", "1102": "Cardiovascular Medicine and Haematology", "1103": "Clinical Sciences", "1104": "Complementary and Alternative Medicine", "1105": "Dentistry", "1106": "Human Movement and Sports Science", "1107": "Immunology", "1108": "Medical Microbiology", "1109": "Neurosciences", "1110": "Nursing", "1111": "Nutrition and Dietetics", "1112": "Oncology and Carcinogenesis", "1113": "Ophthalmology and Optometry", "1114": "Paediatrics and Reproductive Medicine", "1115": "Pharmacology and Pharmaceutical Sciences", "1116": "Medical Physiology", "1117": "Public Health and Health Services", "1119": "Other Medical and Health Sciences",
    "12": "Built Environment and Design", "1201": "Architecture", "1202": "Building", "1203": "Design Practice and Management", "1204": "Engineering Design", "1205": "Urban and Regional Planning", "1299": "Other Built Environment and Design",
    "13": "Education", "1301": "Education Systems", "1302": "Curriculum and Pedagogy", "1303": "Specialist Studies in Education", "1399": "Other Education",
    "14": "Economics", "1401": "Economic Theory", "1402": "Applied Economics", "1403": "Econometrics", "1499": "Other Economics",
    "15": "Commerce, Management, Tourism and Services", "1501": "Accounting, Auditing and Accountability", "1502": "Banking, Finance and Investment", "1503": "Business and Management", "1504": "Commercial Services", "1505": "Marketing", "1506": "Tourism", "1507": "Transportation and Freight Services", "1599": "Other Commerce, Management, Tourism and Services",
    "16": "Studies in Human Society", "1601": "Anthropology", "1602": "Criminology", "1603": "Demography", "1604": "Human Geography", "1605": "Policy and Administration", "1606": "Political Science", "1607": "Social Work", "1608": "Sociology", "1699": "Other Studies in Human Society",
    "17": "Psychology and Cognitive Sciences", "1701": "Psychology", "1702": "Cognitive Sciences", "1799": "Other Psychology and Cognitive Sciences",
    "18": "Law and Legal Studies", "1801": "Law", "1802": "Maori Law", "1899": "Other Law and Legal Studies",
    "19": "Studies in Creative Arts and Writing", "1901": "Art Theory and Criticism", "1902": "Film, Television and Digital Media", "1903": "Journalism and Professional Writing", "1904": "Performing Arts and Creative Writing", "1905": "Visual Arts and Crafts", "1999": "Other Studies in Creative Arts and Writing",
    "20": "Language, Communication and Culture", "2001": "Communication and Media Studies", "2002": "Cultural Studies", "2003": "Language Studies", "2004": "Linguistics", "2005": "Literary Studies", "2099": "Other Language, Communication and Culture",
    "21": "History and Archaeology", "2101": "Archaeology", "2102": "Curatorial and Related Studies", "2103": "Historical Studies", "2199": "Other History and Archaeology",
    "22": "Philosophy and Religious Studies", "2201": "Applied Ethics", "2202": "History and Philosophy of Specific Fields", "2203": "Philosophy", "2204": "Religion and Religious Studies", "2205": "Other Philosophy and Religious Studies"
}

def fetch(url, retries=5):
    for i in range(retries):
        try:
            r = session.get(url, headers=headers, timeout=(10, 30))
            if r.status_code == 200:
                return r.text
            elif r.status_code in [403, 429]:
                print(f"\n   [Cảnh báo] WikiCFP chặn tần suất (HTTP {r.status_code}). Đang ngủ chờ 20s...")
                time.sleep(20)
        except Exception as e:
            time.sleep(2 + i)
    return None


def search_all_urls_by_acronym(acronym):
    clean_acronym = str(acronym).strip()
    if not clean_acronym or clean_acronym.lower() == "nan":
        return []

    encoded_query = urllib.parse.quote(clean_acronym)
    search_url = f"{BASE_URL}/cfp/servlet/tool.search?q={encoded_query}&year=t"
    
    html = fetch(search_url)
    if not html:
        return []
        
    soup = BeautifulSoup(html, "html.parser")
    links = soup.find_all("a", href=lambda h: h and "event.showcfp" in h)
    
    found_urls = []
    for link in links:
        official_name = link.get_text(strip=True)
        words = official_name.upper().split()
        
        if clean_acronym.upper() in words or any(clean_acronym.upper() in w for w in words):
            href = link.get("href")
            full_url = BASE_URL + href if href.startswith("/") else BASE_URL + "/" + href
            found_urls.append(full_url)
                
    return list(set(found_urls))


def parse_event_detail(url):
    html = fetch(url)
    if not html:
        return None

    soup = BeautifulSoup(html, "html.parser")
    
    title_tag = soup.find("title")
    full_name = title_tag.text.replace("| WikiCFP", "").strip() if title_tag else "N/A"

    location = None
    submission_deadline = None
    conference_date = None
    field = None
    official_link = None

    # 🎯 ÁP DỤNG LOGIC MỚI: Tìm kiếm link chính thức dựa theo text node "Link:"
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
                
        elif "Submission Deadline" in label:
            date_span = row.find("span", {"property": "v:startDate"})
            if date_span and date_span.get("content"):
                submission_deadline = date_span["content"][:10]

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
                return None
        except:
            return None

    categories = []
    category_links = soup.select("td h5 a[href*='../call?conference=']")
    for a in category_links:
        text = a.get_text(strip=True)
        if text.lower() != "categories" and text:
            categories.append(text)
            
    if categories:
        field = ", ".join(categories)

    return {
        "full_name": full_name,
        "field": field,
        "location": location,
        "submission_deadline": submission_deadline,
        "conference_date": conference_date,
        "official_link": official_link
    }


def save_to_supabase(record):
    try:
        response = supabase_client.table("conferences") \
            .upsert(record, on_conflict="acronym,full_name,rank") \
            .execute()
        return True
    except Exception as e:
        print(f"❌ Lỗi ghi Supabase cho acronym {record['acronym']}: {e}", flush=True)
        return False


def process_sync_core_to_supabase():
    csv_file_path = "app/crawlers/datasets/CORE.csv"
    print(f"📖 Khởi động tiến trình đọc dữ liệu từ tệp: {csv_file_path}...", flush=True)
    
    try:
        df = pd.read_csv(csv_file_path, encoding='utf-8', on_bad_lines='skip', header=None)
    except Exception as e:
        print("❌ Lỗi đọc file CSV:", e, flush=True)
        return

    print(f"🚀 Bắt đầu quét & đồng bộ hóa {len(df)} dòng dữ liệu vào Supabase...\n", flush=True)
    success_count = 0

    for index, row in df.iterrows():
        try:
            core_full_name = row.iloc[1] if len(row) > 1 else "N/A"
            acronym = row.iloc[2] if len(row) > 2 else None
            rank = row.iloc[4] if len(row) > 4 else "Unranked"

            acronym = str(acronym).replace('\r', '').replace('\n', '').strip() if pd.notna(acronym) else ""
            rank = str(rank).replace('\r', '').replace('\n', '').strip() if pd.notna(rank) else "Unranked"
            core_full_name = str(core_full_name).replace('\r', '').replace('\n', '').strip() if pd.notna(core_full_name) else "N/A"

            if not acronym or acronym.lower() == "nan":
                continue

            print("-" * 80, flush=True)
            print(f"🔹 [{index + 1}/{len(df)}] Đang xử lý: '{acronym}' (Rank: {rank})", flush=True)

            core_fields = []
            for col_idx in [6, 7, 8]:
                if len(row) > col_idx and pd.notna(row.iloc[col_idx]):
                    code_str = str(row.iloc[col_idx]).strip()
                    if code_str.isdigit() and len(code_str) > 4:
                        code_str = code_str[:4]
                        
                    mapped_name = FULL_MAPPING.get(code_str)
                    if mapped_name and mapped_name not in core_fields:
                        core_fields.append(mapped_name)
            
            final_field_from_core = ", ".join(core_fields) if core_fields else None
            
            # Tạo sẵn cấu trúc chuỗi fallback chuẩn đồng nhất từ CORE dữ liệu gốc
            clean_name_slug = "".join(core_full_name.split())[:50]
            fallback_unique_url = f"FALLBACK_WIKICFP_{acronym}_{clean_name_slug}"

            event_urls = search_all_urls_by_acronym(acronym)
            
            # -----------------------------------------------------------------
            # TRƯỜNG HỢP 1: KHÔNG TÌM THẤY URL NÀO TRÊN WIKICFP
            # -----------------------------------------------------------------
            if not event_urls:
                conference_record = {
                    "acronym": acronym,
                    "full_name": core_full_name,
                    "field": final_field_from_core,
                    "rank": rank,
                    "location": None,
                    "submission_deadline": None,
                    "conference_date": None,
                    "conference_url": fallback_unique_url,
                    "source_id": None
                }
                if save_to_supabase(conference_record):
                    success_count += 1
                    print(f"   ↳ ⚠️ Không có trên WikiCFP -> Đã đồng bộ bản ghi gốc + Ngành bóc từ CORE.", flush=True)
                    
            # -----------------------------------------------------------------
            # TRƯỜNG HỢP 2: TÌM THẤY LIÊN KẾT TRÊN WIKICFP
            # -----------------------------------------------------------------
            else:
                print(f"   ↳ Tìm thấy {len(event_urls)} liên kết trên WikiCFP.", flush=True)

                for idx, wiki_url in enumerate(event_urls, 1):
                    source_id = None
                    
                    # 🎯 THỰC HIỆN UPSERT VÀO BẢNG SOURCES AN TOÀN TRÁNH TRÙNG LẶP
                    try:
                        source_payload = {
                            "name": f"WikiCFP - {acronym}",
                            "base_url": wiki_url,
                            "source_type": "Conference Call"
                        }
                        source_res = supabase_client.table("sources").upsert(source_payload, on_conflict="base_url").execute()
                        if source_res.data:
                            source_id = source_res.data[0]["id"]
                            print(f"   + Đã kết nối/Cập nhật bảng sources -> Source ID: {source_id}", flush=True)
                    except Exception as e:
                        print(f"   ❌ Thất bại khi upsert vào bảng sources: {e}", flush=True)

                    detail_data = parse_event_detail(wiki_url)
                    if not detail_data:
                        continue

                    # DUY TRÌ ƯU TIÊN WIKICFP TRƯỚC, NẾU TRỐNG/LỖI MỚI FALLBACK VỀ DỮ LIỆU CỦA CORE
                    final_full_name = detail_data["full_name"] if detail_data["full_name"] and detail_data["full_name"] != "N/A" else core_full_name
                    assigned_field = detail_data["field"] if detail_data["field"] else final_field_from_core
                    
                    # Gán url chính thức lấy theo logic tìm kiếm text node mới
                    final_url = detail_data["official_link"] if detail_data["official_link"] else fallback_unique_url

                    conference_record = {
                        "acronym": acronym,
                        "full_name": final_full_name,
                        "field": assigned_field,
                        "rank": rank,
                        "location": detail_data["location"],
                        "submission_deadline": detail_data["submission_deadline"],
                        "conference_date": detail_data["conference_date"],
                        "conference_url": final_url,
                        "source_id": source_id
                    }

                    if save_to_supabase(conference_record):
                        success_count += 1
                        print(f"   ↳ 🎯 Thành công: Đã lưu/Cập nhật Supabase [{idx}] -> {final_full_name[:50]}...", flush=True)
                        print(f"     🔗 Link lưu: {final_url}", flush=True)
                    
                    time.sleep(random.uniform(1.5, 3.0))

        except Exception as row_err:
            print(f"❌ Lỗi nghiêm trọng tại index dòng {index}: {row_err}", flush=True)
            continue

    print("\n" + "=" * 80, flush=True)
    print(f"🎉 HOÀN THÀNH TIẾN TRÌNH! Đã đồng bộ thành công {success_count} bản ghi lên Supabase.", flush=True)
    print("=" * 80, flush=True)


if __name__ == "__main__":
    process_sync_core_to_supabase()