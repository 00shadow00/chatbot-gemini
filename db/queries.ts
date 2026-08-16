import "server-only";

import { genSaltSync, hashSync } from "bcrypt-ts";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { user, chat, User, reservation } from "./schema";

const client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error("Failed to get user from database");
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({
      email,
      password: hash,
    });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

export async function saveChat({
  id,
  messages,
  userId,
}: {
  id: string;
  messages: any;
  userId: string;
}) {
  try {
    /*
    |--------------------------------------------------------------------------
    | Find the first actual user message
    |--------------------------------------------------------------------------
    */

    const firstUserMessage = messages.find(
      (message: any) =>
        message.role === "user" &&
        typeof message.content === "string" &&
        message.content.trim().length > 0,
    );

    /*
    |--------------------------------------------------------------------------
    | Don't create empty chats
    |--------------------------------------------------------------------------
    */

    if (!firstUserMessage) {
      console.log("⏭️ Skipping empty chat:", id);

      return null;
    }

    /*
    |--------------------------------------------------------------------------
    | Generate title from first user message
    |--------------------------------------------------------------------------
    */

    const title =
      firstUserMessage.content
        .toString()
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 100) || "New Chat";

    /*
    |--------------------------------------------------------------------------
    | Check if chat already exists
    |--------------------------------------------------------------------------
    */

    const selectedChats = await db
      .select()
      .from(chat)
      .where(eq(chat.id, id));

    /*
    |--------------------------------------------------------------------------
    | Update existing chat
    |--------------------------------------------------------------------------
    */

    if (selectedChats.length > 0) {
      return await db
        .update(chat)
        .set({
          messages: JSON.stringify(messages),
        })
        .where(eq(chat.id, id));
    }

    /*
    |--------------------------------------------------------------------------
    | Create new chat
    |--------------------------------------------------------------------------
    */

    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      title,
      messages: JSON.stringify(messages),
      userId,
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db
      .select()
      .from(chat)
      .where(eq(chat.id, id));

    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

export async function createReservation({
  id,
  userId,
  details,
}: {
  id: string;
  userId: string;
  details: any;
}) {
  return await db.insert(reservation).values({
    id,
    createdAt: new Date(),
    userId,
    hasCompletedPayment: false,
    details: JSON.stringify(details),
  });
}

export async function getReservationById({ id }: { id: string }) {
  const [selectedReservation] = await db
    .select()
    .from(reservation)
    .where(eq(reservation.id, id));

  return selectedReservation;
}

export async function updateReservation({
  id,
  hasCompletedPayment,
  }: {
    id: string;
    hasCompletedPayment: boolean;
}) {
  return await db
    .update(reservation)
    .set({
      hasCompletedPayment,
    })
    .where(eq(reservation.id, id));
}
