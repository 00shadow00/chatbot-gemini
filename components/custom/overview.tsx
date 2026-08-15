"use client";

import { motion } from "framer-motion";
import { MessageIcon } from "./icons";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="w-full max-w-[500px] mt-20 px-4 md:px-0"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-blue-500 text-white">
            <MessageIcon />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Hi! 👋
            </h1>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              How can I help you today?
            </p>
          </div>

          <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            Ask me anything, get information, or let me help you with your
            travel plans.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
