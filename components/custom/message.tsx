"use client";

import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
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

/*
|--------------------------------------------------------------------------
| CODE BLOCK
|--------------------------------------------------------------------------
*/

function CodeBlock({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
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
    <div className="my-3 w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-950 shadow-sm dark:border-zinc-800">
      {/* Code Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          {language || "code"}
        </span>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          {copied ? (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>

              Copied
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect
                  width="13"
                  height="13"
                  x="9"
                  y="9"
                  rx="2"
                />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>

              Copy
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <pre className="overflow-x-auto p-4 text-[13px] leading-6 text-zinc-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| MESSAGE CONTENT
|--------------------------------------------------------------------------
*/

function MessageContent({
  content,
  role,
}: {
  content: string;
  role: string;
}) {
  /*
   * Detect fenced code blocks:
   *
   * ```javascript
   * const hello = "world";
   * ```
   */

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div
      className={
        role === "user"
          ? "whitespace-pre-wrap break-words text-sm leading-6"
          : "whitespace-pre-wrap break-words text-sm leading-6"
      }
    >
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const codeContent = part.slice(3, -3);

          const lines = codeContent.split("\n");

          let language = "";

          if (lines.length > 0) {
            const firstLine = lines[0].trim();

            /*
             * If the first line looks like a language name,
             * remove it from the actual code.
             */
            if (
              firstLine &&
              /^[a-zA-Z0-9+#.-]+$/.test(firstLine) &&
              lines.length > 1
            ) {
              language = firstLine;
              lines.shift();
            }
          }

          const code = lines.join("\n").replace(/^\n|\n$/g, "");

          return (
            <CodeBlock
              key={index}
              code={code}
              language={language}
            />
          );
        }

        /*
         * Empty text parts are ignored.
         */
        if (!part) {
          return null;
        }

        /*
         * Simple inline-code styling.
         *
         * Example:
         * Use `npm install`
         */

        const inlineParts = part.split(/(`[^`]+`)/g);

        return (
          <span key={index}>
            {inlineParts.map((text, inlineIndex) => {
              if (
                text.startsWith("`") &&
                text.endsWith("`") &&
                text.length > 2
              ) {
                return (
                  <code
                    key={inlineIndex}
                    className="mx-0.5 rounded-md border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[12px] text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    {text.slice(1, -1)}
                  </code>
                );
              }

              return <span key={inlineIndex}>{text}</span>;
            })}
          </span>
        );
      })}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| MESSAGE
|--------------------------------------------------------------------------
*/

export const Message = ({
  chatId,
  role,
  content,
  toolInvocations,
  attachments,
}: {
  chatId: string;
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
}) => {
  const isUser = role === "user";
  const isAssistant = role === "assistant";

  return (
    <motion.div
      className={`flex w-full px-4 md:w-[700px] md:px-0 ${
        isUser ? "justify-end" : "justify-start"
      }`}
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.2,
        ease: "easeOut",
      }}
    >
      <div
        className={`flex max-w-[92%] gap-3 md:max-w-[85%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div
          className={`mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border shadow-sm ${
            isUser
              ? "border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          }`}
        >
          {isAssistant ? (
            <BotIcon />
          ) : (
            <UserIcon />
          )}
        </div>

        {/* Message Area */}
        <div
          className={`flex min-w-0 flex-col ${
            isUser ? "items-end" : "items-start"
          }`}
        >
          {/* Role label */}
          <div
            className={`mb-1 px-1 text-[11px] font-medium ${
              isUser
                ? "text-zinc-400"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {isUser ? "You" : "AI"}
          </div>

          {/* Message Bubble */}
          {typeof content === "string" && content.length > 0 && (
            <div
              className={`rounded-2xl px-4 py-3 shadow-sm ${
                isUser
                  ? "rounded-tr-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "rounded-tl-md border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
              }`}
            >
              <MessageContent
                content={content}
                role={role}
              />
            </div>
          )}

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <div className="mt-2 flex flex-row flex-wrap gap-2">
              {attachments.map((attachment) => (
                <PreviewAttachment
                  key={attachment.url}
                  attachment={attachment}
                />
              ))}
            </div>
          )}

          {/* Tool Invocations */}
          {toolInvocations && toolInvocations.length > 0 && (
            <div className="mt-3 flex w-full flex-col gap-4">
              {toolInvocations.map((toolInvocation) => {
                const {
                  toolName,
                  toolCallId,
                  state,
                } = toolInvocation;

                /*
                 * Tool completed
                 */
                if (state === "result") {
                  const { result } = toolInvocation;

                  return (
                    <div
                      key={toolCallId}
                      className="w-full"
                    >
                      {toolName === "getWeather" ? (
                        <Weather
                          weatherAtLocation={result}
                        />
                      ) : toolName === "displayFlightStatus" ? (
                        <FlightStatus
                          flightStatus={result}
                        />
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
                        Object.keys(result).includes(
                          "error",
                        ) ? null : (
                          <CreateReservation
                            reservation={result}
                          />
                        )
                      ) : toolName === "authorizePayment" ? (
                        <AuthorizePayment
                          intent={result}
                        />
                      ) : toolName === "displayBoardingPass" ? (
                        <DisplayBoardingPass
                          boardingPass={result}
                        />
                      ) : toolName === "verifyPayment" ? (
                        <VerifyPayment
                          result={result}
                        />
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900">
                          <pre>
                            {JSON.stringify(
                              result,
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                }

                /*
                 * Tool is currently running
                 */
                return (
                  <div
                    key={toolCallId}
                    className="w-full"
                  >
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
