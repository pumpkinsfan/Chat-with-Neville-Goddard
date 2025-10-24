import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Role } from './types';
import { getNevilleResponse } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import LoadingIndicator from './components/LoadingIndicator';
import Header from './components/Header';
import ErrorDisplay from './components/ErrorDisplay';

const getDynamicGreeting = (): string => {
  const greetings = [
    "I AM here, my friend. Tell me, what is it that troubles you in your journey of manifestation? What desire burns within your heart that you feel has yet to materialize?",
    "Welcome, dear one. I sense you have come seeking guidance on the law of assumption. What is it you are struggling to bring into your reality?",
    "I AM present with you now. What questions do you carry about the power of imagination? What is it you wish to understand about living in the end?",
    "Greetings, my beloved. I see you have come to explore the mysteries of consciousness. What is it that you are trying to manifest, and where do you feel you are stumbling?",
    "I AM here to guide you. What is it that you desire to create in your world? What questions do you have about the law that governs all manifestation?",
    "Welcome, dear soul. I feel your seeking heart. What is it you are struggling with in your practice of the law of assumption?",
    "I AM with you now. Tell me, what is it you wish to understand about the power of your imagination? What desire calls to you from the depths of your being?",
    "Greetings, my friend. I sense your earnest seeking. What is it you are trying to manifest, and what obstacles do you feel are standing in your way?",
    "I AM here to help you understand the law. What questions do you have about living in the end? What is it you are struggling to bring into your reality?",
    "Welcome, dear one. I see you have come seeking the truth about manifestation. What is it you desire to create, and where do you feel you need guidance?"
  ];
  
  return greetings[Math.floor(Math.random() * greetings.length)];
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: Role.MODEL,
      text: getDynamicGreeting(),
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<Message[][]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveCurrentChat = () => {
    if (messages.length > 1) { // Only save if there's more than just the greeting
      setChatHistory(prev => [...prev, [...messages]]);
    }
  };

  const startNewChat = () => {
    saveCurrentChat();
    setMessages([{
      role: Role.MODEL,
      text: getDynamicGreeting(),
    }]);
    setShowHistory(false);
  };

  const loadChat = (chatIndex: number) => {
    if (chatHistory[chatIndex]) {
      setMessages(chatHistory[chatIndex]);
      setShowHistory(false);
    }
  };

  const deleteChat = (chatIndex: number) => {
    setChatHistory(prev => prev.filter((_, index) => index !== chatIndex));
  };

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
        {!showHistory ? (
          <>
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            {isLoading && <LoadingIndicator />}
            {error && <ErrorDisplay message={error} />}
            <div ref={chatEndRef} />
          </>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-amber-100">Chat History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
              >
                Back to Chat
              </button>
            </div>
            <div className="space-y-4">
              {chatHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p>No chat history yet. Start a conversation to see it here!</p>
                </div>
              ) : (
                chatHistory.map((chat, index) => (
                  <div key={index} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-sm text-slate-400">
                        Chat {index + 1} • {chat.length} messages
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadChat(index)}
                          className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded text-xs font-semibold transition-all duration-200"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteChat(index)}
                          className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs font-semibold transition-all duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-slate-300">
                      <p className="truncate">
                        {chat[0]?.text.substring(0, 100)}...
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
      {!showHistory && (
        <div className="bg-slate-800/80 backdrop-blur-sm p-4 border-t border-amber-500/20 flex-shrink-0">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            <button
              onClick={() => setShowHistory(true)}
              className="bg-slate-700 hover:bg-slate-600 text-gray-200 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
            >
              View History
            </button>
            <button
              onClick={startNewChat}
              className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
            >
              New Chat
            </button>
          </div>
        </div>
      )}
      {!showHistory && <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />}
    </div>
  );
};

export default App;
