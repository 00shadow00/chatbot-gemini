"use client";

import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { ReactNode } from "react";

import { BotIcon, UserIcon } from "./icons";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";
import { AuthorizePayment } from "../flights/authorize-payment";
import { DisplayBoardingPass } from "../flights/boarding-pass";
import { CreateReservation } from "../flights/create-reservation";
import { FlightStatus } from "../flights/flight-status";
import { ListFlights } from "../flights/list-flights";
import { SelectSeats } from "../flights/select-seats";
import { VerifyPayment } from "../flights/verify-payment";

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
  const isUser = role === "user";
  const isAssistant = role === "assistant";

  return (
    <motion.div
      className={`w-full px-4 md:px-0 ${
        isUser ? "flex justify-end" : "flex justify-start"
      }`}
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`flex w-full max-w-[700px] ${
          isUser ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`flex items-start gap-3 ${
            isUser
              ? "max-w-[85%] flex-row-reverse md:max-w-[75%]"
              : "w-full max-w-[90%]"
          }`}
        >
          {/* Avatar */}
          <div
            className={`flex size-8 shrink-0 items-center justify-center rounded-full border ${
              isUser
                ? "border-blue-500/20 bg-blue-500/10 text-blue-500"
                : "border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {isAssistant ? <BotIcon /> : <UserIcon />}
          </div>

          {/* Message content */}
          <div
            className={`flex min-w-0 flex-col gap-2 ${
              isUser ? "items-end" : "items-start"
            }`}
          >
            {typeof content === "string" && content.length > 0 && (
              <div
                className={`break-words whitespace-pre-wrap text-sm leading-6 ${
                  isUser
                    ? "rounded-2xl rounded-tr-md bg-blue-600 px-4 py-3 text-white shadow-sm dark:bg-blue-600"
                    : "rounded-2xl rounded-tl-md border border-zinc-200 bg-white px-4 py-3 text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                }`}
              >
                {content}
              </div>
            )}

            {/* AI loading indicator */}
            {isAssistant && isLoading && !content && (
              <div className="rounded-2xl rounded-tl-md border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-1.5">
                  <span className="sr-only">AI is typing</span>

                  <span
                    className="size-2 animate-bounce rounded-full bg-zinc-400"
                    style={{ animationDelay: "0ms" }}
                  />

                  <span
                    className="size-2 animate-bounce rounded-full bg-zinc-400"
                    style={{ animationDelay: "150ms" }}
                  />

                  <span
                    className="size-2 animate-bounce rounded-full bg-zinc-400"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}

            {/* Attachments */}
            {attachments && attachments.length > 0 && (
              <div className="flex flex-row flex-wrap gap-2">
                {attachments.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            {/* Tool invocations */}
            {toolInvocations && toolInvocations.length > 0 && (
              <div className="flex w-full flex-col gap-4">
                {toolInvocations.map((toolInvocation) => {
                  const { toolName, toolCallId, state } = toolInvocation;

                  if (state === "result") {
                    const { result } = toolInvocation;

                    return (
                      <div key={toolCallId}>
                        {toolName === "getWeather" ? (
                          <Weather weatherAtLocation={result} />
                        ) : toolName === "displayFlightStatus" ? (
                          <FlightStatus flightStatus={result} />
                        ) : toolName === "searchFlights" ? (
                          <ListFlights chatId={chatId} results={result} />
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
                          <div className="whitespace-pre-wrap rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900">
                            {JSON.stringify(result, null, 2)}
                          </div>
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
      </div>
    </motion.div>
  );
};
