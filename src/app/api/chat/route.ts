import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { messages, apiKey, model = "gemini-2.5-pro", mode } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required. Configure it in Settings > API Keys." },
        { status: 401 }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request payload. Non-empty 'messages' array is required." },
        { status: 400 }
      );
    }

    if (messages.length > 100) {
      return NextResponse.json(
        { error: "Conversation history exceeds maximum bound of 100 messages." },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || typeof lastMessage.text !== "string" || !lastMessage.text.trim()) {
      return NextResponse.json(
        { error: "Prompt message text is required." },
        { status: 400 }
      );
    }

    if (lastMessage.text.length > 50000) {
      return NextResponse.json(
        { error: "Prompt text exceeds maximum limit of 50,000 characters." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format messages for @google/genai
    // The gemini API expects a history and then we call sendMessage
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    // System instruction is set depending on mode (optional for now, can be expanded)
    let systemInstruction = "You are DirtyNest Cyber-Intelligence Core, a high-performance terminal AI with full system observability, devtool mastery, and defensive cybersecurity capabilities.";
    if (mode === "reasoning") {
      systemInstruction += " You are in DEEP REASONING mode. Prioritize logic, constraints, and structured planning before outputting a solution.";
    }

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction,
        temperature: mode === "reasoning" ? 0.2 : 0.7,
      },
      history,
    });

    // Start streaming the response
    const responseStream = await chat.sendMessageStream(lastMessage.text);

    // Create a ReadableStream to pipe the Gemini response back to the client
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    console.error("API Error in /api/chat:", error);
    return NextResponse.json(
      { error: error.message || "Failed to communicate with AI model" },
      { status: 500 }
    );
  }
}
