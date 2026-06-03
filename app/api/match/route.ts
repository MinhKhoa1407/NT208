import { NextResponse } from "next/server";
import { supabase } from "../supabase/index";

const OLLAMA_HOST = "https://cycling-mortally-cobweb.ngrok-free.dev";
const MODEL_NAME = "mxbai-embed-large";

export async function POST(request: Request) {
  try {
    // 🌟 Đón thêm 'limit' và 'threshold' gửi lên từ Client
    const { title, abstract, keywords, type, limit, threshold } = await request.json();

    if (!title || !abstract) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc: Tiêu đề hoặc Tóm tắt" },
        { status: 400 }
      );
    }

    // 🌟 Xử lý fallback an toàn nếu phía frontend không truyền hoặc truyền sai kiểu dữ liệu
    const finalLimit = limit ? parseInt(limit, 10) : 20;
    const finalThreshold = threshold ? parseFloat(threshold) : 0.35;

    const cleanTitle = title.replace(/\n|\r/g, ' ').trim();
    const cleanAbstract = abstract.replace(/\n|\r/g, ' ').trim();
    const cleanKeywords = keywords ? keywords.replace(/\n|\r/g, ' ').trim() : "";

    let textToEmbed = `Title: ${cleanTitle} | Topics: ${cleanKeywords} | Description: ${cleanAbstract}`;
    if (textToEmbed.length > 1800) {
      textToEmbed = textToEmbed.substring(0, 1800) + "...";
    }

    const ollamaResponse = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL_NAME, prompt: textToEmbed }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama Server lỗi! Status: ${ollamaResponse.status}`);
    }

    const ollamaData = await ollamaResponse.json();
    const queryEmbedding = ollamaData.embedding;

    // 🌟 Áp dụng tham số cấu hình động vào RPC Params gửi sang PostgreSQL
    const rpcParams = {
      query_embedding: queryEmbedding,
      match_threshold: finalThreshold, 
      match_count: finalLimit
    };

    let matchedResults = [];
    let rpcError = null;

    switch (type) {
      case "journal":
        const resJournal = await supabase.rpc("match_journals", rpcParams);
        matchedResults = resJournal.data || [];
        rpcError = resJournal.error;
        break;
      case "conference":
        const resConference = await supabase.rpc("match_conferences", rpcParams);
        matchedResults = resConference.data || [];
        rpcError = resConference.error;
        break;
      case "cfp":
        const resCfp = await supabase.rpc("match_cfp", rpcParams);
        matchedResults = resCfp.data || [];
        rpcError = resCfp.error;
        break;
      default:
        return NextResponse.json({ error: "Mục tiêu lọc không hợp lệ." }, { status: 400 });
    }

    if (rpcError) {
      console.error(`❌ Lỗi RPC [${type}]:`, rpcError);
      return NextResponse.json({ error: `Database RPC Error: ${rpcError.message}` }, { status: 500 });
    }

    // 🚀 CHUẨN HÓA DỮ LIỆU TRẢ VỀ CHO FRONTEND (DÙNG CHUNG CẤU TRÚC DTO)
    const normalizedData = matchedResults.map((item: any) => {
      let display_name = "";
      let display_rank = "N/A";
      let display_sub_info = "";
      let url = "#";

      if (type === "journal") {
        display_name = item.name;
        display_rank = item.quartile || "N/A";
        display_sub_info = `SJR: ${item.sjr || "N/A"} | H-Index: ${item.h_index || "N/A"} | Lĩnh vực: ${item.subject_area || "N/A"}`;
        url = item.journal_url || "#";
      } else if (type === "conference") {
        display_name = item.acronym ? `[${item.acronym}] ${item.full_name}` : item.full_name;
        display_rank = item.rank || "N/A";
        display_sub_info = `Lĩnh vực: ${item.field || "N/A"}`;
        url = item.conference_url || "#";
      } else if (type === "cfp") {
        display_name = item.title;
        
        // Định dạng lại ngày deadline tĩnh cho dễ nhìn
        const deadlineDate = item.deadline ? new Date(item.deadline).toLocaleDateString("vi-VN") : "Không giới hạn";
        display_rank = `Hạn nộp: ${deadlineDate}`;
        display_sub_info = `Chủ đề: ${item.topics || "N/A"}`;
        url = item.cfp_url || "#";
      }

      return {
        id: item.id,
        type: type.toUpperCase(),
        display_name,
        display_rank,
        display_sub_info,
        url,
        similarity_score: item.similarity_score ?? 0,
        raw_description: item.description || item.scope || "" 
      };
    });

    return NextResponse.json(normalizedData);

  } catch (error: any) {
    console.error("❌ Lỗi hệ thống Backend:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}