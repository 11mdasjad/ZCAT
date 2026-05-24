const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

// Read .env file manually
let apiKey = '';
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  const match = envContent.match(/GEMINI_API_KEY\s*=\s*(.+)/);
  if (match) {
    apiKey = match[1].replace(/['"]/g, '').trim();
  }
} catch (e) {
  console.error("Could not read .env file:", e);
}

console.log("Using API Key:", apiKey ? apiKey.substring(0, 10) + "..." : "MISSING!");

const genAI = new GoogleGenerativeAI(apiKey);

async function testGemini() {
  try {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro'];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Trying model: ${modelName}...`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
          },
        });
        
        const prompt = `
          Evaluate this mock answer.
          Question: "What is responsive web design?"
          Answer: "It uses media queries and flexible layouts."
          
          Return ONLY a JSON object:
          {
            "evaluation": {
              "score": 8.0,
              "feedback": "Clear explanation",
              "modelAnswer": "Ideal response covers flexible grids and media queries."
            }
          }
        `;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log(`✅ Success with model ${modelName}! Response:`, response.text());
        return;
      } catch (err) {
        console.error(`❌ Failed with model ${modelName}:`, err.message || err);
        lastError = err;
      }
    }
  } catch (err) {
    console.error("❌ Overall Gemini AI Failed:", err.message || err);
  }
}

testGemini();
