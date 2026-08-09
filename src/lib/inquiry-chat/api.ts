import type { ApiMessage, InquirySettings } from "./types";

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function completionsUrl(baseUrl: string): string {
  const base = normalizeBaseUrl(baseUrl);
  if (base.endsWith("/chat/completions")) return base;
  if (base.endsWith("/v1")) return `${base}/chat/completions`;
  return `${base}/v1/chat/completions`;
}

export class InquiryApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "InquiryApiError";
    this.status = status;
  }
}

/**
 * 调用 OpenAI 兼容 Chat Completions（stream）。
 * 支持 OpenRouter、自建代理、本地兼容服务等。
 */
export async function streamChatCompletion(options: {
  settings: InquirySettings;
  messages: ApiMessage[];
  signal?: AbortSignal;
  onDelta: (text: string) => void;
}): Promise<string> {
  const { settings, messages, signal, onDelta } = options;
  const baseUrl = settings.baseUrl.trim();
  if (!baseUrl) {
    throw new InquiryApiError("请先在设置中填写 API Base URL");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const key = settings.apiKey.trim();
  if (key) {
    headers.Authorization = `Bearer ${key}`;
  }

  const res = await fetch(completionsUrl(baseUrl), {
    method: "POST",
    headers,
    signal,
    body: JSON.stringify({
      model: settings.model.trim() || "openai/gpt-4o-mini",
      stream: true,
      temperature: 0.4,
      messages,
    }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      detail = await res.text();
    } catch {
      /* ignore */
    }
    const snippet = detail.slice(0, 240).trim();
    throw new InquiryApiError(
      snippet ? `请求失败 (${res.status}): ${snippet}` : `请求失败 (${res.status})`,
      res.status,
    );
  }

  if (!res.body) {
    throw new InquiryApiError("响应无内容流");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith(":")) continue;
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") continue;

      try {
        const json = JSON.parse(data) as {
          choices?: { delta?: { content?: string }; message?: { content?: string } }[];
        };
        const piece =
          json.choices?.[0]?.delta?.content ??
          json.choices?.[0]?.message?.content ??
          "";
        if (piece) {
          full += piece;
          onDelta(piece);
        }
      } catch {
        /* 忽略不完整 JSON 行 */
      }
    }
  }

  return full;
}
