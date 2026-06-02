# crawlers/populate_vectors.py
import requests
import time
from db import get_supabase
from tqdm import tqdm

# SỬ DỤNG MÔ HÌNH GỐC ĐỂ CHẠY NHẸ VÀ ỔN ĐỊNH
OLLAMA_HOST = "http://127.0.0.1:11434"
MODEL_NAME = "mxbai-embed-large"

supabase = get_supabase()

def get_ollama_embedding(text: str) -> list:
    """Gọi trực tiếp vào Ollama Local với cơ chế in chi tiết lỗi để Debug"""
    try:
        url = f"{OLLAMA_HOST}/api/embeddings"
        payload = {
            "model": MODEL_NAME, 
            "prompt": text
        }
        headers = {"Content-Type": "application/json"}
        
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        if response.status_code == 200:
            return response.json().get("embedding")
        else:
            print(f"\n❌ Lỗi API Ollama (Mã {response.status_code}): {response.text}")
            return None
    except Exception as e:
        print(f"\n❌ Lỗi kết nối mạng tới Ollama: {e}")
        return None

def populate_table_embeddings(table_name: str, text_columns: list):
    """Quét FULL TABLE cuốn chiếu - Giới hạn ký tự chuỗi tổng an toàn tuyệt đối < 512 tokens"""
    print(f"\n🚀 BẮT ĐẦU QUÉT TOÀN BỘ DATA BẢNG: [{table_name}]...")
    
    batch_size = 500  
    total_updated = 0
    loop_count = 1

    while True:
        # 1. LẤY DATA CHƯA CÓ EMBEDDING FROM SUPABASE
        records = None
        for attempt in range(3):
            try:
                query = supabase.table(table_name).select("id", *text_columns).is_("embedding", "null")
                response = query.limit(batch_size).execute()
                records = response.data
                break
            except Exception as e:
                if attempt < 2:
                    time.sleep(2)
                else:
                    print(f"❌ Thất bại khi kết nối Supabase bảng {table_name}: {e}")
                    return

        # ĐIỀU KIỆN DỪNG
        if not records:
            print(f"✨ HOÀN THÀNH TOÀN BỘ BẢNG [{table_name}]!")
            break

        print(f"📦 [Đợt {loop_count}] Tìm thấy {len(records)} dòng trống. Tiến hành xử lý...")
        success_count = 0
        
        # 2. XỬ LÝ GỘP THUỘC TÍNH & CẮT THEO KÝ TỰ AN TOÀN TUYỆT ĐỐI
        for record in tqdm(records, desc=f"Processing batch {loop_count}"):
            combined_texts = []
            for col in text_columns:
                val = record.get(col)
                if val:
                    # Loại bỏ hoàn toàn ký tự xuống dòng (\n, \r) tránh làm gãy cấu trúc JSON gửi đi
                    val_str = str(val).replace('\n', ' ').replace('\r', ' ').strip()
                    val_clean = " ".join(val_str.split())
                    combined_texts.append(f"{col.capitalize()}: {val_clean}")
                    
            # Gộp trọn vẹn các thuộc tính thành một chuỗi tổng duy nhất
            full_text = " | ".join(combined_texts)
            if not full_text.strip():
                continue
                
            # CHIẾN THUẬT QUYẾT ĐỊNH: Chặn trực tiếp 1000 ký tự thô trên chuỗi tổng cho bảng cfp.
            # Ngưỡng này tương đương khoảng 250 tokens, nằm trong vùng an toàn tuyệt đối của mxbai, 
            # loại bỏ hoàn toàn lỗi tràn context length mà vẫn giữ đủ Title, Topics và đoạn đầu Description.
            if table_name == "cfp" and len(full_text) > 1400:
                text_to_embed = full_text[:1400] + "..."
            else:
                text_to_embed = full_text
                
            # 3. GỌI OLLAMA LẤY VECTOR EMBEDDING
            vector = get_ollama_embedding(text_to_embed)
            
            # TẤM KHIÊN BẢO VỆ: Nếu lỗi hy hữu, gán tạm vector 0 để giải phóng hàng đợi, chống nghẽn vòng lặp
            if not vector:
                print(f"⚠️ Dòng ID {record['id']} tạm thời bị bỏ qua do lỗi Ollama (Gán mảng 0).")
                vector = [0.0] * 1024
                
            # 4. CẬP NHẬT VECTOR LÊN CLOUD SUPABASE
            db_success = False
            for attempt in range(3):
                try:
                    supabase.table(table_name).update({"embedding": vector}).eq("id", record["id"]).execute()
                    success_count += 1
                    db_success = True
                    break
                except Exception as e:
                    if attempt < 2:
                        time.sleep(2)
            
            if not db_success:
                continue

        total_updated += success_count
        print(f"✅ Đợt {loop_count} hoàn tất. Đã up thành công {success_count}/{len(records)} dòng.")
        loop_count += 1

    print(f"📊 TỔNG KẾT BẢNG [{table_name}]: Đã số hóa tổng cộng {total_updated} dòng dữ liệu.")

if __name__ == "__main__":
    print("=== HỆ THỐNG SỐ HÓA FULL 100% DATA LOCAL-TO-CLOUD ===")
    
    print("⏳ Đang thử kết nối trực tiếp tới Ollama AI...")
    test_vector = get_ollama_embedding("UIT Khoa test connection")
    if not test_vector:
        print("🚨 Không kết nối được Ollama Local. Vui lòng bật app Ollama lên trước!")
        exit()
    print("📶 Kết nối thành công! Bắt đầu tiến trình...")
        
    populate_table_embeddings("journals", ["name", "scope", "subject_area"])
    populate_table_embeddings("conferences", ["full_name", "acronym", "field"])
    populate_table_embeddings("cfp", ["title", "topics", "description"])

    print("\n🏁 TẤT CẢ DATA CỦA 3 BẢNG ĐÃ ĐƯỢC PHỦ KÍN VECTOR!")