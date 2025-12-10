import React, { useState, useEffect, useRef, useMemo } from 'react';
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import WelcomeScreen from './components/WelcomeScreen';
import Toast from './components/Toast';
import { ChatMessage as ChatMessageType } from './types';
import { sendMessage } from './services/geminiService';

const App: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showWelcome, setShowWelcome] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleStartChat = () => {
        setShowWelcome(false);
        setMessages([
            {
                role: 'model',
                parts: "Ho ho ho! Merry Christmas! I'm Santa Claus. What's your name and what would you like for Christmas this year?",
            }
        ]);
    };

    /**
     * Handles sending user messages to the Gemini service.
     * It updates the chat with the user's message, sets loading state,
     * calls the AI service with the full, updated conversation history,
     * and then updates the chat with the model's response.
     */
    const handleSendMessage = async (message: Omit<ChatMessageType, 'role'>) => {
        const userMessage: ChatMessageType = { role: 'user', ...message };
        // Create the new messages array that includes the latest user message
        const newMessages = [...messages, userMessage];
        setMessages(newMessages); // Update the UI immediately

        setIsLoading(true);
        setError(null);

        try {
            // Pass the up-to-date message history to the service to ensure context is maintained.
            const modelResponse = await sendMessage(newMessages, message);
            setMessages(prev => [...prev, modelResponse]);
        } catch (err) {
            console.error(err);
            setError("Oops! There was a glitch in the North Pole. Please try again.");
            // Add a generic error message to the chat
            setMessages(prev => [...prev, {
                role: 'model',
                parts: "Oh dear, my elves are telling me there's a bit of a snowstorm interfering with our connection. Could you try again?"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (showWelcome) {
        return <WelcomeScreen onStart={handleStartChat} />;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50 font-sans">
            <Header />
            <main className="flex-1 overflow-y-auto p-4 md:px-6">
                <div className="max-w-3xl mx-auto">
                    {messages.map((msg, index) => (
                        <ChatMessage key={index} message={msg} />
                    ))}
                    {isLoading && (
                        <div className="flex justify-start my-2">
                            <div className="flex gap-2 items-center">
                                <img src="https://img.icons8.com/plasticine/100/santa.png" alt="Santa" className="w-10 h-10 rounded-full" />
                                <div className="bg-red-100 p-3 rounded-t-xl rounded-br-xl shadow-md flex items-center" style={{ minWidth: '4rem', height: '2.75rem' }}>
                                    <div className="flex gap-2 items-center justify-center w-full text-2xl">
                                        <span style={{ animation: 'twinkle 1.4s infinite ease-in-out' }}>✨</span>
                                        <span style={{ animation: 'twinkle 1.4s infinite ease-in-out 0.2s' }}>✨</span>
                                        <span style={{ animation: 'twinkle 1.4s infinite ease-in-out 0.4s' }}>✨</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>
            <footer className="bg-white p-2 md:p-4 border-t sticky bottom-0">
                <div className="max-w-3xl mx-auto">
                    <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
                </div>
            </footer>
            <Toast message={error} onClose={() => setError(null)} />
        </div>
    );
};

export default App;