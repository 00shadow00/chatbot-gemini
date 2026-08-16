import { motion } from "framer-motion";
import Link from "next/link";

import { MessageIcon, VercelIcon } from "./icons";

const suggestions = [
  "Explain something to me",
  "Help me write code",
  "Give me some ideas",
  "Help me plan my day",
];

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="mx-auto mt-16 w-full max-w-2xl px-4 pb-8 sm:mt-20"
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        ease: "easeOut",
      }}
    >
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-xl shadow-zinc-200/40 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/70 dark:shadow-black/20 sm:p-8">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/10" />

        <div className="relative">
          {/* Logo */}
          <motion.div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
              <VercelIcon />
              <span className="text-lg font-medium text-zinc-400">+</span>
              <MessageIcon />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <div className="mb-3 inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              ✨ AI Assistant
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
              How can I help you today?
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-zinc-500 dark:text-zinc-400 sm:text-base">
              Ask questions, write code, brainstorm ideas, or just start a
              conversation. I&apos;m here to help.
            </p>
          </motion.div>

          {/* Suggestions */}
          <motion.div
            className="mt-7 grid grid-cols-1 gap-2 sm:grid-cols-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion}
                type="button"
                className="group rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-left text-sm text-zinc-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-white hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3 + index * 0.05,
                  duration: 0.3,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span>{suggestion}</span>

                  <span className="text-zinc-300 transition-transform group-hover:translate-x-0.5 dark:text-zinc-700">
                    →
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Description */}
          <motion.div
            className="mt-7 border-t border-zinc-200/80 pt-5 dark:border-zinc-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.4 }}
          >
            <p className="text-center text-xs leading-5 text-zinc-400 dark:text-zinc-500">
              Powered by Google Gemini and the AI SDK.
              <br />
              <Link
                className="mt-1 inline-block font-medium text-blue-500 transition-colors hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                href="https://sdk.vercel.ai/docs"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more about the AI SDK →
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
