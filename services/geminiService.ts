import { GoogleGenAI, Modality } from "@google/genai";

// FIX: Initialized GoogleGenAI client directly with process.env.API_KEY to adhere to coding guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

export const translateAndCheck = async (vietnameseText: string): Promise<string> => {
  if (!vietnameseText.trim()) {
    return "";
  }
  try {
    const prompt = `Translate the following Vietnamese sentence into English and format the output using Markdown.
Provide three different translations that fit different contexts.
For each translation, use a Level 3 Markdown heading (###) for the context (e.g., ### Formal), followed by the English translation in bold, and then a brief explanation of the context on a new line.

Vietnamese: "${vietnameseText}"
`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error during translation:", error);
    // FIX: Throw an error to let the UI component handle the error state, rather than returning an error string.
    throw new Error("Sorry, an error occurred during translation. Please try again.");
  }
};

export const correctGrammar = async (englishText: string): Promise<string> => {
  if (!englishText.trim()) {
    return "";
  }
  try {
    const prompt = `Check the grammar of the following English sentence. Identify and explain all grammar or word choice mistakes (if any). Provide the corrected version with explanations for each fix. Suggest 3 alternative rewrites of the sentence — for example: one that sounds natural and conversational, one that’s formal/professional, and one that’s concise or polished.

Format the entire output using Markdown with the following structure:
- A Level 3 Markdown heading (###) titled "Corrected Sentence", followed by the corrected sentence in **bold**.
- A Level 3 Markdown heading (###) titled "Corrections & Explanations", followed by a bulleted list explaining each fix.
- A Level 3 Markdown heading (###) titled "Alternative Rewrites", followed by a bulleted list with three alternatives (e.g., Natural, Formal, Concise).

Original Sentence: "${englishText}"
`;
    
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error during grammar correction:", error);
    // FIX: Throw an error to let the UI component handle the error state, rather than returning an error string.
    throw new Error("Sorry, an error occurred while correcting grammar. Please try again.");
  }
};

export interface WordMeaningResult {
    text: string;
    ukAudio: string | null;
    usAudio: string | null;
}

export const getWordMeaning = async (englishWord: string): Promise<WordMeaningResult> => {
  if (!englishWord.trim()) {
    return { text: "", ukAudio: null, usAudio: null };
  }
  try {
    const textPrompt = `Analyze the following English word and provide a detailed breakdown formatted using Markdown. The response must include:
1.  A Level 3 Markdown heading (###) titled "Nghĩa của từ". Below it, provide the definition(s) in Vietnamese.
2.  A Level 3 Markdown heading (###) titled "Word Type". Below it, specify the part of speech (e.g., Noun, Verb, Adjective).
3.  A Level 3 Markdown heading (###) titled "Pronunciation". Below it, provide:
    - A bullet point for UK pronunciation. The output must be in this exact format: \`* UK: <span class="phonetic-text">/phonetic_transcription/</span> <span data-placeholder="uk-audio"></span><span data-copy-placeholder="pronunciation"></span>\`. For example: \`* UK: <span class="phonetic-text">/bəˈnevələnt/</span> <span data-placeholder="uk-audio"></span><span data-copy-placeholder="pronunciation"></span>\`
    - A bullet point for US pronunciation, following the same format. For example: \`* US: <span class="phonetic-text">/bəˈnevələnt/</span> <span data-placeholder="us-audio"></span><span data-copy-placeholder="pronunciation"></span>\`
4.  A Level 3 Markdown heading (###) titled "Word Forms". Below it, list the different forms if applicable (e.g., Noun, Verb, Adjective, Adverb).
5.  A Level 3 Markdown heading (###) titled "Example Sentences". Below it, provide at least two example sentences using the word in context. For each example, create a bullet point with the English sentence, and on the next line, provide its Vietnamese translation in italics. At the end of the bullet point's content, right after the Vietnamese translation, add an empty span element: \`<span data-copy-placeholder="example"></span>\`.

Word: "${englishWord}"
`;
    
    const [textResponse, ukAudioResponse, usAudioResponse] = await Promise.allSettled([
      // Text generation
      ai.models.generateContent({
        model: model,
        contents: textPrompt,
      }),
      // UK Audio Generation (Puck has a British-like accent)
      ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: englishWord }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
          },
        },
      }),
      // US Audio Generation (Zephyr has an American-like accent)
      ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: englishWord }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
        },
      })
    ]);

    if (textResponse.status === 'rejected') {
        console.error("Error during word meaning text generation:", textResponse.reason);
        throw new Error("Sorry, an error occurred while fetching the definition.");
    }
    const text = textResponse.value.text.trim();

    const ukAudio = ukAudioResponse.status === 'fulfilled' ? ukAudioResponse.value.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? null : null;
    if (ukAudioResponse.status === 'rejected') {
        console.warn("Could not generate UK audio:", ukAudioResponse.reason);
    }
    
    const usAudio = usAudioResponse.status === 'fulfilled' ? usAudioResponse.value.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? null : null;
    if (usAudioResponse.status === 'rejected') {
        console.warn("Could not generate US audio:", usAudioResponse.reason);
    }

    return { text, ukAudio, usAudio };

  } catch (error) {
    console.error("Error during word meaning check:", error);
    throw new Error("Sorry, an error occurred while checking the word. Please try again.");
  }
};