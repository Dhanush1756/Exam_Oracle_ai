
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { StudySource, StudyGuideResponse } from "../types";

export const generateStudyGuide = async (sources: StudySource[]): Promise<StudyGuideResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `You are the 'Exam Oracle,' a world-class tutor known for empathy and extreme academic precision.
  Your task is to analyze three specific sources provided by a struggling student:
  1. A Syllabus
  2. Handwritten Lecture Notes
  3. A Textbook Chapter
  
  Find the "Overlap": Identify key academic concepts that appear in at least TWO of these sources. 
  Ignore "fluff" (unrelated stories, administration details, general filler).
  
  Tone: Supportive, encouraging, wise, and stress-reducing. Speak directly to the student.
  
  Sources provided:
  ${sources.map(s => `- ${s.title} (File: ${s.fileName}, Type: ${s.mimeType})`).join('\n')}
  `;

  // Construct parts for Gemini
  const parts: any[] = [{ text: prompt }];
  
  for (const source of sources) {
    if (source.type === 'file') {
      // For files (Images, PDFs), content is a data URL
      const base64Data = source.content.split(',')[1] || source.content;
      parts.push({
        inlineData: {
          mimeType: source.mimeType,
          data: base64Data
        }
      });
      parts.push({ text: `The part above is the ${source.title} (${source.fileName}).` });
    } else {
      // For plain text files
      parts.push({ text: `Content of ${source.title} (${source.fileName}): \n ${source.content}` });
    }
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          guideTitle: { type: Type.STRING },
          oracleMessage: { type: Type.STRING, description: "A supportive message to reduce anxiety" },
          highPriorityConcepts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                sourcesFoundIn: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "List of sources where this concept was found (e.g. Syllabus, Notes)"
                },
                priorityReasoning: { type: Type.STRING, description: "Why this is high priority based on overlaps" },
                tips: { type: Type.STRING, description: "Short mnemonic or study tip" },
                overlapIndex: { type: Type.NUMBER, description: "Importance score 1-10" }
              },
              required: ["name", "description", "sourcesFoundIn", "priorityReasoning"]
            }
          },
          suggestedStudyPlan: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Step-by-step study sequence"
          },
          estimatedStudyTime: { type: Type.STRING }
        },
        required: ["guideTitle", "oracleMessage", "highPriorityConcepts", "suggestedStudyPlan", "estimatedStudyTime"]
      }
    }
  });

  const jsonStr = response.text;
  if (!jsonStr) throw new Error("The Oracle remained silent. Please try again.");
  
  return JSON.parse(jsonStr);
};
