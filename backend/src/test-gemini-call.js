const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

// Read the .env file
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.substring(1, value.length - 1);
    env[match[1]] = value;
  }
});

const apiKey = env.GEMINI_API_KEY;
console.log('Testing GEMINI_API_KEY:', apiKey);

if (!apiKey || apiKey.startsWith('YOUR_')) {
  console.log('Error: API key is not configured.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: apiKey });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hello, this is a test.',
    });
    console.log('Success! Response:', response.text);
  } catch (error) {
    console.error('Error calling Gemini API:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

run();
