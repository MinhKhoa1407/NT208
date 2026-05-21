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

    publisher_id = publisher_service.get_or_create(publisher_name)

    return {
        "name": row.get("Title"),
        "issn": issn,
        "subject_area": row.get("Areas"),
        "quartile": row.get("SJR Best Quartile"),
        "sjr": clean_float(row.get("SJR")),
        "h_index": clean_int(row.get("H index")),
        "scope": row.get("Categories"),
        "publisher_id": publisher_id,
        "source_id": 1
    }


# ========================
# MAIN LOOP
# ========================
for _, row in df.iterrows():

    try:
        journal = safe_row(row)

        if not journal:
            continue

        batch.append(journal)

        if len(batch) >= BATCH_SIZE:

            supabase.table("journals") \
                .upsert(batch, on_conflict="issn") \
                .execute()

            print(f"Inserted batch: {len(batch)}")

            batch = []
            time.sleep(0.3)

    except Exception as e:
        print("Row error:", e)
        continue


# ========================
# FINAL FLUSH
# ========================
if batch:
    try:
        supabase.table("journals") \
            .upsert(batch, on_conflict="issn") \
            .execute()

        print(f"Inserted final: {len(batch)}")

    except Exception as e:
        print("Final error:", e)

print("DONE")