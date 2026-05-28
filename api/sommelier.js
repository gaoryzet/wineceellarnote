// ============================================================
//  /api/sommelier.js  — Vercel 서버리스 함수
// ============================================================
//  이 파일이 하는 일:
//   - 브라우저(index.html)는 OpenAI 키 없이 이 주소(/api/sommelier)로만 요청을 보냅니다.
//   - 이 함수가 서버에서 몰래 OpenAI 키를 붙여서 진짜 OpenAI에 대신 요청합니다.
//   - 그래서 키가 사용자 브라우저에 절대 노출되지 않습니다. (보안 + CORS 문제 해결)
//
//  ⚠️ 키는 이 파일에 절대 적지 마세요!
//     Vercel 대시보드 → Settings → Environment Variables 에
//     이름: OPENAI_KEY   값: (당신의 새 OpenAI 키)  로 등록하면,
//     아래 process.env.OPENAI_KEY 로 자동으로 불러옵니다.
//     (환경변수를 등록/수정한 뒤에는 반드시 'Redeploy'(재배포) 해야 적용됩니다.)
// ============================================================

export default async function handler(req, res) {
  // 1) POST 요청만 허용 (브라우저가 데이터를 '보내는' 방식)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST 요청만 허용됩니다' });
  }

  // 2) 키가 등록돼 있는지 확인
  const apiKey = process.env.OPENAI_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: '서버에 OPENAI_KEY 환경변수가 설정되지 않았습니다. Vercel 설정을 확인하세요.'
    });
  }

  try {
    // 3) 브라우저가 보낸 내용을 그대로 OpenAI로 전달 (+ 비밀 키 부착)
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify(req.body),
    });

    // 4) OpenAI의 응답을 그대로 브라우저에게 돌려줌 (상태코드 포함)
    const data = await openaiRes.json();
    return res.status(openaiRes.status).json(data);

  } catch (err) {
    // 5) 그 외 예기치 못한 오류
    return res.status(500).json({ error: '서버 오류: ' + err.message });
  }
}
