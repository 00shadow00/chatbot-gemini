"use client";

import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { ReactNode } from "react";

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

  return (
    <motion.div
      className={`flex w-full px-4 md:px-0 ${
        isAssistant ? "justify-start" : "justify-end"
      }`}
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`flex w-full max-w-[700px] gap-3 ${
          isAssistant ? "flex-row" : "flex-row-reverse"
        }`}
      >
        {/* Avatar */}
        <div className="shrink-0">
          <div
            className={`flex size-8 items-center justify-center rounded-full border ${
              isAssistant
                ? "border-zinc-200 bg-white text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                : "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
            }`}
          >
            {isAssistant ? <BotIcon /> : <UserIcon />}
          </div>
        </div>

        {/* Message content */}
        <div
          className={`flex min-w-0 max-w-[85%] flex-col gap-2 md:max-w-[75%] ${
            isAssistant ? "items-start" : "items-end"
          }`}
        >
          {/* AI typing indicator */}
          {isAssistant &&
            isLoading &&
            typeof content === "string" &&
            content.length === 0 && (
              <div className="rounded-2xl rounded-tl-md border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-1.5">
                  <motion.span
                    className="size-1.5 rounded-full bg-zinc-400"
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: 0,
                    }}
                  />

                  <motion.span
                    className="size-1.5 rounded-full bg-zinc-400"
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: 0.15,
                    }}
                  />

                  <motion.span
                    className="size-1.5 rounded-full bg-zinc-400"
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: 0.3,
                    }}
                  />
                </div>
              </div>
            )}

          {/* Normal message */}
          {typeof content === "string" && content.length > 0 && (
            <div
              className={`whitespace-pre-wrap break-words text-sm leading-6 sm:text-[15px] ${
                isAssistant
                  ? "rounded-2xl rounded-tl-md border border-zinc-200 bg-white px-4 py-3 text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                  : "rounded-2xl rounded-tr-md bg-zinc-900 px-4 py-3 text-white dark:bg-zinc-100 dark:text-zinc-900"
              }`}
            >
              {content}
            </div>
          )}

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <div className="flex flex-row flex-wrap justify-end gap-2">
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
                    <div key={toolCallId} className="w-full">
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
                  <div key={toolCallId} className="w-full">
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
