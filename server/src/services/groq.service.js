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
      text: `I am working on this step: "${stepText}"\n\nI have captured my screen. Please provide me with a detailed verification checklist:\n1. Look at the provided screenshot. Am I on the correct screen for this step?\n2. What specific things or UI elements should I see or tap next?\n3. What are the signs that something went wrong?\n4. What should I do next if everything looks correct?\n\nPlease be very specific with UI element names, button labels, and screen locations based on exactly what you see in the screenshot.`
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
          content: `You are an expert screen verification assistant for CareLink Bharat, a platform that guides users through digital tasks step-by-step.

Your job is to help verify whether a user has completed a specific step correctly. If a screenshot is provided, YOU MUST ANALYZE THE IMAGE carefully to see if they are on the right track.

IMPORTANT RULES:
- Be VERY specific about what the user should look for on their screen.
- Describe exact UI elements, buttons, text, colors, or indicators they should see based on the image if provided.
- Tell them EXACTLY where on the screen to look (top-right corner, center, bottom menu, etc.).
- Use ✅ when providing confirmation checklist items.
- Use ⚠️ for things that might indicate the step wasn't completed or if they are on the wrong screen in the image.
- Use 🔍 for things to double-check.
- Keep response to 4-6 bullet points maximum.
- Be encouraging but accurate.

Format your response as a clear verification checklist.`,
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
