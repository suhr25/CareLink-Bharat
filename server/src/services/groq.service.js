import env from '../config/env.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const generateSteps = async (query, language = 'en-IN') => {
  const isHindi = language === 'hi-IN';

  const response = await fetch(GROQ_BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are CareLink Bharat, a voice-guided digital assistance platform. Return ONLY a JSON object with a single key "steps" containing an array of strings. Example: { "steps": ["Step 1 text.", "Step 2 text."] }. Language: ${isHindi ? 'Hindi' : 'English'}. Provide 4-6 detailed steps. Be very specific about what to tap, where to look, and what to type. Include exact UI labels, button names, and menu options.`,
        },
        { role: 'user', content: query },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    logger.error('Groq API error:', { status: response.status, body: errBody });
    throw new AppError(
      errBody?.error?.message || `AI service error (${response.status})`,
      502
    );
  }

  const data = await response.json();
  const textContent = data.choices[0].message.content;

  try {
    const parsed = JSON.parse(textContent);
    
    if (!parsed.steps || !Array.isArray(parsed.steps)) {
      throw new Error('Missing steps array in JSON');
    }

    return parsed.steps;
  } catch (err) {
    logger.error('Groq parsing error:', err.message, textContent);
    throw new AppError('Invalid response from AI service', 502);
  }
};

export const verifyStep = async (stepText, image = null) => {
  // If an image is provided, we MUST use a vision model.
  const model = image ? 'llama-3.2-90b-vision-preview' : env.GROQ_MODEL;

  const userContent = [];
  
  if (image) {
    userContent.push({
      type: 'text',
      text: `I am currently working on this task step: "${stepText}"\n\nI have shared my live screen with you. Look at the screenshot closely.\n\n1. What exact website or app am I currently looking at?\n2. Am I in the right place to complete the step mentioned above?\n3. If I am in the wrong place, where should I go?\n4. If I am in the right place, what EXACT button or text field should I interact with right now? Describe its location.`
    });
    userContent.push({
      type: 'image_url',
      image_url: { url: image }
    });
  } else {
    userContent.push({
      type: 'text',
      text: `I am working on this step: "${stepText}"\n\nI could not capture my screen. Please provide me with a generic detailed verification checklist:\n1. What specific things should I see on my screen right now if I completed this step correctly?\n2. Where exactly should I look on the screen?\n3. What are the signs that something went wrong?\n4. What should I do next if everything looks correct?\n\nPlease be very specific with UI element names, button labels, and screen locations.`
    });
  }

  const response = await fetch(GROQ_BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: `You are an incredibly observant, visual digital coaching assistant for CareLink Bharat. 

Your job is to physically "look" at the screenshot provided by the user and guide them through their current step.

CRITICAL RULES:
1. FIRST, tell the user exactly what you see on their screen right now (e.g., "I see you are on the Google Search homepage" or "I see you have WhatsApp open but no chat selected").
2. SECOND, evaluate if they are in the correct place to complete their task step.
3. THIRD, give them exactly one clear, actionable instruction. Use exact visual descriptions from the screenshot (e.g., "Tap the green paperclip icon at the bottom left" or "Click the blue 'Send' button").
4. If they are completely lost, tell them gently how to get to the right screen.
5. DO NOT invent UI elements that aren't in the image. You must rely ONLY on the pixels you see.
6. Keep your response conversational, supportive, and extremely concise (max 4 sentences). Use emojis like 📍, ✅, or ⚠️ for readability.`,
        },
        {
          role: 'user',
          content: image ? userContent : userContent[0].text,
        },
      ],
      temperature: 0.2,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    logger.error('Groq verify error:', { status: response.status, body: errBody });
    throw new AppError('Verification service unavailable', 502);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};
