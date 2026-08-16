"use client";

import {
  Attachment,
  ChatRequestOptions,
  CreateMessage,
  Message,
} from "ai";
import { motion } from "framer-motion";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
  ChangeEvent,
} from "react";
import { toast } from "sonner";

import { ArrowUpIcon, PaperclipIcon, StopIcon } from "./icons";
import { PreviewAttachment } from "./preview-attachment";
import useWindowSize from "./use-window-size";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

export function MultimodalInput({
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  messages,
  append,
  handleSubmit,
}: {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { width } = useWindowSize();

  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  /*
  |--------------------------------------------------------------------------
  | Auto resize textarea
  |--------------------------------------------------------------------------
  */

  const adjustHeight = useCallback(() => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "auto";

    const maxHeight = 180;
    const newHeight = Math.min(
      textareaRef.current.scrollHeight,
      maxHeight,
    );

    textareaRef.current.style.height = `${newHeight}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [input, adjustHeight]);

  /*
  |--------------------------------------------------------------------------
  | Input change
  |--------------------------------------------------------------------------
  */

  const handleInput = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setInput(event.target.value);
  };

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const submitForm = useCallback(() => {
    const trimmedInput = input.trim();

    if (
      !trimmedInput &&
      attachments.length === 0
    ) {
      return;
    }

    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });

    setAttachments([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    if (width && width > 768) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [
    input,
    attachments,
    handleSubmit,
    setAttachments,
    width,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Upload file
  |--------------------------------------------------------------------------
  */

  const uploadFile = async (file: File) => {
    const formData = new FormData();

    formData.append("file", file);

    try {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Failed to upload file.";

        try {
          const data = await response.json();

          if (data?.error) {
            errorMessage = data.error;
          }
        } catch {
          // Ignore JSON parsing errors.
        }

        toast.error(errorMessage);

        return undefined;
      }

      const data = await response.json();

      const {
        url,
        pathname,
        contentType,
      } = data;

      return {
        url,
        name: pathname,
        contentType,
      };
    } catch (error) {
      console.error("File upload error:", error);

      toast.error(
        "Failed to upload file. Please try again.",
      );

      return undefined;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | File change
  |--------------------------------------------------------------------------
  */

  const handleFileChange = useCallback(
    async (
      event: ChangeEvent<HTMLInputElement>,
    ) => {
      const files = Array.from(
        event.target.files || [],
      );

      if (files.length === 0) {
        return;
      }

      setUploadQueue(
        files.map((file) => file.name),
      );

      try {
        const uploadedAttachments =
          await Promise.all(
            files.map((file) =>
              uploadFile(file),
            ),
          );

        const successfulAttachments =
          uploadedAttachments.filter(
            (
              attachment,
            ): attachment is {
              url: string;
              name: string;
              contentType: string;
            } => attachment !== undefined,
          );

        if (
          successfulAttachments.length > 0
        ) {
          setAttachments(
            (currentAttachments) => [
              ...currentAttachments,
              ...successfulAttachments,
            ],
          );
        }
      } catch (error) {
        console.error(
          "Error uploading files:",
          error,
        );

        toast.error(
          "Some files could not be uploaded.",
        );
      } finally {
        setUploadQueue([]);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [setAttachments],
  );

  /*
  |--------------------------------------------------------------------------
  | Keyboard shortcuts
  |--------------------------------------------------------------------------
  */

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (isLoading) {
        toast.error(
          "Please wait for the AI to finish.",
        );

        return;
      }

      submitForm();
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Empty state
  |--------------------------------------------------------------------------
  */

  const showWelcome =
    messages.length === 0 &&
    attachments.length === 0 &&
    uploadQueue.length === 0;

  return (
    <div className="relative flex w-full flex-col gap-3">
      {/*
      |--------------------------------------------------------------------------
      | Welcome message
      |--------------------------------------------------------------------------
      */}

      {showWelcome && (
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
          }}
          className="mb-1 flex flex-col items-center justify-center px-4 pb-1 text-center"
        >
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-xl">
              ✨
            </span>
          </div>

          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            How can I help you?
          </h2>

          <p className="mt-1 max-w-[360px] text-sm text-zinc-500 dark:text-zinc-400">
            Ask me anything, explain a topic,
            solve a problem, or help you get
            something done.
          </p>
        </motion.div>
      )}

      {/*
      |--------------------------------------------------------------------------
      | Hidden file input
      |--------------------------------------------------------------------------
      */}

      <input
        type="file"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
        className="pointer-events-none fixed -left-4 -top-4 size-0.5 opacity-0"
      />

      {/*
      |--------------------------------------------------------------------------
      | Attachments preview
      |--------------------------------------------------------------------------
      */}

      {(attachments.length > 0 ||
        uploadQueue.length > 0) && (
        <motion.div
          initial={{
            opacity: 0,
            height: 0,
          }}
          animate={{
            opacity: 1,
            height: "auto",
          }}
          className="flex w-full flex-row gap-2 overflow-x-auto px-1 pb-1"
        >
          {attachments.map(
            (attachment) => (
              <PreviewAttachment
                key={attachment.url}
                attachment={attachment}
              />
            ),
          )}

          {uploadQueue.map(
            (filename) => (
              <PreviewAttachment
                key={filename}
                attachment={{
                  url: "",
                  name: filename,
                  contentType: "",
                }}
                isUploading={true}
              />
            ),
          )}
        </motion.div>
      )}

      {/*
      |--------------------------------------------------------------------------
      | Input container
      |--------------------------------------------------------------------------
      */}

      <div
        className="
          relative
          flex
          w-full
          items-end
          rounded-2xl
          border
          border-zinc-200
          bg-white
          p-2
          shadow-sm
          transition-all
          focus-within:border-zinc-300
          focus-within:shadow-md
          dark:border-zinc-800
          dark:bg-zinc-900
          dark:focus-within:border-zinc-700
        "
      >
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={
            isLoading
              ? "AI is thinking..."
              : "Message Gemini..."
          }
          disabled={isLoading}
          rows={1}
          className="
            min-h-[44px]
            max-h-[180px]
            flex-1
            resize-none
            overflow-y-auto
            border-none
            bg-transparent
            px-3
            py-3
            pr-24
            text-base
            shadow-none
            outline-none
            focus-visible:ring-0
            focus-visible:ring-offset-0
            dark:bg-transparent
          "
        />

        {/*
        |--------------------------------------------------------------------------
        | Attachment button
        |--------------------------------------------------------------------------
        */}

        <Button
          type="button"
          variant="ghost"
          disabled={
            isLoading ||
            uploadQueue.length > 0
          }
          onClick={() => {
            fileInputRef.current?.click();
          }}
          className="
            absolute
            bottom-2
            left-2
            size-9
            rounded-full
            p-0
            text-zinc-500
            hover:bg-zinc-100
            hover:text-zinc-900
            dark:text-zinc-400
            dark:hover:bg-zinc-800
            dark:hover:text-zinc-100
          "
          title="Attach file"
        >
          <PaperclipIcon size={17} />
        </Button>

        {/*
        |--------------------------------------------------------------------------
        | Send / Stop button
        |--------------------------------------------------------------------------
        */}

        {isLoading ? (
          <Button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              stop();
            }}
            className="
              absolute
              bottom-2
              right-2
              size-9
              rounded-full
              bg-zinc-900
              p-0
              text-white
              hover:bg-zinc-700
              dark:bg-zinc-100
              dark:text-zinc-900
              dark:hover:bg-zinc-300
            "
            title="Stop generating"
          >
            <StopIcon size={15} />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              submitForm();
            }}
            disabled={
              (input.trim().length === 0 &&
                attachments.length === 0) ||
              uploadQueue.length > 0
            }
            className="
              absolute
              bottom-2
              right-2
              size-9
              rounded-full
              bg-zinc-900
              p-0
              text-white
              hover:bg-zinc-700
              disabled:cursor-not-allowed
              disabled:opacity-40
              dark:bg-zinc-100
              dark:text-zinc-900
              dark:hover:bg-zinc-300
            "
            title="Send message"
          >
            <ArrowUpIcon size={16} />
          </Button>
        )}
      </div>

      {/*
      |--------------------------------------------------------------------------
      | Loading indicator
      |--------------------------------------------------------------------------
      */}

      {isLoading && (
        <motion.div
          initial={{
            opacity: 0,
            y: 4,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="flex items-center gap-2 px-2 text-xs text-zinc-500 dark:text-zinc-400"
        >
          <span>Gemini is thinking</span>

          <span className="flex items-center gap-1">
            <motion.span
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: 0,
              }}
              className="size-1.5 rounded-full bg-current"
            />

            <motion.span
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: 0.15,
              }}
              className="size-1.5 rounded-full bg-current"
            />

            <motion.span
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: 0.3,
              }}
              className="size-1.5 rounded-full bg-current"
            />
          </span>
        </motion.div>
      )}

      {/*
      |--------------------------------------------------------------------------
      | Hint
      |--------------------------------------------------------------------------
      */}

      {!isLoading &&
        messages.length === 0 && (
          <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500">
            Press Enter to send · Shift + Enter
            for a new line
          </p>
        )}
    </div>
  );
}
