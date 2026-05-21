import time
import random
import requests

from datetime import datetime

from bs4 import BeautifulSoup
from db import get_supabase

BASE_URL = "http://www.wikicfp.com"

supabase = get_supabase()

headers = {
    "User-Agent": (
        "Mozilla/5.0 "
        "(Windows NT 10.0; Win64; x64) "
        "Chrome/122.0"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive"
}

print("Connected")


# =========================
# FETCH WITH RETRY
# =========================
def fetch(url, retries=5):

    for i in range(retries):

        try:

            r = requests.get(
                url,
                headers=headers,
                timeout=(10, 30)
            )

            print(
                f"[HTTP {r.status_code}] {url}"
            )

            if r.status_code == 200:
                return r.text

            time.sleep(2 + i)

        except Exception as e:

            print(
                f"[Fetch error] "
                f"{url} ({i+1}) -> {e}"
            )

            time.sleep(2 + i)

    return None


# =========================
# STEP 1: SERIES
# =========================
def crawl_series(letter="A"):

    url = (
        f"{BASE_URL}/cfp/series?t=c&i={letter}"
    )

    html = fetch(url)

    if not html:
        return []

    soup = BeautifulSoup(
        html,
        "html.parser"
    )

    links = []
    seen = set()

    # giữ nguyên thứ tự HTML
    for a in soup.select(
        "a[href*='/cfp/program?id=']"
    ):

        href = a.get("href")

        if not href:
            continue

        full_url = BASE_URL + href

        if full_url not in seen:

            seen.add(full_url)
            links.append(full_url)

    print(
        f"Found {len(links)} "
        f"series for {letter}"
    )

    return links


# =========================
# STEP 2: PROGRAM -> EVENTS
# chỉ lấy conf 3 năm gần nhất
# NGAY tại trang program
# =========================
def crawl_program(url):

    html = fetch(url)

    if not html:
        return []

    soup = BeautifulSoup(
        html,
        "html.parser"
    )

    events = []
    seen = set()

    current_year = datetime.now().year
    min_year = current_year - 2

    rows = soup.find_all("tr")

    for row in rows:

        # -------------------------
        # tìm event link
        # -------------------------
        a = row.find(
            "a",
            href=lambda h:
                h and "event.showcfp" in h
        )

        if not a:
            continue

        href = a.get("href")

        full_url = BASE_URL + href

        # -------------------------
        # lấy year từ row text
        # -------------------------
        row_text = row.get_text(
            " ",
            strip=True
        )

        year_found = None

        for y in range(
            current_year + 1,
            current_year - 20,
            -1
        ):

            if str(y) in row_text:

                year_found = y
                break

        # -------------------------
        # bỏ conf cũ sớm
        # -------------------------
        if (
            year_found and
            year_found < min_year
        ):

            continue

        if full_url not in seen:

            seen.add(full_url)
            events.append(full_url)

    print(
        f"{len(events)} recent events "
        f"from {url}"
    )

    return events


# =========================
# STEP 3: PARSE EVENT
# =========================
def parse_event(url):

    html = fetch(url)

    if not html:
        return None

    soup = BeautifulSoup(
        html,
        "html.parser"
    )

    # =========================
    # FULL NAME
    # =========================
    title = soup.find("title")

    full_name = None

    if title:

        full_name = (
            title.text
            .replace("| WikiCFP", "")
            .strip()
        )

    # =========================
    # ACRONYM
    # =========================
    acronym = None

    if full_name:

        acronym = (
            full_name
            .split(":")[0]
            .strip()
        )

    # =========================
    # LOCATION
    # =========================
    location = None

    # =========================
    # SUBMISSION DEADLINE
    # =========================
    submission_deadline = None

    # =========================
    # CONFERENCE DATE
    # =========================
    conference_date = None

    # -------------------------
    # WHERE
    # -------------------------
    for row in soup.find_all("tr"):

        th = row.find("th")

        if not th:
            continue

        label = th.get_text(strip=True)

        if "Where" in label:

            td = row.find("td")

            if td:
                location = td.get_text(
                    strip=True
                )

            break

    # -------------------------
    # SUBMISSION DEADLINE
    # -------------------------
    for row in soup.find_all("tr"):

        th = row.find("th")

        if not th:
            continue

        label = th.get_text(strip=True)

        if "Submission Deadline" in label:

            date_span = row.find(
                "span",
                {
                    "property":
                    "v:startDate"
                }
            )

            if (
                date_span and
                date_span.get("content")
            ):

                submission_deadline = (
                    date_span["content"][:10]
                )

            break

    # -------------------------
    # CONFERENCE DATE
    # lấy đúng startDate
    # của Event
    # -------------------------
    event_block = soup.find(
        "span",
        {
            "typeof": "v:Event"
        }
    )

    if event_block:

        start_span = event_block.find(
            "span",
            {
                "property":
                "v:startDate"
            }
        )

        if (
            start_span and
            start_span.get("content")
        ):

            conference_date = (
                start_span["content"][:10]
            )

    # =========================
    # FILTER 3 NĂM GẦN NHẤT
    # phòng trường hợp lọt
    # =========================
    if conference_date:

        try:

            conf_year = int(
                conference_date[:4]
            )

            current_year = (
                datetime.now().year
            )

            if conf_year < current_year - 2:

                print(
                    f"Skip old conf: "
                    f"{conference_date} "
                    f"| {full_name}"
                )

                return None

        except:
            return None

    # =========================
    # FIELD / CATEGORIES
    # =========================
    field = None

    categories = []

    category_links = soup.select(
        "td h5 a[href*='../call?conference=']"
    )

    for a in category_links:

        text = a.get_text(strip=True)

        if text.lower() == "categories":
            continue

        if text:
            categories.append(text)

    if categories:

        field = ", ".join(categories)

    return {
        "full_name": full_name,
        "acronym": acronym,
        "field": field,
        "location": location,
        "submission_deadline":
            submission_deadline,
        "conference_date":
            conference_date,
        "conference_url": url
    }


# =========================
# STEP 4: SAVE
# =========================
def save_conf(conf):

    try:

        supabase.table(
            "conferences"
        ).upsert(
            conf,
            on_conflict="conference_url"
        ).execute()

        print(
            "Saved:",
            conf["conference_date"],
            "|",
            conf["full_name"]
        )

    except Exception as e:

        print("Insert error:", e)


# =========================
# MAIN
# =========================
if __name__ == "__main__":

    for letter in (
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    ):

        print(
            f"\n========== "
            f"LETTER {letter} "
            f"=========="
        )

        series_urls = crawl_series(letter)

        for s_url in series_urls:

            try:

                event_urls = crawl_program(
                    s_url
                )

                for e_url in event_urls:

                    conf = parse_event(
                        e_url
                    )

                    if (
                        conf and
                        conf["full_name"]
                    ):

                        save_conf(conf)

                    # tránh bị block
                    time.sleep(
                        random.uniform(
                            2.0,
                            4.0
                        )
                    )

                print(
                    "Done program:",
                    s_url
                )

            except Exception as e:

                print(
                    "Program error:",
                    s_url,
                    e
                )

    print("Finished")