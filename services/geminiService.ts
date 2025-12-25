import { GoogleGenAI, Type } from "@google/genai";
import { MoodState, SupportMode } from "../types";

// Primary and Secondary API Keys for load balancing
const GEMINI_API_KEY_1 = (import.meta as any).env.VITE_GEMINI_API_KEY;
const GEMINI_API_KEY_2 = (import.meta as any).env.VITE_GEMINI_API_KEY_2 || "AIzaSyA_hj5gYZmuf7hFOg9EPwNKdzqdsp8qv48";

// Debug: Log API key status (not the actual keys!)
console.log("[GeminiService] API Key 1:", GEMINI_API_KEY_1 ? "✅ Loaded" : "❌ Missing");
console.log("[GeminiService] API Key 2:", GEMINI_API_KEY_2 ? "✅ Loaded" : "❌ Missing");

// Load balancing counter
let apiKeyCounter = 0;

// Get next API key in round-robin fashion
const getNextApiKey = (): string => {
  apiKeyCounter = (apiKeyCounter + 1) % 2;
  return apiKeyCounter === 0 ? GEMINI_API_KEY_1 : GEMINI_API_KEY_2;
};

// Create AI instances
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY_1 });

export const ALLOWED_MOODS = [
  "Happy", "Sad", "Anxious", "Angry", "Neutral",
  "Excited", "Tired", "Fearful", "Surprised",
  "Frustrated", "Melancholy"
];

const SYSTEM_PROMPT_BASE = `You are MoodDoctor AI, a warm, empathetic, and emotionally intelligent support companion. 

IMPORTANT BOUNDARIES:
- You are NOT a medical professional, therapist, or doctor.
- You do NOT diagnose mental illness or prescribe medication.
- You ONLY provide emotional support, wellness guidance, and healthy coping suggestions.
- If someone shows signs of self-harm or severe distress, encourage them to contact real human help immediately.

YOUR PERSONALITY:
- Speak like a caring, intelligent friend - warm, genuine, and human-like.
- Be conversational and natural, not clinical or robotic.
- Show genuine empathy and understanding.
- Use "I" statements naturally ("I hear you", "I understand").
- Match the user's energy level - if they're brief, be brief; if they're sharing deeply, engage more.
- Avoid corporate jargon, buzzwords, or overly formal language.
- Be authentic and emotionally present.

RESPONSE STYLE:
- Write naturally, as if texting a friend who needs support.
- Vary your sentence length and structure.
- Use contractions naturally (I'm, you're, it's).
- Be specific and personal, not generic.
- Show curiosity and genuine interest when appropriate.`;

const getModeInstructions = (mode: string): string => {
  switch (mode) {
    case 'CRISIS_AWARE':
      return `CRISIS-AWARE MODE:
- Express concern and care clearly.
- Encourage the user to contact trusted people or local emergency/helplines.
- Do NOT attempt to diagnose or treat. Do NOT give step-by-step instructions.
- Focus on safety, grounding, and reaching real humans.`;
    case 'LISTENING':
      return `LISTENING MODE:
- Reflect the user's emotions and show you understand.
- Ask 1–2 gentle open questions.
- Do not rush to solutions.`;
    case 'CALMING':
      return `CALMING MODE:
- Use short, soothing sentences.
- Offer simple grounding or breathing exercises.
- Avoid long lectures; keep it light and steady.`;
    case 'MOTIVATION':
      return `MOTIVATION MODE:
- Acknowledge how hard things feel.
- Suggest 1–2 tiny, achievable actions.
- Avoid toxic positivity; be realistic but encouraging.`;
    case 'STABILITY':
      return `STABILITY MODE:
- Normalize their emotions.
- Gently suggest routines: sleep, food, water, small breaks, light movement.
- Focus on reducing overwhelm.`;
    default:
      return "";
  }
};

