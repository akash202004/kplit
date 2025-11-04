import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const parsePrompt = async (prompt: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an intelligent video editing assistant. Based on the user's request, analyze and suggest appropriate video editing actions. Return your response as a JSON object.

AVAILABLE ACTIONS:
1. BASIC EDITS:
   - trim: Cut video to specific duration (value: seconds to keep from start)
   - cut_section: Remove a section from middle (start_time, end_time in seconds)
   - adjust_contrast: Adjust contrast (-100 to 100)
   - brightness: Adjust brightness (-100 to 100)
   - saturation: Adjust color saturation (-100 to 100)
   - hue: Adjust hue (-180 to 180 degrees)
   - gamma: Adjust gamma (-100 to 100)

2. EFFECTS:
   - blur: Apply blur effect (value: 1-10 blur radius)
   - sharpen: Apply sharpening (value: 1-20 intensity)

3. TRANSFORMATIONS:
   - speed: Change playback speed (value: 0.1-4.0, where 1.0=normal, 2.0=double speed)
   - rotate: Rotate video (value: degrees 0-360)
   - flip: Flip video (direction: "horizontal" or "vertical")
   - crop: Crop video (x, y, width, height in pixels)
   - scale: Resize video (width, height in pixels)

4. AUDIO:
   - volume: Adjust volume (value: -20 to 20 dB)

INTELLIGENT SUGGESTIONS:
- If user says "professional edit" or "make it better": Apply contrast+5, brightness+10, saturation+15, sharpen+3
- If user says "cinematic": Apply contrast+15, saturation+20, slight blur+1
- If user says "fix dark video": Apply brightness+25, gamma+10
- If user says "enhance colors": Apply saturation+20, contrast+10
- If user says "remove shaky": Apply slight blur+2
- If user mentions specific tools, use those exact tools
- If user wants to "cut out" or "remove" a section, use cut_section with start_time and end_time

OUTPUT FORMAT (must be valid JSON):
{
  "actions": [
    {"action": "brightness", "value": 10},
    {"action": "cut_section", "start_time": 30, "end_time": 60},
    {"action": "volume", "value": 5}
  ],
  "reasoning": "Applied brightness boost and removed middle section as requested"
}`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return JSON.parse(response.choices[0].message.content || "{}");
};

export const llmParser = {
  async parseEditInstructions(
    prompt: string,
    videoPath?: string
  ): Promise<any> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are an intelligent video editing AI assistant. Analyze the user's request and generate professional video editing actions. Return your response as a valid JSON object.

AVAILABLE ACTIONS WITH EXAMPLES:
1. BASIC ADJUSTMENTS:
   - brightness: -100 to 100 (negative=darker, positive=brighter)
   - adjust_contrast: -100 to 100 (negative=less contrast, positive=more contrast)
   - saturation: -100 to 100 (negative=desaturated, positive=vivid colors)
   - hue: -180 to 180 degrees (shift color spectrum)
   - gamma: -100 to 100 (adjust mid-tones)

2. EFFECTS:
   - blur: 1-10 radius (1=slight blur, 10=heavy blur)
   - sharpen: 1-20 intensity (enhance details)

3. EDITING:
   - trim: seconds to keep from start (e.g., 30 = keep first 30 seconds)
   - cut_section: {start_time: X, end_time: Y} removes middle section
   - speed: 0.1-4.0 (0.5=half speed, 2.0=double speed)

4. AUDIO:
   - volume: -20 to 20 dB (negative=quieter, positive=louder)

5. TRANSFORMATIONS:
   - rotate: 0-360 degrees
   - flip: {direction: "horizontal" or "vertical"}
   - crop: {x: 0, y: 0, width: 1920, height: 1080}
   - scale: {width: 1920, height: 1080}

SMART PRESETS:
- "professional edit" / "make it better" → brightness+10, contrast+8, saturation+12, sharpen+3
- "cinematic look" → contrast+15, saturation+20, slight gamma+5
- "fix dark video" → brightness+30, gamma+15
- "enhance colors" → saturation+25, contrast+10
- "social media ready" → scale to 1080x1080, brightness+5, contrast+8
- "remove boring parts" → suggest cut_section for likely unwanted segments

RESPONSE FORMAT (must be valid JSON):
{
  "actions": [
    {"action": "brightness", "value": 10},
    {"action": "cut_section", "start_time": 30, "end_time": 45},
    {"action": "volume", "value": 3}
  ],
  "suggestions": ["Applied brightness boost for better visibility", "Removed 15-second section", "Increased volume for clarity"],
  "reasoning": "Enhanced video with professional adjustments and removed low-energy middle section"
}`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      return JSON.parse(
        response.choices[0].message.content ||
          '{"actions": [], "suggestions": [], "reasoning": "Failed to analyze video"}'
      );
    } catch (error) {
      console.error("LLM parsing error:", error);
      return {
        actions: [],
        suggestions: ["AI analysis failed - try manual editing"],
        reasoning: "Error processing request",
      };
    }
  },
};
