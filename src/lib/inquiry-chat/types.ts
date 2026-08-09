export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: Exclude<ChatRole, "system">;
  content: string;
  createdAt: number;
}

export interface ApiMessage {
  role: ChatRole;
  content: string;
}

export interface InquirySettings {
  /** OpenAI 兼容接口，如 https://openrouter.ai/api/v1 或自建代理 */
  baseUrl: string;
  /** 可选；若走已鉴权代理可留空 */
  apiKey: string;
  model: string;
}

export const SETTINGS_KEY = "inquiry-chat-settings";

export const DEFAULT_SETTINGS: InquirySettings = {
  baseUrl: "",
  apiKey: "",
  model: "openai/gpt-4o-mini",
};
