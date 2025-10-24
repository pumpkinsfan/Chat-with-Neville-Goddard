import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Role } from './types';
import { getNevilleResponse } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import LoadingIndicator from './components/LoadingIndicator';
import Header from './components/Header';
import ErrorDisplay from './components/ErrorDisplay';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: Role.MODEL,
      text: "I AM here. Speak freely of your desires, for your own wonderful human imagination is God, and all things are possible to you. What is it you wish to impress upon the subconscious?",
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: Role.USER, text };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const nevilleResponse = await getNevilleResponse(text);
      const nevilleMessage: Message = { 
        role: Role.MODEL, 
        text: nevilleResponse.text,
        sources: nevilleResponse.sources 
      };
      setMessages((prevMessages) => [...prevMessages, nevilleMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`A problem occurred while reaching the infinite. Please try again. (${errorMessage})`);
      // Revert the user message if the API call fails
      setMessages(prev => prev.slice(0, prev.length -1));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-gray-200 font-serif">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isLoading && <LoadingIndicator />}
        {error && <ErrorDisplay message={error} />}
        <div ref={chatEndRef} />
      </main>
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;
