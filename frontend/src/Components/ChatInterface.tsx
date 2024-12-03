import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Play, Pause, Trash2 } from 'lucide-react';
import ChatMessage from './ChatMessage';
import axios from 'axios';

function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef(null);
  const [audioQueue, setAudioQueue] = useState([]);
  const [audioIndex, setAudioIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch chat history when component mounts
  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/chat/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const clearChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/chat/history', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = { text: input, isUser: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userQuery: input }),
      });

      const data = await response.json();
      const { cleanedFacts, ttsUrls } = data.response || {};

      const botMessage = {
        text: cleanedFacts || 'Default response from bot',
        isUser: false,
        audioUrl: ttsUrls && ttsUrls.length > 0 ? ttsUrls[0].url : null,
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);

      if (ttsUrls && ttsUrls.length > 0) {
        setAudioQueue(ttsUrls.map(tts => tts.url));
        setAudioIndex(0);
        playNextAudio(0, ttsUrls.map(tts => tts.url));
      }
    } catch (error) {
      console.error('Error fetching response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const playNextAudio = (index, ttsUrls) => {
    if (index < ttsUrls.length) {
      const url = ttsUrls[index];
      const proxyUrl = `http://localhost:5000/proxy-tts?url=${encodeURIComponent(url)}`;

      axios.get(proxyUrl, { responseType: 'arraybuffer' })
        .then((response) => {
          const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
          const audio = new Audio(URL.createObjectURL(audioBlob));

          audioRef.current = audio;
          // ... rest of the code remains the same ...
        });
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center p-4 bg-gray-100">
        <h2 className="text-xl font-semibold">Chat with AI</h2>
        <button
          onClick={clearChatHistory}
          className="p-2 text-red-500 hover:bg-red-100 rounded-full"
          title="Clear chat history"
        >
          <Trash2 size={20} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage key={index} {...message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ... rest of the code remains the same ... */}
    </div>
  );
}