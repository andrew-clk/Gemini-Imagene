
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

        for (const part of candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                // Assuming PNG output, as it's common for this model. Adjust if needed.
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }

        throw new Error("No image data found in the API response.");
    } catch (error: any) {
        console.error("Error calling Gemini API:", error);
        throw new Error(`Failed to generate image: ${error.message}`);
    }
};
