import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaRobot, FaArrowRight } from 'react-icons/fa';

const WelcomeScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 blur-3xl" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-4xl mx-auto text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="inline-block mb-8"
        >
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full blur-lg opacity-30" />
            <div className="relative bg-gray-800 rounded-full w-full h-full flex items-center justify-center backdrop-blur-xl border border-gray-600">
              <FaRobot className="text-4xl text-gray-300" />
            </div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-white"
        >
          Welcome to CurioBot
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
        >
          Explore the fascinating world of AI-powered conversations and discover amazing facts about anything you're curious about.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center gap-2 px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-gray-200 font-medium transition-all duration-200 border border-gray-600"
            >
              Get Started
              <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
            </motion.button>
          </Link>
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gray-800 bg-opacity-50 hover:bg-opacity-70 rounded-xl text-gray-300 font-medium transition-all duration-200 border border-gray-700"
            >
              Sign In
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          {[
            {
              title: "AI-Powered",
              description: "Advanced AI technology for natural conversations",
            },
            {
              title: "Real-Time",
              description: "Instant responses and fact verification",
            },
            {
              title: "Voice Enabled",
              description: "Listen to responses with text-to-speech",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-200 mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
