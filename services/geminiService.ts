
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { StudySource, StudyGuideResponse, Quiz, Concept } from "../types";

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
      parts.push({ text: `The part above is the ${source.title} (${source.fileName}).` });
    } else {
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
  
  const prompt = `You are the 'Exam Oracle.' Create a high-quality 15-question interactive quiz to test mastery of the following key concepts: 
  ${concepts.map(c => c.name).join(', ')}.
  
  Base the questions strictly on the provided syllabus, notes, and textbook content.
  Include 15 questions in total.
  Distribution: 5 Easy, 5 Moderate, 5 Difficult. 
  Ensure questions are varied (application-based, definition-based, and scenario-based).
  
  Format: Multiple choice with 4 options each.
  
  User's Path Choice: ${preferredDifficulty} (if 'mixed', stick to 5/5/5. If they specifically chose a level, skew 10 questions to that level).
  `;

  const parts: any[] = [{ text: prompt }];
  for (const source of sources) {
    if (source.type === 'file') {
      const base64Data = source.content.split(',')[1] || source.content;
      parts.push({ inlineData: { mimeType: source.mimeType, data: base64Data } });
      parts.push({ text: `Content of ${source.title}.` });
    } else {
      parts.push({ text: `Text of ${source.title}: ${source.content}` });
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
