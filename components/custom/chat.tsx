"use client";

import { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useState } from "react";

import { Message as PreviewMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";

import { MultimodalInput } from "./multimodal-input";
import { Overview } from "./overview";

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<Message>;
}) {
  const { messages, handleSubmit, input, setInput, append, isLoading, stop } =
    useChat({
      id,
      body: { id },
      initialMessages,
      maxSteps: 10,
      onFinish: () => {
        window.history.replaceState({}, "", `/chat/${id}`);
      },
    });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <div className="flex h-dvh flex-row justify-center bg-background pb-4 md:pb-8">
      <div className="flex w-full flex-col items-center justify-between gap-4">
        <div
          ref={messagesContainerRef}
          className="flex h-full w-full flex-col items-center gap-4 overflow-y-auto"
        >
          {messages.length === 0 && <Overview />}

          {messages.map((message, index) => (
            <PreviewMessage
              key={message.id}
              chatId={id}
              role={message.role}
              content={message.content}
              attachments={message.experimental_attachments}
              toolInvocations={message.toolInvocations}
              isLoading={
                isLoading &&
                index === messages.length - 1 &&
                message.role === "assistant"
              }
            />
          ))}

          {isLoading &&
            (messages.length === 0 ||
              messages[messages.length - 1]?.role === "user") && (
              <PreviewMessage
                chatId={id}
                role="assistant"
                content=""
                toolInvocations={undefined}
                isLoading
              />
            )}

          <div
            ref={messagesEndRef}
            className="min-h-[24px] min-w-[24px] shrink-0"
          />
        </div>

        <form className="relative flex w-full max-w-[calc(100dvw-32px)] flex-row items-end gap-2 px-0 md:max-w-[500px] md:px-0">
          <MultimodalInput
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            append={append}
          />
        </form>
      </div>
    </div>
  );
}
