import React from 'react';
import { User, Bot, Play } from 'lucide-react';

function ChatMessage({ message }) {
  const playAudio = () => {
    if (message.audioUrl) {
      new Audio(message.audioUrl).play();
    }
  };

  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`flex items-start space-x-3 max-w-[80%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
      >
        <div
          className={`p-2 rounded-full border-2 ${message.isUser ? 'bg-blue-500 border-blue-600' : 'bg-gray-200 border-gray-300'}`}
        >
          {message.isUser ? <User size={24} className="text-white" /> : <Bot size={24} className="text-gray-600" />}
        </div>

        <div
          className={`relative p-4 rounded-xl shadow-md ${message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}
        >
          <p className="leading-relaxed">{message.text}</p>
          {message.audioUrl && (
            <button
              onClick={playAudio}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <Play size={16} className="text-current" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;