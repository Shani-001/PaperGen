import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { QuestionPaper, Difficulty, BloomLevel, QuestionType } from "../types";

const apiKey = process.env.GEMINI_API_KEY || (import.meta.env.VITE_GEMINI_API_KEY as string) || "";
const ai = new GoogleGenAI({ apiKey });

export async function generateQuestionPaper(params: {
  syllabus: string;
  syllabusFile?: { data: string; mimeType: string };
  referencePapers?: { data: string; mimeType: string }[];
  difficulty: Difficulty;
  bloomLevels: BloomLevel[];
  questionTypes: QuestionType[];
  totalMarks: number;
  numQuestions: number;
  title: string;
  collegeName?: string;
  examType?: string;
  monthYear?: string;
  branch?: string;
  semester?: string;
  subjectCode?: string;
  examDate?: string;
  timeDuration?: string;
  academicYear?: string;
  facultyName?: string;
  classDivSem?: string;
  classTest?: string;
  department?: string;
  sectionsConfig: { name: string; numQuestions: number; marksPerQuestion: number }[];
}): Promise<QuestionPaper> {
  // Use a capable model for initial generation
  const model = "gemini-3-flash-preview";
  
  const sectionsPrompt = params.sectionsConfig.map(s => 
    `- ${s.name}: ${s.numQuestions} questions, ${s.marksPerQuestion} marks each.`
  ).join("\n");

  const prompt = `
    Generate a professional question paper based on the syllabus and reference materials.
    
    Details:
    - Subject: ${params.title}
    - Total Marks: ${params.totalMarks}
    - Difficulty: ${params.difficulty}
    - Bloom's Levels: ${params.bloomLevels.join(", ")}
    - Question Types: ${params.questionTypes.join(", ")}
    
    Structure:
    ${sectionsPrompt}
    
    Requirements:
    - Balanced coverage of syllabus topics.
    - Exact marks distribution.
    - No repeated questions.
    - Tag each question with topic, difficulty, Bloom's level (BT), and Course Outcome (CO).
    - Provide model answers and brief explanations.
    
    Output JSON:
    {
      "title": string,
      "courseOutcomes": string[] (List 6 relevant COs),
      "sections": [
        {
          "name": string,
          "instructions": string,
          "questions": [
            {
              "text": string,
              "options": string[] (for MCQs),
              "correctAnswer": string,
              "explanation": string,
              "marks": number,
              "topic": string,
              "difficulty": string,
              "bloomLevel": string,
              "btLevel": string (e.g. "1,2"),
              "coLevel": string (e.g. "2"),
              "type": string
            }
          ]
        }
      ]
    }
  `;

  const contents: any[] = [{ text: prompt }];
  
  if (params.syllabusFile) {
    contents.push({
      inlineData: params.syllabusFile
    });
  }
  
  if (params.referencePapers) {
    params.referencePapers.forEach(file => {
      contents.push({
        inlineData: file
      });
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: contents }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            courseOutcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  instructions: { type: Type.STRING },
                  questions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswer: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                        marks: { type: Type.NUMBER },
                        topic: { type: Type.STRING },
                        difficulty: { type: Type.STRING },
                        bloomLevel: { type: Type.STRING },
                        btLevel: { type: Type.STRING },
                        coLevel: { type: Type.STRING },
                        type: { type: Type.STRING }
                      },
                      required: ["text", "correctAnswer", "marks", "topic", "difficulty", "bloomLevel", "type", "btLevel", "coLevel"]
                    }
                  }
                },
                required: ["name", "questions"]
              }
            }
          },
          required: ["title", "sections", "courseOutcomes"]
        }
      },
    });

    if (!response.text) {
      throw new Error("Empty response from AI model.");
    }

    const result = JSON.parse(response.text);
    
    // Extract only the necessary paper data, excluding large file objects
    const { syllabusFile: _s, referencePapers: _r, ...paperData } = params;
    
    return {
      ...paperData,
      userId: "", // To be filled by caller
      sections: result.sections,
      courseOutcomes: result.courseOutcomes,
      createdAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("Error in generateQuestionPaper:", error);
    throw new Error(error.message || "Failed to generate question paper.");
  }
}

export async function modifyQuestionPaper(
  currentPaper: QuestionPaper,
  prompt: string
): Promise<QuestionPaper> {
  // Use a faster model for the chatbot assistant to provide quick responses
  const model = "gemini-3.1-flash-lite-preview";
  
  const systemInstruction = `
    Modify the existing question paper based on the request.
    Return the ENTIRE modified question paper object in the same JSON format.
    
    Current Paper:
    ${JSON.stringify(currentPaper, null, 2)}
    
    User Request:
    "${prompt}"
    
    Guidelines:
    - Update marks, questions, difficulty, or metadata as requested.
    - Ensure total marks consistency.
    - Return ONLY the JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: systemInstruction }] }],
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            collegeName: { type: Type.STRING },
            examType: { type: Type.STRING },
            monthYear: { type: Type.STRING },
            branch: { type: Type.STRING },
            semester: { type: Type.STRING },
            subjectCode: { type: Type.STRING },
            examDate: { type: Type.STRING },
            timeDuration: { type: Type.STRING },
            totalMarks: { type: Type.NUMBER },
            numQuestions: { type: Type.NUMBER },
            academicYear: { type: Type.STRING },
            facultyName: { type: Type.STRING },
            classDivSem: { type: Type.STRING },
            classTest: { type: Type.STRING },
            department: { type: Type.STRING },
            courseOutcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  instructions: { type: Type.STRING },
                  questions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswer: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                        marks: { type: Type.NUMBER },
                        topic: { type: Type.STRING },
                        difficulty: { type: Type.STRING },
                        bloomLevel: { type: Type.STRING },
                        btLevel: { type: Type.STRING },
                        coLevel: { type: Type.STRING },
                        type: { type: Type.STRING }
                      },
                      required: ["text", "correctAnswer", "marks", "topic", "difficulty", "bloomLevel", "type", "btLevel", "coLevel"]
                    }
                  }
                },
                required: ["name", "questions"]
              }
            }
          },
          required: ["title", "sections", "totalMarks"]
        }
      },
    });

    if (!response.text) {
      throw new Error("Empty response from AI assistant.");
    }

    const result = JSON.parse(response.text);
    
    return {
      ...currentPaper,
      ...result,
      createdAt: currentPaper.createdAt, // Keep original creation date
    };
  } catch (error: any) {
    console.error("Error in modifyQuestionPaper:", error);
    throw new Error(error.message || "Failed to modify question paper.");
  }
}
