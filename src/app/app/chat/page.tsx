"use client";

import { useEffect, useRef, useState } from "react";
import { askAssistant } from "./actions";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
};

const suggestedPrompts = [
  "Me dê uma dica para economizar",
  "Qual é o meu histórico de transações?",
  "Qual é o meu saldo atual?",
];

function now() {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: createId(),
      role: "assistant",
      content:
        "Olá! Sou o assistente financeiro do SalvaBolso. Posso te dar dicas de economia, mostrar seu histórico de transações ou seu saldo atual. Como posso ajudar?",
      time: now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: trimmed,
      time: now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const reply = await askAssistant(trimmed);
    setMessages((prev) => [
      ...prev,
      { id: createId(), role: "assistant", content: reply, time: now() },
    ]);
    setIsTyping(false);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-black/10 px-6 py-4 dark:border-white/10">
        <h1 className="text-lg font-bold text-foreground">
          Assistente Financeiro
        </h1>
        <p className="text-sm text-foreground/60">
          Tire dúvidas, peça dicas de economia ou consulte seu histórico.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-10">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  message.role === "assistant"
                    ? "bg-brand-600 text-white"
                    : "bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-100"
                }`}
              >
                {message.role === "assistant" ? "IA" : "Eu"}
              </div>
              <div
                className={`max-w-[75%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  message.role === "user"
                    ? "rounded-br-sm bg-brand-600 text-white"
                    : "rounded-bl-sm border border-black/10 bg-white text-foreground dark:border-white/10 dark:bg-white/5"
                }`}
              >
                {message.content}
                <div
                  className={`mt-1 text-[10px] ${
                    message.role === "user"
                      ? "text-brand-100"
                      : "text-foreground/40"
                  }`}
                >
                  {message.time}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-end gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                IA
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40" />
              </div>
            </div>
          )}

          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 pl-10">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-900/40 dark:text-brand-100"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-black/10 px-4 py-4 dark:border-white/10 md:px-10"
      >
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre dicas de economia, histórico ou saldo..."
            className="max-h-32 flex-1 resize-none rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none placeholder:text-foreground/40 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-white/10 dark:bg-white/5"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Enviar mensagem"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
