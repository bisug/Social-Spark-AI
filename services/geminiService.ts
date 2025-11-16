import { GoogleGenAI, Type } from '@google/genai';
import type { SocialPostTemplate, Tone, AspectRatio } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const textModel = 'gemini-2.5-pro';
const imageModel = 'imagen-4.0-generate-001';

const postSchema = {
  type: Type.OBJECT,
  properties: {
    postText: {
      type: Type.STRING,
      description: 'The main body of a versatile social media post.',
    },
    hashtags: {
      type: Type.STRING,
      description: 'A string of relevant hashtags, separated by spaces (e.g., "#AI #Tech #Innovation").',
    },
    imagePrompt: {
      type: Type.STRING,
      description: 'A detailed, creative prompt for an image generation model to create a visually appealing image that complements the post content.',
    },
  },
  required: ['postText', 'hashtags', 'imagePrompt'],
};

const handleApiError = (error: unknown, context: string): never => {
  console.error(`Error in ${context}:`, error);

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('api key not valid')) {
      throw new Error('Your API Key is invalid. Please check your key and try again.');
    }
    if (message.includes('quota') || message.includes('429')) {
      throw new Error('API Limit Reached. You have exceeded your request limit. Please try again tomorrow or check your plan.');
    }
    if (message.includes('fetch')) {
      throw new Error('A network error occurred. Please check your internet connection and try again.');
    }
     if (message.includes('safety')) {
       throw new Error('The request was blocked for safety reasons. Please adjust your content idea and try again.');
    }
  }
  throw new Error(`An unexpected error occurred during ${context}. Check the console for more details.`);
};


export const generateInitialPost = async (idea: string, tone: Tone): Promise<SocialPostTemplate[]> => {
  const prompt = `
    Based on the following idea, generate an array of 4 distinct and versatile social media post variations.
    The tone of voice must be: ${tone}.

    Idea: "${idea}"

    For each variation, provide:
    1. A unique and engaging post text.
    2. A string of relevant hashtags.
    3. A detailed and creative prompt for an image generation AI to create a compelling visual. The image prompt should be descriptive and artistic.

    Return the output as a single JSON object containing a key "posts" which is an array of post objects that match the provided schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: textModel,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            posts: {
              type: Type.ARRAY,
              items: postSchema,
            },
          },
          required: ['posts'],
        },
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    if (!result.posts || !Array.isArray(result.posts)) {
      throw new Error("Invalid response format from API. Expected a 'posts' array.");
    }
    return result.posts;
  } catch (error) {
    handleApiError(error, 'initial post generation');
  }
};

export const regenerateText = async (idea: string, tone: Tone, originalText: string): Promise<{ postText: string; hashtags: string }> => {
  const prompt = `
    You are an AI assistant helping a user refine a social media post.
    The original idea is: "${idea}"
    The desired tone is: "${tone}"
    The previous post text was: "${originalText}"

    Please generate a new, alternative version for the post text and hashtags.
    Be creative and make it distinct from the previous version. 
    Return a single JSON object with "postText" and "hashtags".
  `;

  try {
    const response = await ai.models.generateContent({
      model: textModel,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            postText: { type: Type.STRING },
            hashtags: { type: Type.STRING },
          },
          required: ['postText', 'hashtags'],
        },
      },
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    handleApiError(error, 'text regeneration');
  }
};


export const regenerateImage = async (postText: string, hashtags: string, aspectRatio: AspectRatio): Promise<{ imagePrompt: string; imageBytes: string }> => {
  const promptForPrompt = `
    Based on the following social media post text and hashtags, create a new, detailed, and artistic prompt for an image generation AI.
    The new prompt should offer a fresh and creative visual interpretation of the content.

    Post Text: "${postText}"
    Hashtags: "${hashtags}"

    Return a single JSON object with the key "imagePrompt".
  `;
  
  let newImagePrompt = '';
  try {
    const response = await ai.models.generateContent({
      model: textModel,
      contents: promptForPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            imagePrompt: { type: Type.STRING },
          },
          required: ['imagePrompt'],
        },
      },
    });
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    newImagePrompt = result.imagePrompt;
    if (!newImagePrompt) {
      throw new Error('The AI failed to generate a new image prompt. Please try again.');
    }
  } catch (error) {
    handleApiError(error, 'image prompt regeneration');
  }
  
  const imageBytes = await generateImage(newImagePrompt, aspectRatio);
  return { imagePrompt: newImagePrompt, imageBytes };
};


export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: imageModel,
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error('No image was generated by the API.');
    }

    return response.generatedImages[0].image.imageBytes;
  } catch (error) {
    handleApiError(error, 'image generation');
  }
};