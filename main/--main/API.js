// 1. 準備你要問 AI 的問題
const prompt = "我想要賺 300 元，請幫我挑選適合的任務";

// 2. 把問題和你的 API Key 寄給 Google (使用 fetch)
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=你的_API_KEY`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }] // 把問題包裝成 Google 規定的格式
    })
});

// 3. 把 Google 回傳的答案解開來用
const data = await response.json();
const aiResult = data.candidates[0].content.parts[0].text;

console.log(aiResult); // 這裡就會印出 AI 幫你安排的結果！
