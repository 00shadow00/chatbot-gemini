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
  const {
    messages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
  } = useChat({
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
      <div className="flex min-w-0 flex-col items-center justify-between gap-4">
        <div
          ref={messagesContainerRef}
          className="flex size-full flex-col items-center gap-5 overflow-y-scroll"
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

          {/* Typing indicator kapag wala pang assistant message */}
          {isLoading &&
            (messages.length === 0 ||
              messages[messages.length - 1]?.role === "user") && (
              <div className="w-full px-4 md:w-[700px] md:px-0">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
                    <span className="text-xs">AI</span>
                  </div>

                  <div className="rounded-2xl rounded-tl-md border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/70">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-zinc-400">
                        AI is thinking
                      </span>

                      <span className="flex gap-1">
                        <span className="size-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-zinc-400" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          <div
            ref={messagesEndRef}
            className="min-h-[24px] min-w-[24px] shrink-0"
          />
        </div>

        <form className="relative flex w-full max-w-[calc(100dvw-32px)] flex-row items-end gap-2 px-0 md:max-w-[700px]">
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
