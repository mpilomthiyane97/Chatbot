import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaUser, FaPlus, FaPlay, FaPause, FaSignOutAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [audioStates, setAudioStates] = useState({});
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Check for authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Add token to headers for authenticated requests
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/history`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
          }
          return;
        }

        const data = await response.json();
        if (data.history) {
          // Transform the chat history to match our message format
          const formattedHistory = data.history?.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.text,
            audioUrl: msg.audioUrl || null
          })) || [];
          setMessages(formattedHistory);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const newMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userQuery: inputMessage }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response.cleanedFacts || data.response, 
        audioUrl: data.response.ttsUrls ? data.response.ttsUrls[0]?.url : null 
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/clear`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setMessages([]);
      toast.success('Started new chat');
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast.error('Failed to start new chat');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const playAudio = async (audioUrls, messageId) => {
    try {
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      // Reset all audio states except for the current one
      setAudioStates(prev => {
        const newStates = {};
        Object.keys(prev).forEach(key => {
          newStates[key] = key === messageId ? prev[key] : false;
        });
        return newStates;
      });

      if (!Array.isArray(audioUrls)) {
        audioUrls = [audioUrls];
      }

      // Create and play audio sequentially
      for (let i = 0; i < audioUrls.length; i++) {
        const audioUrl = audioUrls[i];
        const audio = new Audio(`${process.env.REACT_APP_BACKEND_URL}/proxy-tts?url=${encodeURIComponent(audioUrl)}`);
        
        setCurrentAudio(audio);
        setAudioStates(prev => ({ ...prev, [messageId]: true }));
        
        // Wait for the current audio to finish before playing the next one
        await new Promise((resolve, reject) => {
          audio.onended = resolve;
          audio.onerror = reject;
          audio.play().catch(reject);
        });
      }

      // Reset state after all audio files have played
      setAudioStates(prev => ({ ...prev, [messageId]: false }));
      setCurrentAudio(null);
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error('Failed to play audio');
      setAudioStates(prev => ({ ...prev, [messageId]: false }));
      setCurrentAudio(null);
    }
  };

  const toggleAudio = (audioUrls, messageId) => {
    if (audioStates[messageId]) {
      // If audio is playing, stop it
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      setAudioStates(prev => ({ ...prev, [messageId]: false }));
      setCurrentAudio(null);
    } else {
      // If audio is not playing, start it
      playAudio(audioUrls, messageId);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-20">
          <div
            className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 blur-3xl"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
              transition: 'transform 0.2s ease-out',
            }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="relative flex flex-col h-screen p-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full blur-lg opacity-30" />
              <div className="relative bg-gray-800 rounded-full w-full h-full flex items-center justify-center backdrop-blur-xl border border-gray-600">
                <FaRobot className="text-xl text-gray-300" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-white">
              CurioBot
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewChat}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 bg-opacity-50 rounded-xl backdrop-blur-lg border border-gray-600 hover:bg-opacity-70 transition-all duration-200"
            >
              <FaPlus className="text-sm text-gray-300" />
              <span className="text-gray-300">New Chat</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-900 bg-opacity-20 rounded-xl backdrop-blur-lg border border-red-800 border-opacity-20 hover:bg-opacity-30 transition-all duration-200"
            >
              <FaSignOutAlt className="text-sm text-gray-300" />
              <span className="text-gray-300">Logout</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <AnimatePresence>
            {Array.isArray(messages) && messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full blur-lg opacity-30" />
                    <div className="relative bg-gray-800 rounded-full w-full h-full flex items-center justify-center backdrop-blur-xl border border-gray-700">
                      <FaRobot className="text-sm text-gray-300" />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-gray-700 bg-opacity-50 ml-auto'
                      : 'bg-gray-800 bg-opacity-50'
                  } rounded-2xl p-4 backdrop-blur-lg border border-gray-600`}
                >
                  <p className="text-gray-200">{message.content}</p>
                  {message.audioUrl && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleAudio(message.audioUrl, index)}
                      className="mt-2 flex items-center space-x-2 px-3 py-1 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all duration-200"
                    >
                      {audioStates[index] ? <FaPause className="text-sm text-gray-300" /> : <FaPlay className="text-sm text-gray-300" />}
                      <span className="text-sm text-gray-300">Listen</span>
                    </motion.button>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full blur-lg opacity-30" />
                    <div className="relative bg-gray-800 rounded-full w-full h-full flex items-center justify-center backdrop-blur-xl border border-gray-700">
                      <FaUser className="text-sm text-gray-300" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="relative">
          <motion.form
            onSubmit={handleSendMessage}
            className="flex items-center space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-800 bg-opacity-50 backdrop-blur-lg border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-200 placeholder-gray-400"
            />
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gray-700 bg-opacity-50 backdrop-blur-lg border border-gray-600 rounded-xl hover:bg-opacity-70 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-gray-300">Send</span>
            </motion.button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
