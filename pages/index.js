import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Head from 'next/head';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() !== '') {
      const newUserMessage = { role: 'user', content: inputMessage };
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      setInputMessage('');
      setIsAiTyping(true);

      try {
        const response = await fetch('/api/claude', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: [...messages, newUserMessage] }),
        });

        if (!response.ok) {
          throw new Error('API response was not ok');
        }

        const data = await response.json();
        setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: data.response }]);
      } catch (error) {
        console.error('Error calling API:', error);
        setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: "I'm sorry, I'm having trouble responding right now. Please try again later." }]);
      } finally {
        setIsAiTyping(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-green-50">
      <Head>
        <title>Leena</title>
      </Head>
      <header className="bg-white shadow-sm p-4 flex items-center justify-center">
        <svg className="w-6 h-6 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M12 6v12M12 12l-4-4M12 12l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <h1 className="text-2xl font-semibold text-center text-blue-600">Leena</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-3xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-5/6 text-gray-500">
            <Image
              src="/welcome-illustration.svg"
              alt="Welcome to Leena"
              width={200}
              height={200}
            />
            <p className="mt-4 text-lg">Hey, it's Leena! What's on your mind? 👋</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-2xl px-4 py-2 max-w-sm ${message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 shadow-md'
                    }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isAiTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-200 rounded-2xl px-4 py-2 max-w-sm">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      <footer className="bg-white border-t p-4 max-w-3xl mx-auto w-full">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Send a message to Leena"
            className="flex-1 rounded-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent px-4 py-2"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-full px-6 py-2 hover:bg-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}