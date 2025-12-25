import { MoodState, SupportMode } from "../types";

const OPENROUTER_API_KEY = (import.meta as any).env?.VITE_OPENROUTER_API_KEY as string | undefined;
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
const SITE_NAME = 'MoodDoctor';

// Debug: Log API key status
console.log("[OpenRouterService] API Key:", OPENROUTER_API_KEY ? "✅ Loaded" : "❌ Missing");

export const callOpenRouter = async (
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
    model: string = "deepseek/deepseek-chat"
): Promise<{ mood_state: MoodState; mode: SupportMode; response: string }> => {
    if (!OPENROUTER_API_KEY) {
        throw new Error("OpenRouter API Key is missing");
    }

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

    const systemPrompt = `
    ${SYSTEM_PROMPT_BASE}
    
    You must output your response in JSON format strictly adhering to this schema:
    {
      "mood_state": {
        "dominant_mood": "Happy" | "Sad" | "Anxious" | "Angry" | "Neutral" | "Excited" | "Tired" | "Fearful" | "Frustrated" | "Melancholy",
        "energy_level": "low" | "medium" | "high",
        "stability": "stable" | "unstable" | "fragile",
        "risk_score": 0.0 to 1.0
      },
      "support_mode": "LISTENING" | "CALMING" | "MOTIVATION" | "STABILITY" | "CRISIS_AWARE",
      "message": "Your empathetic response here"
    }

    MODE GUIDELINES:
    ${getModeInstructions('CRISIS_AWARE')}
    ${getModeInstructions('LISTENING')}
    ${getModeInstructions('CALMING')}
    ${getModeInstructions('MOTIVATION')}
    ${getModeInstructions('STABILITY')}
  `;

    // Prepend system prompt
    const fullMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
    ];

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": SITE_URL,
                "X-Title": SITE_NAME,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model,
                messages: fullMessages,
                max_tokens: 500,
                temperature: 0.7,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[OpenRouterService] API Error:", {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`OpenRouter API Error (${response.status}): ${errorText || response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        const coerceSupportMode = (value: unknown): SupportMode => {
            const raw = typeof value === 'string' ? value.toUpperCase() : '';
            if (raw === 'CALMING') return SupportMode.CALMING;
            if (raw === 'MOTIVATION') return SupportMode.MOTIVATION;
            if (raw === 'STABILITY') return SupportMode.STABILITY;
            if (raw === 'CRISIS_AWARE') return SupportMode.CRISIS_AWARE;
            return SupportMode.LISTENING;
        };

        // Parse JSON safely
        try {
            const parsed = JSON.parse(content);
            return {
                mood_state: parsed.mood_state,
                mode: coerceSupportMode(parsed.support_mode),
                response: parsed.message
            };
        } catch (e) {
            console.error("Failed to parse OpenRouter JSON:", content);
            // Fallback
            return {
                mood_state: {
                    dominant_mood: "Neutral",
                    energy_level: "medium",
                    stability: "stable",
                    risk_score: 0
                },
                mode: SupportMode.LISTENING,
                response: content // return raw content if JSON parse fails
            };
        }

    } catch (error: any) {
        console.error("[OpenRouterService] Error:", error);
        console.error("[OpenRouterService] Error details:", {
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};
