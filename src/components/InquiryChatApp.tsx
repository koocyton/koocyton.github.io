"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_SETTINGS,
  InquiryApiError,
  QUICK_PROMPTS,
  SETTINGS_KEY,
  SYSTEM_PROMPT,
  WELCOME_TEXT,
  streamChatCompletion,
  type ChatMessage,
  type InquirySettings,
} from "@/lib/inquiry-chat";

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadSettings(): InquirySettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(next: InquirySettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
}

function welcomeMessage(): ChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    content: WELCOME_TEXT,
    createdAt: Date.now(),
  };
}

export default function InquiryChatApp() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage()]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<InquirySettings>(DEFAULT_SETTINGS);
  const [draftSettings, setDraftSettings] = useState<InquirySettings>(DEFAULT_SETTINGS);
  const [accepted, setAccepted] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    setDraftSettings(loaded);
    try {
      if (localStorage.getItem("inquiry-chat-accepted") === "1") {
        setAccepted(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, streaming, error]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const configured = Boolean(settings.baseUrl.trim());

  const persistAccepted = () => {
    setAccepted(true);
    try {
      localStorage.setItem("inquiry-chat-accepted", "1");
    } catch {
      /* ignore */
    }
  };

  const applySettings = () => {
    const next = {
      baseUrl: draftSettings.baseUrl.trim(),
      apiKey: draftSettings.apiKey.trim(),
      model: draftSettings.model.trim() || DEFAULT_SETTINGS.model,
    };
    setSettings(next);
    saveSettings(next);
    setShowSettings(false);
    setError(null);
  };

  const resetChat = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
    setError(null);
    setInput("");
    setMessages([welcomeMessage()]);
  };

  const sendText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    if (!accepted) {
      setError("请先阅读并确认底部免责说明后再开始对话。");
      return;
    }

    if (!settings.baseUrl.trim()) {
      setShowSettings(true);
      setError("请先配置 API Base URL（OpenAI 兼容接口或自建代理）。");
      return;
    }

    setError(null);
    setInput("");

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };
    const assistantId = uid();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: Date.now(),
    };

    // 欢迎语作为助手开场一并带入上下文
    const prior = messages.filter((m) => m.content.trim().length > 0);

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamChatCompletion({
        settings,
        signal: controller.signal,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...prior.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: trimmed },
        ],
        onDelta: (piece) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + piece } : m)),
          );
        },
      });
    } catch (e) {
      if (controller.signal.aborted) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId && !m.content
              ? { ...m, content: "（已停止生成）" }
              : m,
          ),
        );
      } else {
        const msg =
          e instanceof InquiryApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : "请求失败";
        setError(msg);
        setMessages((prev) => {
          const target = prev.find((m) => m.id === assistantId);
          if (target && !target.content) {
            return prev.filter((m) => m.id !== assistantId);
          }
          return prev;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      textareaRef.current?.focus();
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendText(input);
  };

  const stop = () => {
    abortRef.current?.abort();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendText(input);
    }
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 3rem)" }}>
      {/* 顶栏 */}
      <div className="shrink-0 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="px-4 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="min-w-0">
            <h1 className="font-mono text-sm font-semibold text-[var(--color-text)] leading-tight">
              个人 AI 工具测试，不提供参考
            </h1>
            <p className="text-[11px] text-[var(--color-text-tertiary)] font-mono mt-0.5">
              AI 问诊对话 · 就医前知识储备（非诊疗）
            </p>
          </div>
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                setDraftSettings(settings);
                setShowSettings((v) => !v);
              }}
              className={`text-xs font-mono px-2 py-1 rounded border transition-colors ${
                showSettings || !configured
                  ? "border-[var(--color-text)] text-[var(--color-text)]"
                  : "border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text)]"
              }`}
            >
              设置
            </button>
            <button
              type="button"
              onClick={resetChat}
              className="text-xs font-mono px-2 py-1 rounded border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors"
            >
              新对话
            </button>
            <Link
              href="/"
              className="text-xs font-mono text-[var(--color-text-tertiary)] hover:text-[var(--color-link)] transition-colors"
            >
              ← 返回
            </Link>
          </div>
        </div>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="shrink-0 border-b border-[var(--color-border)] bg-white px-4 py-3">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-mono text-xs font-semibold text-[var(--color-text)]">接口设置</h2>
              <p className="text-[11px] text-[var(--color-text-tertiary)]">
                静态站需自备 OpenAI 兼容接口；配置保存在本机 localStorage
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="sm:col-span-2 block">
                <span className="text-[11px] font-mono text-[var(--color-text-tertiary)]">API Base URL</span>
                <input
                  type="url"
                  value={draftSettings.baseUrl}
                  onChange={(e) => setDraftSettings((s) => ({ ...s, baseUrl: e.target.value }))}
                  placeholder="https://openrouter.ai/api/v1 或自建代理"
                  className="mt-1 w-full text-sm px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-bg)] outline-none focus:border-[var(--color-link)]"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-mono text-[var(--color-text-tertiary)]">API Key（可选）</span>
                <input
                  type="password"
                  value={draftSettings.apiKey}
                  onChange={(e) => setDraftSettings((s) => ({ ...s, apiKey: e.target.value }))}
                  placeholder="若代理已鉴权可留空"
                  className="mt-1 w-full text-sm px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-bg)] outline-none focus:border-[var(--color-link)]"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-mono text-[var(--color-text-tertiary)]">Model</span>
                <input
                  type="text"
                  value={draftSettings.model}
                  onChange={(e) => setDraftSettings((s) => ({ ...s, model: e.target.value }))}
                  placeholder={DEFAULT_SETTINGS.model}
                  className="mt-1 w-full text-sm px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-bg)] outline-none focus:border-[var(--color-link)]"
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={applySettings}
                className="text-xs font-mono px-3 py-1.5 rounded bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-90"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="text-xs font-mono px-3 py-1.5 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 消息区 */}
      <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto bg-[var(--color-bg)]">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          <div
            className="border-l-3 pl-3 py-2 bg-[var(--color-code-bg)]/50 rounded-r text-[13px] text-[var(--color-text-secondary)] leading-relaxed"
            style={{ borderLeftWidth: 3, borderLeftColor: "var(--color-border)" }}
          >
            <strong className="text-[var(--color-text)] font-medium">免责提示：</strong>
            本页面为个人 AI 工具测试，不提供临床参考，不构成诊断、处方或治疗建议。急危症状请立即就医。
          </div>

          {messages.map((m) => {
            const isUser = m.role === "user";
            const emptyStreaming = !isUser && streaming && !m.content;
            return (
              <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[92%] sm:max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    isUser
                      ? "bg-[var(--color-text)] text-[var(--color-bg)]"
                      : "bg-white border border-[var(--color-border)] text-[var(--color-text)]"
                  }`}
                >
                  {!isUser && (
                    <div className="font-mono text-[10px] text-[var(--color-text-tertiary)] mb-1.5">
                      助手
                    </div>
                  )}
                  {emptyStreaming ? (
                    <span className="text-[var(--color-text-tertiary)] font-mono text-xs">生成中…</span>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            );
          })}

          {messages.length <= 1 && !streaming && (
            <div className="pt-1">
              <div className="font-mono text-[11px] text-[var(--color-text-tertiary)] mb-2">快速开始</div>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void sendText(q)}
                    className="text-left text-[12px] px-2.5 py-1.5 rounded border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-text)] hover:text-[var(--color-text)] transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="text-[13px] text-[var(--color-text-secondary)] bg-white border border-[var(--color-border)] rounded-lg px-3 py-2">
              <span className="font-mono text-[11px] text-[var(--color-text-tertiary)] mr-2">错误</span>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* 输入区 */}
      <div className="shrink-0 border-t border-[var(--color-border)] bg-white">
        <form onSubmit={onSubmit} className="max-w-2xl mx-auto px-4 py-3 space-y-2">
          {!accepted && (
            <label className="flex items-start gap-2 text-[12px] text-[var(--color-text-secondary)] leading-snug cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => {
                  if (e.target.checked) persistAccepted();
                }}
                className="mt-0.5"
              />
              <span>
                我已了解：这是个人测试工具，输出仅供就医前知识整理，不能替代执业医师面诊与检查。
              </span>
            </label>
          )}
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={2}
              disabled={streaming}
              placeholder={
                configured
                  ? "描述症状、时间与伴随情况…（Enter 发送，Shift+Enter 换行）"
                  : "请先在「设置」中配置 API，再描述症状…"
              }
              className="flex-1 resize-none text-sm px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-link)] disabled:opacity-60"
            />
            {streaming ? (
              <button
                type="button"
                onClick={stop}
                className="shrink-0 text-xs font-mono px-3 py-2 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                停止
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="shrink-0 text-xs font-mono px-3 py-2 rounded bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                发送
              </button>
            )}
          </div>
          <p className="text-[10px] font-mono text-[var(--color-text-tertiary)]">
            {configured
              ? `模型 ${settings.model || DEFAULT_SETTINGS.model}`
              : "未配置接口 · 点击右上角「设置」"}
          </p>
        </form>
      </div>
    </div>
  );
}
