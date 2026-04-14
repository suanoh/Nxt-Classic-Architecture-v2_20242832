require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "ESG Insight Finder API",
    model: GEMINI_MODEL,
    timestamp: new Date().toISOString()
  });
});

function buildPrompt(company) {
  return `
너는 ESG 분석가이다. 사용자가 입력한 기업명을 바탕으로 ESG 정보를 한국어로 정리해라.

기업명: ${company}

반드시 아래 JSON 형식으로만 응답해라. 마크다운 코드블록은 사용하지 마라.
정보가 확실하지 않은 경우 "공개 자료 기준으로 확인이 필요합니다"라고 표시해라.
허위로 구체적인 수치를 만들어내지 마라.

{
  "company": "기업명",
  "esgOverview": "ESG 개요를 2~4문장으로 설명",
  "carbonTarget": "탄소 감축 목표와 넷제로 방향성을 2~4문장으로 설명",
  "performance": "최근 ESG 또는 탄소 감축 실적을 2~4문장으로 설명",
  "outlook": "향후 전망을 2~4문장으로 설명",
  "plans": "향후 계획 및 목표를 2~4문장으로 설명",
  "caution": "AI 생성 결과이므로 공식 지속가능경영보고서 확인이 필요하다는 주의 문구"
}
`;
}

function extractTextFromGemini(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts.map((part) => part.text || "").join("\n").trim();
}

function safeJsonParse(text, company) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (secondError) {
      return {
        company,
        esgOverview: cleaned || "ESG 분석 결과를 파싱하지 못했습니다.",
        carbonTarget: "응답 형식 오류로 항목을 분리하지 못했습니다.",
        performance: "응답 형식 오류로 항목을 분리하지 못했습니다.",
        outlook: "응답 형식 오류로 항목을 분리하지 못했습니다.",
        plans: "응답 형식 오류로 항목을 분리하지 못했습니다.",
        caution: "AI 생성 결과이므로 공식 자료 확인이 필요합니다."
      };
    }
  }
}

app.post("/api/esg-report", async (req, res) => {
  try {
    const company = String(req.body.company || "").trim();

    if (!company) {
      return res.status(400).json({
        error: "기업명을 입력해주세요."
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: "서버에 GEMINI_API_KEY가 설정되어 있지 않습니다."
      });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const geminiResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: buildPrompt(company)
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json"
        }
      })
    });

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error("Gemini API error:", data);
      return res.status(502).json({
        error: "Gemini API 호출에 실패했습니다.",
        detail: data?.error?.message || "Unknown Gemini API error"
      });
    }

    const generatedText = extractTextFromGemini(data);
    const report = safeJsonParse(generatedText, company);

    res.json({
      ok: true,
      report,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: "서버 내부 오류가 발생했습니다.",
      detail: error.message
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ESG Insight Finder API is running on port ${PORT}`);
});
