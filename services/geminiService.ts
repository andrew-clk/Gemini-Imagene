
import { GoogleGenAI, Modality, Part } from "@google/genai";

interface ImageData {
    base64Data: string;
    mimeType: string;
}

export const generateImage = async (prompt: string, images: ImageData[]): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API key not found. Please make sure it is set in your environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const imageParts: Part[] = images.map(image => ({
        inlineData: {
            data: image.base64Data,
            mimeType: image.mimeType,
        },
    }));

    const textPart: Part = { text: prompt };

    const allParts: Part[] = [...imageParts, textPart];

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: allParts,
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const candidates = response.candidates;
        if (!candidates || candidates.length === 0) {
            throw new Error("No candidates returned from the API.");
        }

        const candidate = candidates[0];

        if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    return `data:image/png;base64,${base64ImageBytes}`;
                }
            }
        }

        // If no image data was found, or if content/parts were missing, throw an error.
        // Include finishReason if available for better debugging.
        if (candidate.finishReason && candidate.finishReason !== 'STOP') {
            throw new Error(`Image generation failed due to: ${candidate.finishReason}. Your prompt may have been blocked.`);
        }

        throw new Error("No image data found in the API response.");

    } catch (error: any) {
        console.error("Error calling Gemini API:", error);
        throw new Error(`Failed to generate image: ${error.message}`);
    }
};
