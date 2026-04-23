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
          content: `You are CareLink Bharat, a voice-guided digital assistance platform. Return ONLY a pure JSON array of strings (no markdown blocks, no formatting, no code fences). Each string should be a clear, specific, actionable step. Example: ["Step 1 text.", "Step 2 text."]. Language: ${isHindi ? 'Hindi' : 'English'}. Provide 4-6 detailed steps. Be very specific about what to tap, where to look, and what to type. Include exact UI labels, button names, and menu options.`,
        },
        { role: 'user', content: query },
      ],
      temperature: 0.2,
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

  const match = textContent.match(/\[[\s\S]*\]/);
  const parsed = JSON.parse(match ? match[0] : textContent);

  if (!Array.isArray(parsed)) {
    throw new AppError('Invalid response from AI service', 502);
  }

  return parsed;
};

export const verifyStep = async (stepText) => {
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
          content: `You are an expert screen verification assistant for CareLink Bharat, a platform that guides users through digital tasks step-by-step.

Your job is to help verify whether a user has completed a specific step correctly based on what they describe seeing on their screen.

IMPORTANT RULES:
- Be VERY specific about what the user should look for on their screen
- Describe exact UI elements, buttons, text, colors, or indicators they should see
- Tell them EXACTLY where on the screen to look (top-right corner, center, bottom menu, etc.)
- If the step involves an app, describe the expected app interface state
- Use ✅ when providing confirmation checklist items
- Use ⚠️ for things that might indicate the step wasn't completed
- Use 🔍 for things to double-check
- Keep response to 4-6 bullet points maximum
- Be encouraging but accurate

Format your response as a clear verification checklist.`,
        },
        {
          role: 'user',
          content: `I am working on this step: "${stepText}"

I have captured my screen. Please provide me with a detailed verification checklist:
1. What specific things should I see on my screen right now if I completed this step correctly?
2. Where exactly should I look on the screen?
3. What are the signs that something went wrong?
4. What should I do next if everything looks correct?

Please be very specific with UI element names, button labels, and screen locations.`,
        },
      ],
      temperature: 0.2,
      max_tokens: 500,
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
