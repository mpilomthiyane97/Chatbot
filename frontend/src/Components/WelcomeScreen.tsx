import React from 'react';
import { Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

function WelcomeScreen({ onStartChat }) {
  return (
    <div className="bg-blue-500 text-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
      <Bot className="mx-auto mb-6 w-24 h-24" />
      <h1 className="text-3xl font-bold mb-4">How can I help you?</h1>
      
      <button
        onClick={onStartChat}
        className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-full hover:bg-blue-100 transition duration-300 mb-4"
      >
        Start a new chat
      </button>
      
      <Link to="/login">
        <button className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-full hover:bg-blue-100 transition duration-300 mb-2">
          Login
        </button>
      </Link>

      <Link to="/register">
        <button className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-full hover:bg-blue-100 transition duration-300">
          Register
        </button>
      </Link>
    </div>
  );
}

export default WelcomeScreen;