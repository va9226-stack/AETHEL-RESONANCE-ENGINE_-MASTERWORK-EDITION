
import { GoogleGenAI, Type, Modality as AIModality } from "@google/genai";
import { WitInput, AuthVoid } from "../types";

export const analyzeResonance = async (x: WitInput, y: WitInput): Promise<AuthVoid> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const analysisPrompt = `
    Protocol: AETHEL_RESONANCE_MASTERWORK
    Logic: λx.λy.((x ∩ y) ⊕ ¬(x ∪ y)) [Semantic XNOR]
    
    You are a high-dimensional logic engine. Perform a deep-thinking analysis of the conceptual resonance between:
    Vector X: "${x.data}"
    Vector Y: "${y.data}"
    
    1. Resolve the intersection (x ∩ y) - what they share.
    2. Resolve the negation of the union ¬(x ∪ y) - what they both lack or exclude.
    3. Synthesize the XNOR resonance.
    4. Provide a philosophical "Wit Insight".
    5. Describe a "visualPrompt" for an abstract representation of this specific state.

    CRITICAL: Your final output MUST be ONLY a JSON object. No other text.
  `;

  const analysisResponse = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: analysisPrompt,
    config: {
      tools: [{ googleSearch: {} }],
      thinkingConfig: { thinkingBudget: 4000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          integrity: { type: Type.NUMBER },
          modality: { type: Type.STRING },
          resonanceScore: { type: Type.NUMBER },
          insight: { type: Type.STRING },
          logicCheck: { type: Type.STRING },
          visualPrompt: { type: Type.STRING },
        },
        required: ["integrity", "modality", "resonanceScore", "insight", "logicCheck", "visualPrompt"],
      },
    },
  });

  let authData: AuthVoid;
  try {
    const text = analysisResponse.text.trim();
    // Use a regex to strictly pull JSON out of potential markdown or grounding clutter
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    
    authData = JSON.parse(jsonStr);
    
    const chunks = analysisResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      authData.sources = chunks
        .filter((c: any) => c.web)
        .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));
    }
  } catch (err) {
    console.error("Analysis Parsing Error", err);
    throw new Error("Critical Logic Failure: Synthesis Unstable");
  }

  try {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      }
    }

    const imageAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imageResponse = await imageAi.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: [{ text: `An hyper-detailed, abstract masterwork visualization of conceptual resonance. Prompt: ${authData.visualPrompt}. Style: Ethereal, mathematical, cinematic lighting, 4k.` }]
      },
      config: {
        imageConfig: { aspectRatio: "16:9", imageSize: "1K" }
      }
    });

    const candidate = imageResponse.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          authData.imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }
  } catch (err) { 
    console.warn("Visual generation bypassed", err); 
    if (err instanceof Error && err.message.includes("Requested entity was not found")) {
      // @ts-ignore
      if (window.aistudio) window.aistudio.openSelectKey();
    }
  }

  try {
    const ttsAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const ttsResponse = await ttsAi.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Resonance established. ${authData.insight}` }] }],
      config: {
        responseModalities: [AIModality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });
    const audioData = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioData) authData.audioData = audioData;
  } catch (err) { console.warn("Audio synthesis bypassed", err); }

  return authData;
};
