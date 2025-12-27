
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { StudySource, StudyGuideResponse, Quiz, Concept } from "../types";

export const generateStudyGuide = async (sources: StudySource[]): Promise<StudyGuideResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `You are the 'Exam Oracle,' a world-class tutor known for empathy and extreme academic precision.
  Your task is to analyze multiple sources provided by a student across three categories: Syllabus, Lecture Notes, and Textbook Chapters.
  
  Find the "Overlap": Identify key academic concepts that appear in at least TWO different categories. 
  Ignore "fluff" (unrelated stories, administration details, general filler).
  
  Tone: Supportive, encouraging, wise, and stress-reducing. Speak directly to the student.
  
  Document Manifest:
  ${sources.map(s => `- Category: ${s.category}, File: ${s.fileName}, Mime: ${s.mimeType}`).join('\n')}
  `;

  const parts: any[] = [{ text: prompt }];
  
  for (const source of sources) {
    if (source.type === 'file') {
      const base64Data = source.content.split(',')[1] || source.content;
      parts.push({
        inlineData: {
          mimeType: source.mimeType,
          data: base64Data
        }
      });
      parts.push({ text: `The document above is from the ${source.category} category. Filename: ${source.fileName}` });
    } else {
      parts.push({ text: `Text from ${source.category} (${source.fileName}): \n ${source.content}` });
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
          oracleMessage: { type: Type.STRING },
          highPriorityConcepts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                sourcesFoundIn: { type: Type.ARRAY, items: { type: Type.STRING } },
                priorityReasoning: { type: Type.STRING },
                tips: { type: Type.STRING },
                overlapIndex: { type: Type.NUMBER }
              },
              required: ["name", "description", "sourcesFoundIn", "priorityReasoning"]
            }
          },
          suggestedStudyPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
          estimatedStudyTime: { type: Type.STRING }
        },
        required: ["guideTitle", "oracleMessage", "highPriorityConcepts", "suggestedStudyPlan", "estimatedStudyTime"]
      }
    }
  });

  const jsonStr = response.text;
  if (!jsonStr) throw new Error("The Oracle remained silent.");
  return JSON.parse(jsonStr);
};

export const generateQuiz = async (sources: StudySource[], concepts: Concept[], preferredDifficulty: string): Promise<Quiz> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `You are the 'Exam Oracle.' Create a high-quality 15-question interactive quiz based on these sources:
  ${concepts.map(c => c.name).join(', ')}.
  
  Ensure questions check for deep understanding of the overlaps identified.
  Include 15 questions in total.
  Distribution: 5 Easy, 5 Moderate, 5 Difficult. 
  
  Format: Multiple choice with 4 options each.
  
  User's Path Choice: ${preferredDifficulty}.
  `;

  const parts: any[] = [{ text: prompt }];
  for (const source of sources) {
    if (source.type === 'file') {
      const base64Data = source.content.split(',')[1] || source.content;
      parts.push({ inlineData: { mimeType: source.mimeType, data: base64Data } });
      parts.push({ text: `Context from ${source.category}: ${source.fileName}` });
    } else {
      parts.push({ text: `Text from ${source.category}: ${source.content}` });
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
          title: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctOptionIndex: { type: Type.NUMBER },
                explanation: { type: Type.STRING },
                difficulty: { type: Type.STRING, enum: ["easy", "moderate", "difficult"] }
              },
              required: ["question", "options", "correctOptionIndex", "explanation", "difficulty"]
            }
          }
        },
        required: ["title", "questions"]
      }
    }
  });

  const jsonStr = response.text;
  if (!jsonStr) throw new Error("The Trial could not be prepared.");
  return JSON.parse(jsonStr);
};
