import { isDestinationId, type DestinationId } from './destinations.js';

export const MAX_INPUT_LENGTH = 1000;
export const MAX_HISTORY_MESSAGES = 6;
export const MAX_HISTORY_CHARACTERS = 4000;
export const MAX_BODY_BYTES = 16384;
export const MAX_ANSWER_LENGTH = 1200;

export type HistoryMessage = { role: 'user' | 'assistant'; content: string };
export type ChatInput = { message: string; history: HistoryMessage[] };
export type SolReply = { answer: string; destinationIds: DestinationId[] };

export function parseChatInput(body: unknown): ChatInput {
  if (!body || typeof body !== 'object') throw new Error('Invalid request.');
  const { message, history = [] } = body as Record<string, unknown>;
  if (typeof message !== 'string' || !message.trim() || message.length > MAX_INPUT_LENGTH) {
    throw new Error(`Please send 1–${MAX_INPUT_LENGTH} characters.`);
  }
  if (!Array.isArray(history) || history.length > MAX_HISTORY_MESSAGES) throw new Error('Conversation is too long.');
  let characters = 0;
  const parsed = history.map((item: unknown): HistoryMessage => {
    if (!item || typeof item !== 'object') throw new Error('Invalid history.');
    const { role, content } = item as Record<string, unknown>;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string' || !content.trim() || content.length > MAX_ANSWER_LENGTH) {
      throw new Error('Invalid history.');
    }
    characters += content.length;
    return { role, content };
  });
  if (characters > MAX_HISTORY_CHARACTERS) throw new Error('Conversation is too long.');
  return { message: message.trim(), history: parsed };
}

export function parseReply(value: unknown): SolReply {
  if (!value || typeof value !== 'object') throw new Error('Invalid reply.');
  const { answer, destinationIds } = value as Record<string, unknown>;
  if (typeof answer !== 'string' || !answer.trim() || answer.length > MAX_ANSWER_LENGTH ||
    !Array.isArray(destinationIds) || destinationIds.length > 3 || !destinationIds.every(isDestinationId)) {
    throw new Error('Invalid reply.');
  }
  return { answer: answer.trim(), destinationIds: [...new Set(destinationIds)] };
}

export function boundHistory(history: HistoryMessage[]): HistoryMessage[] {
  const bounded: HistoryMessage[] = [];
  let characters = 0;
  for (const item of history.slice(-MAX_HISTORY_MESSAGES).reverse()) {
    if (characters + item.content.length > MAX_HISTORY_CHARACTERS) break;
    bounded.unshift(item);
    characters += item.content.length;
  }
  return bounded;
}
