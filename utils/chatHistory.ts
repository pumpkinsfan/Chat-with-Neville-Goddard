import { Message } from '../types';

const CHAT_HISTORY_KEY = 'neville_chat_history';
const MAX_HISTORY_MESSAGES = 100; // Keep last 100 messages

export function saveChatHistory(messages: Message[]): void {
  try {
    const historyToSave = messages.slice(-MAX_HISTORY_MESSAGES); // Keep last N messages
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(historyToSave));
  } catch (error) {
    console.error('Failed to save chat history:', error);
  }
}

export function loadChatHistory(): Message[] {
  try {
    const historyJson = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!historyJson) return [];
    
    const history = JSON.parse(historyJson);
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return [];
  }
}

export function clearChatHistory(): void {
  try {
    localStorage.removeItem(CHAT_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear chat history:', error);
  }
}

export function hasChatHistory(): boolean {
  try {
    const historyJson = localStorage.getItem(CHAT_HISTORY_KEY);
    return !!historyJson && JSON.parse(historyJson).length > 0;
  } catch {
    return false;
  }
}

