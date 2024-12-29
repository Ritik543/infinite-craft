import { connectToDatabase } from "@/utils/db/connectToDb";
import Elements from "@/utils/db/models/element.model";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const element1 = params.get("element1");
  const element2 = params.get("element2");

  if (!element1 || !element2) {
    return NextResponse.json(
      { erorr: "Missing element1 or element2" },
      { status: 400 }
    );
  }
  await connectToDatabase();
  let isNew = true;
  console.log("Checking if element exists");
  const element = await Elements.find({
    parentElements: [[element1], [element2]],
  });
  if (element.length > 0) {
    isNew = false;
    console.log("Element already exists");
    const randomIndex = Math.floor(Math.random() * element.length);
    console.log(element[randomIndex]);
    return NextResponse.json(
      {
        name: element[randomIndex].name,
        emoji: element[randomIndex].emoji,
        new: isNew,
      },
      { status: 200 }
    );
  }

  // const openai = new OpenAI({
  //   apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
  // });
  const genAI = new GoogleGenerativeAI(
    "AIzaSyCoPdEEmY9r4O0W7z-v6Yvqjfs7_S5PvNI"
  );
  // const chatCompletion = await openai.chat.completions.create({
  //   model: "gpt-3.5-turbo",
  //   messages: [
  //     {
  //       role: "system",
  //       content: `TASK: Combine ${element1} and ${element2} to create a new element. Try to keep the element as simple and realistic as possible and only 1 word if possible as well. If two basic elements are combined, you should prioritize making a new thing out of that, rather than simply combining the words. Example: Earth + Earth = Solar System. You are allowed to use one of the inputs as the output, but only if there are no realistic elements. Two of the same item should output a larger version of that item if applicable. Your response should be the name of the new element and MUST contain one and only one emoji to represent the element. The response should never have less than or more than 1 emoji. Example: Fire + Water = 💨 Steam. Your output should be in json format to be parsed. Format: {new_element: "name", emoji: "emoji"}`,
  //     },
  //   ],
  // });

  const prompt = `
  TASK: Combine the two elements provided below to create a realistic and creative result. 
  The result should be the logical combination of the two inputs, focusing on realism over creativity.
  - Inputs: ${element1} and ${element2}.
  - Rules:
    - If combining two basic elements, prioritize creating a new thing derived from them rather than unrelated combinations.
    - Example combinations:
      - Fire + Water = {"new_element": "Steam", "emoji": "💨"}
      - Fire + Earth = {"new_element": "Lava", "emoji": "🌋"}
      - Water + Air = {"new_element": "Cloud", "emoji": "☁️"}
      - Earth + Water = {"new_element": "Mud", "emoji": "💦"}
    - Only return the result in strict JSON format: {"new_element": "Name", "emoji": "Emoji"}.
  - Inputs: ${element1} + ${element2}.
  Respond only with JSON.
  `;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
  const rawContent = text;

  console.log("Raw Response:", rawContent);

  // Remove backticks, newlines, and parse JSON
  const cleanedContent = rawContent
    .replace(/```json\n|```/g, "") // Remove wrapping code blocks
    .trim();

  const parsedContent = JSON.parse(cleanedContent); // Parse JSON string

  const { new_element, emoji } = parsedContent;

  if (!new_element || !emoji) {
    throw new Error("Incomplete response from Gemini API");
  }
  const newElement = await Elements.create({
    name: new_element,
    emoji: emoji,
    parentElements: [element1, element2],
  });

  return NextResponse.json(
    {
      name: newElement.name,
      emoji: newElement.emoji,
      new: isNew,
    },
    { status: 200 }
  );
}
