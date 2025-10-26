import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Role, User } from './types';
import { getNevilleResponse } from './services/geminiService';
import { authService } from './services/authService';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import LoadingIndicator from './components/LoadingIndicator';
import Header from './components/Header';
import ErrorDisplay from './components/ErrorDisplay';
import PaywallMessage from './components/PaywallMessage';
import SubscriptionBanner from './components/SubscriptionBanner';
import PricingModal from './components/PricingModal';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import AdminDashboard from './components/AdminDashboard';
import { saveChatHistory, loadChatHistory } from './utils/chatHistory';
import { getTierById, SUBSCRIPTION_TIERS } from './utils/subscriptionTiers';

const FREE_MESSAGE_LIMIT = 5;

type AuthState = 'loading' | 'login' | 'register' | 'authenticated' | 'admin';

const App: React.FC = () => {
  const initialMessage: Message = {
    role: Role.MODEL,
    text: "I AM here. Speak freely of your desires, for your own wonderful human imagination is God, and all things are possible to you. What is it you wish to impress upon the subconscious?",
  };

  const [authState, setAuthState] = useState<AuthState>('loading');
  const [user, setUser] = useState<User | null>(null);
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

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsSubscribed(currentUser.subscriptionTier !== null);
          setCurrentTier(currentUser.subscriptionTier);
          setTierName(currentUser.subscriptionTier ? getTierById(currentUser.subscriptionTier)?.name : undefined);
          setMessagesUsedThisMonth(currentUser.messagesUsedThisMonth);
          setRemainingMessages(authService.getRemainingMessages());
          
          // Load chat history if user is subscribed
          if (currentUser.subscriptionTier) {
            const history = loadChatHistory();
            if (history.length > 0) {
              setMessages(history);
            }
          }

          // Check if user is admin
          if (currentUser.role === 'admin') {
            setAuthState('admin');
          } else {
            setAuthState('authenticated');
          }
        } else {
          setAuthState('login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthState('login');
      }
    };

    checkAuthStatus();
  }, []);

  // Save chat history whenever messages change
  useEffect(() => {
    if (isSubscribed && messages.length > 1) {
      saveChatHistory(messages);
    }
  }, [messages, isSubscribed]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !user) return;

    // Check if user can send messages
    if (!authService.canSendMessage()) {
      return;
    }

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

      // Update message count
      const newCount = messagesUsedThisMonth + 1;
      setMessagesUsedThisMonth(newCount);
      setRemainingMessages(authService.getRemainingMessages());
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`A problem occurred while reaching the infinite. Please try again. (${errorMessage})`);
      // Revert the user message if the API call fails
      setMessages(prev => prev.slice(0, prev.length -1));
    } finally {
      setIsLoading(false);
    }
  }, [user, messagesUsedThisMonth]);

  const showPaywall = !isSubscribed && remainingMessages <= 0;

  const handleSelectTier = (tier: typeof SUBSCRIPTION_TIERS[0]) => {
    // This will trigger the Stripe checkout
    // The PaywallMessage component handles this
    setShowPricingModal(false);
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setIsSubscribed(loggedInUser.subscriptionTier !== null);
    setCurrentTier(loggedInUser.subscriptionTier);
    setTierName(loggedInUser.subscriptionTier ? getTierById(loggedInUser.subscriptionTier)?.name : undefined);
    setMessagesUsedThisMonth(loggedInUser.messagesUsedThisMonth);
    setRemainingMessages(authService.getRemainingMessages());
    
    if (loggedInUser.role === 'admin') {
      setAuthState('admin');
    } else {
      setAuthState('authenticated');
    }
  };

  const handleRegister = (registeredUser: User) => {
    setUser(registeredUser);
    setAuthState('authenticated');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsSubscribed(false);
    setCurrentTier(null);
    setTierName(undefined);
    setMessagesUsedThisMonth(0);
    setRemainingMessages(FREE_MESSAGE_LIMIT);
    setMessages([initialMessage]);
    setAuthState('login');
  };

  // Show loading state
  if (authState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-amber-300 text-lg">Loading...</div>
      </div>
    );
  }

  // Show admin dashboard
  if (authState === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // Show login form
  if (authState === 'login') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <LoginForm 
          onLogin={handleLogin}
          onSwitchToRegister={() => setAuthState('register')}
        />
      </div>
    );
  }

  // Show register form
  if (authState === 'register') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <RegisterForm 
          onRegister={handleRegister}
          onSwitchToLogin={() => setAuthState('login')}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-gray-200 font-serif">
      <Header 
        isSubscribed={isSubscribed} 
        tierName={tierName}
        onUpgradeClick={() => setShowPricingModal(true)}
        onLogout={handleLogout}
        userEmail={user?.email}
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
