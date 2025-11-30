import { GoogleGenAI } from "@google/genai";
import { AspectRatio, ModelType } from "../types";

/**
 * 1. Refines the user's simple prompt into a detailed image generation prompt.
 */
export const refinePrompt = async (
  theme: string, 
  userInput: string, 
  hasReferenceImage: boolean = false,
  angleValue: string = '',
  variation: string = '' // NEW: Optional variation instruction (e.g. 'Front Side', 'Back Side')
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-2.5-flash"; 
    
    // Check for special themes that enforce specific angles
    let forcedAngleInstruction = angleValue;
    if (theme.includes("selfie") || theme.includes("giant realistic grizzly bear")) {
      forcedAngleInstruction = "Camera Angle: Selfie shot, handheld camera perspective, subject looking at camera. Ensure the giant bear is visible in the background.";
    }

    let promptContent = `You are an expert AI image prompt engineer. 
    Create a detailed, creative, and high-quality image generation prompt based on the following inputs.
    
    Theme: ${theme || "Creative and Artistic"}
    User Request: ${userInput || "A beautiful, random artistic scene"}
    Reference Image Provided: ${hasReferenceImage ? "YES" : "NO"}
    Camera Angle/Composition: ${forcedAngleInstruction || "Best fit for the scene"}
    Variation Instruction: ${variation || "None"}
    
    Rules:
    1. **Reference Image Handling**: 
       - If "Reference Image Provided" is YES, the prompt MUST explicitly instruct to **"keep the character, person, or main subject from the provided reference image"** and blend them into the new design/theme.
       - The goal is to feature the subject from the uploaded image in the new style or setting defined by the Theme.

    2. **Angle Handling**:
       - Integrate the "Camera Angle/Composition" instruction naturally.

    3. **Text Handling**:
       - If the prompt implies any visible text inside the image (e.g., signboards, neon signs, titles, overlays):
         - Explicitly instruct that the text MUST be in **Japanese** (Kanji, Hiragana, or Katakana).
         - Example: "A neon sign that says '未来' in Japanese Kanji".
       - EXCEPTION: If the User Request explicitly asks for text in a specific language, respect that.
       - **Kindle Cover Specific**: If the layout is for a Kindle book cover, strictly ensure the title/text is placed within the safe area and NOT cut off by the edges.
       
    4. **Merchandise/Goods Optimization (pixivFACTORY)**:
       - **CRITICAL**: If the theme ID starts with 'pixiv_', you are creating the **RAW SOURCE IMAGE FILE** for printing, NOT a product photo.
       - **FORBIDDEN WORDS**: Mockup, Product Shot, Realistic Photo of a Mug, Photo of a T-shirt, Handle, Camera Hole, Phone Shape, Room Background, Table.
       - **MANDATORY**: "Flat 2D Artwork", "Texture File", "Seamless Pattern", "Rectangular Canvas", "Isolated Design".

       - **Specific Instructions**:
         - **T-Shirts ('pixiv_tshirt')**: "Vector graphic illustration ONLY. Isolated on a plain background. Do NOT draw the t-shirt itself. Do NOT draw sleeves or collar. Just the graphic art."
         - **Mugs ('pixiv_mug')**: "Rectangular panoramic texture art. Aspect ratio suited for wrapping around a cylinder. Do NOT draw the mug object. Do NOT draw a handle. Just the flat rectangular art."
         - **Phone Cases ('pixiv_phone')**: "Vertical rectangular wallpaper art. Do NOT draw the phone shape. Do NOT draw the camera lens hole. Just the flat background art."
         - **Acrylic Items ('pixiv_acryl', 'pixiv_keyholder')**: "Full body character illustration. Solid white background. Do NOT draw the plastic base or chain. Just the character art."
         - **Dakimakura (Body Pillow)**: 
           - **CRITICAL**: Use the "Variation Instruction".
           - If Variation is "Front Side": Instruct for "Standard standing or lying pose, facing forward, eye contact, cute/handsome expression, FRONT VIEW. Full body, white background."
           - If Variation is "Back Side": Instruct for "REAR VIEW (Back View). Show the BACK of the character. The character is facing AWAY from the viewer. Same hairstyle and outfit as the front view, but seen from behind. Sexy but safe for work."
           - **Consistency Check**: If "Reference Image Provided" is YES and Variation is "Back Side", explicitly instruct: "The provided reference image is the FRONT VIEW of the character. You MUST generate the BACK VIEW (Rear View) of the EXACT SAME character found in the reference image. Match the height, body proportions, hair style, and outfit details perfectly. The pose should be the logical reverse of the front view."
           - **Negative Constraint**: "Do NOT draw the 3D pillow object itself. Do NOT draw a bed or bedroom background. Draw ONLY the flat 2D character illustration design (texture) intended to be printed on the cover. White background."
           - General: "1:3 vertical aspect ratio composition squeezed into the frame, full body character illustration, white or simple background, high resolution details, anime style."
    
    5. The final output prompt itself must be in **English**.
    
    IMPORTANT: Return ONLY the raw English prompt string. Do not use Markdown (no \`\`\` code blocks). Do not add conversational text like "Here is the prompt" or "Absolutely". Start directly with the visual description.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: promptContent,
    });

    let refined = response.text || "";
    
    // Cleanup aggressive chatty prefixes just in case
    // Removes: "Here is...", "Absolutely...", "Sure...", etc.
    refined = refined.replace(/^(Here is|Sure|Absolutely|Certainly|Okay|Great)[^:.]*?(:|\.|,)\s*/i, "");
    refined = refined.replace(/^["']|["']$/g, ""); // Remove surrounding quotes
    refined = refined.replace(/`/g, ""); // Remove backticks
    
    return refined.trim() || `${theme} ${userInput} ${angleValue}`;
  } catch (error) {
    console.error("Error refining prompt:", error);
    return `${theme} ${userInput} ${angleValue}`; 
  }
};

