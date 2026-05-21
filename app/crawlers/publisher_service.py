import pandas as pd
from db import supabase


class PublisherService:

    def __init__(self):
        self.cache = {}
        self._load_cache()

    def _load_cache(self):
        try:
            res = supabase.table("publishers") \
                .select("id, name") \
                .execute()

            if res.data:
                for row in res.data:
                    self.cache[row["name"].lower()] = row["id"]

            print(f"Loaded publishers: {len(self.cache)}")

        except Exception as e:
            print("Load publishers error:", e)

    def get_or_create(self, name):

        # FIX NaN / None
        if name is None or pd.isna(name):
            return None

        name = str(name).strip()
        if not name:
            return None

        key = name.lower()

        # cache hit
        if key in self.cache:
            return self.cache[key]

        # insert new publisher
        try:
            res = supabase.table("publishers").insert({
                "name": name
            }).execute()

            if res.data:
                pub_id = res.data[0]["id"]
                self.cache[key] = pub_id

                print(f"[NEW PUBLISHER] {name} -> {pub_id}")
                return pub_id

        except Exception as e:
            print("Publisher insert error:", e)

        return None