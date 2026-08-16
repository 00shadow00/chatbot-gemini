"use client";

import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { ReactNode, useState } from "react";

import { AuthorizePayment } from "../flights/authorize-payment";
import { DisplayBoardingPass } from "../flights/boarding-pass";
import { CreateReservation } from "../flights/create-reservation";
import { FlightStatus } from "../flights/flight-status";
import { ListFlights } from "../flights/list-flights";
import { SelectSeats } from "../flights/select-seats";
import { VerifyPayment } from "../flights/verify-payment";

import { BotIcon, UserIcon } from "./icons";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-950 dark:border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 py-2">
        <span className="text-xs font-medium text-zinc-400">
          {language || "code"}
        </span>

        <button
          type="button"
          onClick={copyCode}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="size-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      <pre className="overflow-x-auto p-4 text-sm leading-6 text-zinc-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderContent(content: string) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (!part.startsWith("```")) {
      return (
        <span key={index} className="whitespace-pre-wrap break-words">
          {part}
        </span>
      );
    }

    const match = part.match(/^```([a-zA-Z0-9_+-]*)\n?([\s\S]*?)```$/);

    if (!match) {
      return (
        <pre
          key={index}
          className="my-3 overflow-x-auto rounded-xl bg-zinc-950 p-4 text-sm text-zinc-100"
        >
          <code>{part.replace(/```/g, "")}</code>
        </pre>
      );
    }

    const language = match[1] || "code";
    const code = match[2].replace(/\n$/, "");

    return <CodeBlock key={index} code={code} language={language} />;
  });
}

export const Message = ({
  chatId,
  role,
  content,
  toolInvocations,
  attachments,
  isLoading = false,
}: {
  chatId: string;
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
  isLoading?: boolean;
}) => {
  const isAssistant = role === "assistant";
  const isUser = role === "user";

  return (
    <motion.div
      className={`w-full px-4 md:w-[700px] md:px-0 ${
        isUser ? "flex justify-end" : "flex justify-start"
      }`}
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`flex max-w-[95%] gap-3 md:max-w-[85%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-full border ${
            isAssistant
              ? "border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              : "border-zinc-800 bg-zinc-900 text-white dark:border-zinc-700"
          }`}
        >
          {isAssistant ? (
            <BotIcon />
          ) : (
            <UserIcon />
          )}
        </div>

        {/* Message */}
        <div
          className={`flex min-w-0 flex-col ${
            isUser ? "items-end" : "items-start"
          }`}
        >
          {/* Name */}
          <div className="mb-1 px-1 text-[11px] font-medium text-zinc-400">
            {isAssistant ? "AI Assistant" : "You"}
          </div>

          {/* Bubble */}
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
              isUser
                ? "rounded-tr-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "rounded-tl-md border border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-200"
            }`}
          >
            {typeof content === "string" && content.length > 0 && (
              <div className="min-w-0">
                {renderContent(content)}
              </div>
            )}

            {/* AI typing indicator */}
            {isAssistant &&
              isLoading &&
              (!content || (typeof content === "string" && content.length === 0)) && (
                <div className="flex items-center gap-1.5 py-1">
                  <span className="text-xs text-zinc-400">
                    AI is thinking
                  </span>

                  <span className="flex gap-1">
                    <span className="size-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-zinc-400" />
                  </span>
                </div>
              )}
          </div>

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <div className="mt-2 flex flex-row gap-2">
              {attachments.map((attachment) => (
                <PreviewAttachment
                  key={attachment.url}
                  attachment={attachment}
                />
              ))}
            </div>
          )}

          {/* Tools */}
          {toolInvocations && toolInvocations.length > 0 && (
            <div className="mt-3 flex w-full flex-col gap-4">
              {toolInvocations.map((toolInvocation) => {
                const { toolName, toolCallId, state } = toolInvocation;

                if (state === "result") {
                  const { result } = toolInvocation;

                  return (
                    <div key={toolCallId} className="w-full">
                      {toolName === "getWeather" ? (
                        <Weather weatherAtLocation={result} />
                      ) : toolName === "displayFlightStatus" ? (
                        <FlightStatus flightStatus={result} />
                      ) : toolName === "searchFlights" ? (
                        <ListFlights
                          chatId={chatId}
                          results={result}
                        />
                      ) : toolName === "selectSeats" ? (
                        <SelectSeats
                          chatId={chatId}
                          availability={result}
                        />
                      ) : toolName === "createReservation" ? (
                        Object.keys(result).includes("error") ? null : (
                          <CreateReservation reservation={result} />
                        )
                      ) : toolName === "authorizePayment" ? (
                        <AuthorizePayment intent={result} />
                      ) : toolName === "displayBoardingPass" ? (
                        <DisplayBoardingPass boardingPass={result} />
                      ) : toolName === "verifyPayment" ? (
                        <VerifyPayment result={result} />
                      ) : (
                        <pre className="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={toolCallId} className="skeleton">
                    {toolName === "getWeather" ? (
                      <Weather />
                    ) : toolName === "displayFlightStatus" ? (
                      <FlightStatus />
                    ) : toolName === "searchFlights" ? (
                      <ListFlights chatId={chatId} />
                    ) : toolName === "selectSeats" ? (
                      <SelectSeats chatId={chatId} />
                    ) : toolName === "createReservation" ? (
                      <CreateReservation />
                    ) : toolName === "authorizePayment" ? (
                      <AuthorizePayment />
                    ) : toolName === "displayBoardingPass" ? (
                      <DisplayBoardingPass />
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