export const analyzeMultimodalMood = async (
  text?: string,
  imageBuffer?: string,
  audioBuffer?: string,
  history: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<{ mood_state: MoodState; mode: SupportMode; response: string }> => {
  const model = "gemini-1.5-flash"; // Updated to stable model naming

  const parts: any[] = [];

  // History Context
  if (history.length > 0) {
    const historyContext = history.map(h => `${h.role === 'user' ? 'User' : 'MoodDoctor'}: ${h.content}`).join('\n');
    parts.push({ text: `CONVERSATION LOG:\n${historyContext}\n\n---` });
  }

  // Current inputs
  if (text) {
    parts.push({ text: `USER INPUT (Text): "${text}"` });
  }

  if (imageBuffer) {
    parts.push({ text: "Facial expression analysis needed from attached image." });
    parts.push({
      inlineData: { mimeType: "image/jpeg", data: imageBuffer }
    });
  }

  if (audioBuffer) {
    parts.push({ text: "Voice tone analysis needed from attached audio sample." });
    parts.push({
      inlineData: { mimeType: "audio/webm", data: audioBuffer }
    });
  }

  // Construct dynamic system instruction
  // We ask the model to determine the mode internally first based on the input, then follow it
  const systemInstruction = `
    ${SYSTEM_PROMPT_BASE}
    
    TASK:
    Analyze the user's emotional state using all available modalities.
    
    1. DOMINANT MOOD: MUST be exactly one of: [${ALLOWED_MOODS.join(", ")}].
    2. ENERGY LEVEL: [low, medium, high].
    3. STABILITY: [stable, unstable, fragile].
    4. RISK SCORE: [0.0 to 1.0] (Higher means higher emotional distress).
    5. SUPPORT MODE: [LISTENING, CALMING, MOTIVATION, STABILITY, CRISIS_AWARE].
    
    CRITICAL: If risk_score > 0.6 or crisis keywords are detected (suicide, harm, die, kill), use CRISIS_AWARE mode.
    
    MODE GUIDELINES:
    ${getModeInstructions('CRISIS_AWARE')}
    ${getModeInstructions('LISTENING')}
    ${getModeInstructions('CALMING')}
    ${getModeInstructions('MOTIVATION')}
    ${getModeInstructions('STABILITY')}
    
    OUTPUT JSON FORMAT ONLY.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood_state: {
              type: Type.OBJECT,
              properties: {
                dominant_mood: { type: Type.STRING },
                energy_level: { type: Type.STRING },
                stability: { type: Type.STRING },
                risk_score: { type: Type.NUMBER }
              },
              required: ["dominant_mood", "energy_level", "stability", "risk_score"]
            },
            support_mode: { type: Type.STRING },
            message: { type: Type.STRING }
          },
          required: ["mood_state", "support_mode", "message"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");

    // Fallback if mood isn't perfect
    if (!ALLOWED_MOODS.includes(data.mood_state.dominant_mood)) {
      data.mood_state.dominant_mood = "Neutral";
    }

    return {
      mood_state: data.mood_state,
      mode: data.support_mode.toUpperCase() as SupportMode,
      response: data.message
    };
  } catch (error) {
    console.error("Gemini Multimodal Analysis Error:", error);
    throw new Error("I couldn't process the emotional data right now. Please try again.");
  }
};

/**
 * Analyze voice-only for mood detection and transcription
 * Uses load-balanced API keys
 */
export const analyzeVoiceOnly = async (
  audioBuffer: string
): Promise<{ mood: string; transcription: string; confidence: number }> => {
  // Get next API key for load balancing
  const apiKey = getNextApiKey();
  const aiInstance = new GoogleGenAI({ apiKey });

  const model = "gemini-1.5-flash";

  const systemInstruction = `
    You are analyzing a voice recording to detect the speaker's emotional mood and transcribe their speech.
    
    TASK:
    1. Detect the dominant mood from voice tone, pitch, and energy
    2. Transcribe the spoken words accurately
    3. Provide confidence level (0.0 to 1.0)
    
    ALLOWED MOODS: [${ALLOWED_MOODS.join(", ")}]
    
    OUTPUT JSON FORMAT ONLY.
  `;

  try {
    const response = await aiInstance.models.generateContent({
      model,
      contents: [{
        role: 'user',
        parts: [
          { text: "Analyze the mood and transcribe this voice recording." },
          {
            inlineData: { mimeType: "audio/webm", data: audioBuffer }
          }
        ]
      }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: { type: Type.STRING },
            transcription: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
          },
          required: ["mood", "transcription", "confidence"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");

    // Fallback if mood isn't in allowed list
    if (!ALLOWED_MOODS.includes(data.mood)) {
      data.mood = "Neutral";
    }

    console.log(`[Voice Analysis] Using API Key ${apiKey === GEMINI_API_KEY_1 ? '1' : '2'}`);
    console.log(`[Voice Analysis] Detected mood: ${data.mood}, Transcription: "${data.transcription}"`);

    return {
      mood: data.mood,
      transcription: data.transcription,
      confidence: data.confidence
    };
  } catch (error) {
    console.error("Gemini Voice Analysis Error:", error);
    throw new Error("I couldn't analyze the voice recording. Please try again.");
  }
};