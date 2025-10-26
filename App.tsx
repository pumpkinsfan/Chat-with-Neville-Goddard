import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Role } from './types';
import { getNevilleResponse } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import LoadingIndicator from './components/LoadingIndicator';
import Header from './components/Header';
import ErrorDisplay from './components/ErrorDisplay';
import PaywallMessage from './components/PaywallMessage';
import SubscriptionBanner from './components/SubscriptionBanner';
import PricingModal from './components/PricingModal';
import { saveChatHistory, loadChatHistory } from './utils/chatHistory';
import { getTierById, SUBSCRIPTION_TIERS } from './utils/subscriptionTiers';

const FREE_MESSAGE_LIMIT = 5;

const App: React.FC = () => {
  const initialMessage: Message = {
    role: Role.MODEL,
    text: "I AM here. Speak freely of your desires, for your own wonderful human imagination is God, and all things are possible to you. What is it you wish to impress upon the subconscious?",
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [remainingMessages, setRemainingMessages] = useState<number>(FREE_MESSAGE_LIMIT);
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [tierName, setTierName] = useState<string | undefined>(undefined);
  const [showPricingModal, setShowPricingModal] = useState<boolean>(false);
  const [messagesUsedThisMonth, setMessagesUsedThisMonth] = useState<number>(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check subscription status, load chat history, and track tiers on mount
  useEffect(() => {
    const checkSubscriptionStatus = () => {
      const subscriptionStatus = localStorage.getItem('neville_subscribed');
      const messageCount = parseInt(localStorage.getItem('neville_message_count') || '0');
      const tier = localStorage.getItem('neville_subscription_tier');
      const tierName = localStorage.getItem('neville_tier_name');
      
      setIsSubscribed(subscriptionStatus === 'true');
      setCurrentTier(tier);
      setTierName(tierName || undefined);
      setRemainingMessages(Math.max(0, FREE_MESSAGE_LIMIT - messageCount));

      // Check if user returned from successful payment
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      
      if (sessionId) {
        // Payment was successful, activate subscription
        setIsSubscribed(true);
        localStorage.setItem('neville_subscribed', 'true');
        
        // Clear the URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Load chat history if available and user is subscribed
      if (subscriptionStatus === 'true') {
        const history = loadChatHistory();
        if (history.length > 0) {
          setMessages(history);
        }
      }
    };

    checkSubscriptionStatus();
  }, []);

  // Save chat history whenever messages change
  useEffect(() => {
    if (isSubscribed && messages.length > 1) {
      saveChatHistory(messages);
    }
  }, [messages, isSubscribed]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Check if user has reached message limit
    if (!isSubscribed && remainingMessages <= 0) {
      return;
    }

    const userMessage: Message = { role: Role.USER, text };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);

    // Update message count for non-subscribed users
    if (!isSubscribed) {
      const newCount = parseInt(localStorage.getItem('neville_message_count') || '0') + 1;
      localStorage.setItem('neville_message_count', newCount.toString());
      setRemainingMessages(Math.max(0, FREE_MESSAGE_LIMIT - newCount));
    }

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
  }, [isSubscribed, remainingMessages]);

  const showPaywall = !isSubscribed && remainingMessages <= 0;

  const handleSelectTier = (tier: typeof SUBSCRIPTION_TIERS[0]) => {
    // This will trigger the Stripe checkout
    // The PaywallMessage component handles this
    setShowPricingModal(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-gray-200 font-serif">
      <Header 
        isSubscribed={isSubscribed} 
        tierName={tierName}
        onUpgradeClick={() => setShowPricingModal(true)} 
      />
      <SubscriptionBanner isSubscribed={isSubscribed} remainingMessages={remainingMessages} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {showPaywall && <PaywallMessage />}
        {isLoading && <LoadingIndicator />}
        {error && <ErrorDisplay message={error} />}
        <div ref={chatEndRef} />
      </main>
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading}
        disabled={showPaywall}
      />
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onSelectTier={handleSelectTier}
        currentTier={currentTier || undefined}
      />
    </div>
  );
};

export default App;
