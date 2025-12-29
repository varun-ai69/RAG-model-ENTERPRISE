const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview"
});

async function askLLM(context, question) {
  const prompt = `
You are an intelligent assistant.

Answer ONLY using the provided context.
If the answer is not present, say:
"I could not find this information in the provided documents."

=====================
CONTEXT:
${context}
=====================

QUESTION:
${question}

ANSWER:
`;

  const result = await model.generateContent(prompt);
  return result.response.text(); 
}

module.exports = { askLLM };