/**
 * 2. Generates the image using Nanobanana (Flash) or Pro
 */
export const generateImage = async (
  prompt: string, 
  aspectRatio: AspectRatio, 
  modelType: ModelType,
  referenceImageBase64?: string | null
): Promise<string | null> => {
  
  let lastError: any = null;
  const maxRetries = 2; // Try up to 2 times to handle transient "chatty" responses

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = modelType === 'pro' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

        let apiAspectRatio: any = aspectRatio;
        let finalPrompt = prompt;

        // Handle special Aspect Ratios
        if (aspectRatio === AspectRatio.Grid3x3) {
          apiAspectRatio = AspectRatio.Square; 
          
          let gridInstruction = "Create a 3x3 grid collage of 9 completely DIFFERENT and UNIQUE variations.";
          
          if (prompt.toLowerCase().includes("sticker") || prompt.toLowerCase().includes("line stamp")) {
              gridInstruction += " Each of the 9 panels MUST show a different emotion, greeting, or pose (e.g., Happy, Sad, OK, Thanks, Love, Surprise, Sleeping, Angry, Hello). Do NOT repeat the same pose or expression.";
          } else {
              gridInstruction += " Ensure each of the 9 panels shows a distinct angle, pose, or detail. Avoid repetitive patterns.";
          }

          finalPrompt = `${prompt} \n\n[LAYOUT INSTRUCTION: ${gridInstruction} Seamless grid, zero padding, NO WHITE BORDERS between panels. The images should touch each other directly without gaps. High quality, detailed.]`;
        } else if (aspectRatio === AspectRatio.XHeader) {
          apiAspectRatio = AspectRatio.Wide;
          finalPrompt = `${prompt} \n\n[LAYOUT INSTRUCTION: Ultra-wide panoramic composition intended for a 3:1 aspect ratio X (Twitter) header. Center the main subject and vital visual elements in the middle horizontal band of the 16:9 image. The top and bottom areas are merely background and will be cropped. High resolution.]`;
        } else if (aspectRatio === AspectRatio.Kindle) {
          apiAspectRatio = AspectRatio.Tall;
          finalPrompt = `${prompt} \n\n[LAYOUT INSTRUCTION: Vertical book cover design, 1:1.6 ratio, bold typography space at top or bottom, high contrast, professional ebook cover style. CRITICAL: Ensure main title text is fully visible within the safe area and NOT cut off by the edges.]`;
        }

        const config: any = {
          imageConfig: {
            aspectRatio: apiAspectRatio,
          }
        };

        if (modelType === 'pro') {
          config.imageConfig.imageSize = '1K';
        }

        const parts: any[] = [];

        if (referenceImageBase64) {
          const base64Data = referenceImageBase64.split(',')[1] || referenceImageBase64;
          const mimeType = referenceImageBase64.split(';')[0].split(':')[1] || 'image/png';
          parts.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          });
        }

        parts.push({ text: finalPrompt });

        const response = await ai.models.generateContent({
          model: model,
          contents: { parts: parts },
          config: config
        });

        let textOutput = '';
        
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                // Priority: Return image if found
                if (part.inlineData) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
                // Collect text if found
                if (part.text) {
                    textOutput += part.text;
                }
            }
        }
        
        // If no image was found, check if there was a refusal reason or text output
        if (textOutput) {
            console.warn(`Attempt ${attempt}: Gemini returned text instead of image:`, textOutput.substring(0, 100));
            
            // If it's the last attempt, fail with the text reason
            if (attempt === maxRetries) {
                const reason = textOutput.length > 150 ? textOutput.substring(0, 150) + "..." : textOutput;
                throw new Error(`生成失敗: AIが画像を生成できませんでした (Safety/Refusal)。\n理由: "${reason}"`);
            }
            
            // Otherwise, retry (continue loop)
            continue;
        }

        if (response.candidates?.[0]?.finishReason) {
            const reason = response.candidates[0].finishReason;
            if (reason !== 'STOP') {
                if (attempt === maxRetries) {
                    throw new Error(`生成中断: 理由=${reason} (Safety blocked?)`);
                }
                // Retry if simple stop
                continue;
            }
        }

        // If completely empty response
        if (attempt === maxRetries) {
            throw new Error("生成失敗: データが空です。");
        }

      } catch (error: any) {
        lastError = error;
        // Do not retry on permission/auth errors
        if (error.message && (error.message.includes("permission") || error.message.includes("403") || error.message.includes("API key"))) {
             throw error;
        }
        
        console.error(`Attempt ${attempt} error:`, error);
        
        if (attempt === maxRetries) throw error;
        
        // Backoff before retry
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
  }

  throw lastError || new Error("Image generation failed after retries.");
};

export const generateSocialText = async (prompt: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-2.5-flash";
    const instruction = `
      You are a social media manager for an AI art account "Nanobanana Magic".
      Write a short, exciting, and viral post for X (Twitter) about an image generated with this prompt: "${prompt}".
      
      Goal: Encourage others to "Remix" or "Relay" this creation. Make it sound like a challenge or a trend starting.
      
      Rules:
      - Language: Primarily **Japanese**.
      - Tone: Excited, creative, stylish, inviting.
      - Length: Under 100 characters (leave room for hashtags).
      - Keywords to use occasionally: "リレー", "バトン", "挑戦者求む", "Remix".
      - Do NOT include image URL.
      - **ALWAYS** include hashtags: #NanobananaMagic #NanobananaRelay #AIart
      - **ALWAYS** include mention: @wagachanmini
      - **CRITICAL**: The mention @wagachanmini MUST be placed at the very end.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: instruction,
    });

    return response.text || "AIで画像生成リレー開始！君も続く？ #NanobananaMagic #NanobananaRelay @wagachanmini";
  } catch (error) {
    return "AIで画像生成リレー開始！ #NanobananaMagic #NanobananaRelay @wagachanmini";
  }
};
