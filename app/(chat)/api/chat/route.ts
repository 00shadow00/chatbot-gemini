import { convertToCoreMessages, Message, streamText } from "ai";

import { geminiProModel } from "@/ai";
import { auth } from "@/app/(auth)/auth";
import {
  deleteChatById,
  getChatById,
  saveChat,
} from "@/db/queries";

export async function POST(request: Request) {
  try {
    const { id, messages }: {
      id: string;
      messages: Array<Message>;
    } = await request.json();

    const session = await auth();

    if (!session?.user?.id) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    // TypeScript-safe user ID
    const userId = session.user.id;

    const coreMessages = convertToCoreMessages(messages).filter(
      (message) =>
        typeof message.content === "string" &&
        message.content.length > 0,
    );

    console.log("🤖 Gemini request:", {
      chatId: id,
      messages: coreMessages.length,
    });

    const result = await streamText({
      model: geminiProModel,

      system:
        "You are a helpful AI assistant. Answer the user clearly and naturally.",

      messages: coreMessages,

      onFinish: async ({ responseMessages }) => {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            userId,
          });

          console.log("✅ Chat saved successfully:", id);
        } catch (error) {
          console.error("❌ Failed to save chat:", error);

          if (error instanceof Error) {
            console.error("Message:", error.message);
            console.error("Stack:", error.stack);
          }
        }
      },
    });

    console.log("✅ Gemini stream created");

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("❌ /api/chat ERROR:", error);

    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }

    return new Response("AI request failed", {
      status: 500,
    });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", {
      status: 404,
    });
  }

  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    const chat = await getChatById({ id });

    if (!chat) {
      return new Response("Chat not found", {
        status: 404,
      });
    }

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", {
      status: 200,
    });
  } catch (error) {
    console.error("❌ Failed to delete chat:", error);

    return new Response(
      "An error occurred while processing your request",
      {
        status: 500,
      },
    );
  }
}
