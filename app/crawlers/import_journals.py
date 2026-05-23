import pandas as pd
import time
from db import supabase
from publisher_service import PublisherService

# init service
publisher_service = PublisherService()

# load dataset
df = pd.read_csv(
    "app/crawlers/datasets/scimagojr 2025.csv",
    sep=";"
)

BATCH_SIZE = 50
batch = []


# ========================
# CLEANERS
# ========================
def clean_float(x):
    if pd.isna(x):
        return None
    try:
        # Chuyển đổi dấu phẩy Châu Âu thành dấu chấm thập phân chuẩn SQL
        return float(str(x).replace(",", "."))
    except:
        return None


def clean_int(x):
    if pd.isna(x):
        return None
    try:
        return int(float(x))
    except:
        return None


# ========================
# MAP ROW
# ========================
def safe_row(row):
    issn = row.get("Issn")
    if pd.isna(issn):
        return None

    publisher_name = row.get("Publisher")
    if pd.isna(publisher_name):
        publisher_name = None
    else:
        publisher_name = str(publisher_name).strip()

    # Lấy hoặc tạo mới publisher để lấy ID liên kết khóa ngoại
    publisher_id = publisher_service.get_or_create(publisher_name)

    return {
        "name": row.get("Title"),
        "type": row.get("Type"),                                         # MỚI: journal, book series...
        "issn": str(issn).strip(),
        "global_rank": clean_int(row.get("Rank")),                       # MỚI: Thứ hạng số tuyệt đối toàn cầu
        "sjr": clean_float(row.get("SJR")),
        "quartile": row.get("SJR Best Quartile"),                        # Nhóm hạng chữ Q1 - Q4
        "h_index": clean_int(row.get("H index")),
        "citations_per_doc": clean_float(row.get("Citations / Doc. (2years)")), # THAY THẾ cho impact_factor
        "total_docs_3years": clean_int(row.get("Total Docs. (3years)")), # MỚI: Phục vụ lọc Quy mô tòa soạn
        "open_access": row.get("Open Access"),                           # MỚI: Trạng thái Yes/No phục vụ lọc OA
        "subject_area": row.get("Areas"),                                # Lĩnh vực lớn
        "country": row.get("Country"),                                   # MỚI: Quốc gia xuất bản
        "scope": row.get("Categories"),                                  # Danh mục ngành chi tiết
        "publisher_id": publisher_id,
        "source_id": 1
    }


# ========================
# MAIN LOOP
# ========================
print("🚀 Bắt đầu quá trình nạp dữ liệu SCImago vào Database...")

for _, row in df.iterrows():
    try:
        journal = safe_row(row)

        if not journal:
            continue

        batch.append(journal)

        if len(batch) >= BATCH_SIZE:
            # Thay đổi từ .upsert(..., on_conflict="issn") sang .insert()
            supabase.table("journals").insert(batch).execute()
            print(f"✅ Đã nạp thành công nhóm: {len(batch)} dòng")

            batch = []
            time.sleep(0.1)  # Giảm bớt sleep xuống 0.1s để script chạy nhanh hơn

    except Exception as e:
        print("❌ Lỗi dòng dữ liệu:", e)
        continue


# ========================
# FINAL FLUSH
# ========================
if batch:
    try:
        supabase.table("journals").insert(batch).execute()
        print(f"📦 Đã nạp thành công nhóm cuối cùng: {len(batch)} dòng")
    except Exception as e:
        print("❌ Lỗi nhóm cuối:", e)

print("🎉 HOÀN THÀNH: Toàn bộ dữ liệu tạp chí đã được nạp sạch sẽ!")