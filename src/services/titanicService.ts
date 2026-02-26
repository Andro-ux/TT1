import { GoogleGenAI, Type } from "@google/genai";

const TITANIC_DATA_URL = "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv";

export interface Passenger {
  PassengerId: number;
  Survived: number;
  Pclass: number;
  Name: string;
  Sex: string;
  Age: number | null;
  SibSp: number;
  Parch: number;
  Ticket: string;
  Fare: number;
  Cabin: string | null;
  Embarked: string | null;
}

export async function fetchTitanicData(): Promise<Passenger[]> {
  const response = await fetch(TITANIC_DATA_URL);
  const csvText = await response.text();
  const lines = csvText.split("\n");
  const headers = lines[0].split(",");
  
  return lines.slice(1).filter(line => line.trim() !== "").map(line => {
    // Basic CSV parser (handles simple cases, Titanic CSV is mostly clean)
    // Note: This is a simplified parser for the specific Titanic dataset structure
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    return {
      PassengerId: parseInt(values[0]),
      Survived: parseInt(values[1]),
      Pclass: parseInt(values[2]),
      Name: values[3].replace(/"/g, ""),
      Sex: values[4],
      Age: values[5] ? parseFloat(values[5]) : null,
      SibSp: parseInt(values[6]),
      Parch: parseInt(values[7]),
      Ticket: values[8],
      Fare: parseFloat(values[9]),
      Cabin: values[10] || null,
      Embarked: values[11]?.trim() || null,
    };
  });
}

export const analyzeData = async (query: string, data: Passenger[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  // We provide a summary of the data to the model to help it reason
  const stats = {
    total: data.length,
    survived: data.filter(p => p.Survived === 1).length,
    avgAge: data.reduce((acc, p) => acc + (p.Age || 0), 0) / data.filter(p => p.Age).length,
    classes: Array.from(new Set(data.map(p => p.Pclass))),
    ports: Array.from(new Set(data.map(p => p.Embarked))).filter(Boolean),
  };

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Analyze the Titanic dataset based on this query: "${query}".
    
    Dataset Context:
    - Total Passengers: ${stats.total}
    - Survived: ${stats.survived}
    - Columns: PassengerId, Survived (0/1), Pclass (1/2/3), Name, Sex, Age, SibSp, Parch, Ticket, Fare, Cabin, Embarked (C/Q/S)
    
    Instructions:
    1. Provide a concise, professional text answer.
    2. If the user asks for a visualization or if a chart would be helpful, provide data for a chart.
    3. Return the response in JSON format.

    Response Schema:
    {
      "answer": "string",
      "chart": {
        "type": "bar" | "pie" | "line" | "histogram" | null,
        "title": "string",
        "data": [{"name": "string", "value": number}]
      }
    }`,
    config: {
      responseMimeType: "application/json",
    }
  });

  return JSON.parse(response.text);
};
