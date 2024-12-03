const axios = require('axios');
const googleTTS = require('google-tts-api'); // Import google-tts-api
require('dotenv').config(); // Load environment variables

// Rate limiting configuration
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // Minimum 1 second between requests

// Function to clean text for display and TTS
const cleanText = (text) => {
    return text
        .replace(/\*\*/g, '')                    // Remove bold markdown
        .replace(/\n\n/g, '. ')                  // Replace double newlines with period and space
        .replace(/\n/g, ' ')                     // Replace single newlines with space
        .replace(/\s*\*\s*/g, '')               // Remove bullet points with surrounding spaces
        .replace(/:\s+/g, ': ')                 // Clean up colons
        .replace(/\s+/g, ' ')                   // Replace multiple spaces with single space
        .replace(/\(\s+/g, '(')                 // Clean up opening parentheses
        .replace(/\s+\)/g, ')')                 // Clean up closing parentheses
        .replace(/\s+,/g, ',')                  // Clean up commas
        .replace(/\s+\./g, '.')                 // Clean up periods
        .replace(/\s+'/g, "'")                  // Clean up apostrophes
        .replace(/'\s+/g, "'")                  // Clean up apostrophes
        .replace(/\s+"/g, '"')                  // Clean up quotes
        .replace(/"\s+/g, '"')                  // Clean up quotes
        .trim();
};

// Function to generate TTS URLs for long texts
const generateTTSUrls = async (text) => {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        console.error('Invalid text input for TTS:', text);
        return [];
    }

    try {
        // Clean up the text
        const cleanedText = cleanText(text);
        console.log('Generating TTS URLs for cleaned text:', cleanedText);

        // Use getAllAudioUrls for the entire cleaned text
        const urls = googleTTS.getAllAudioUrls(cleanedText, {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
            splitPunct: ',.?!'
        });

        return urls;
    } catch (error) {
        console.error('Error generating TTS URLs:', error);
        return [];
    }
};

// Helper function to wait between requests
const waitForRateLimit = async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    lastRequestTime = Date.now();
};

// Function to generate disproven facts
const generateDisprovenFacts = async (userQuery, context = []) => {
    const geminiApiKey = process.env.geminiApiKey;

    if (!geminiApiKey) {
        throw new Error('Gemini API key not configured');
    }

    try {
        await waitForRateLimit();

        // Format the conversation history for the API
        const formattedMessages = context.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // Add the current query
        formattedMessages.push({
            role: 'user',
            parts: [{ text: userQuery }]
        });

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
            {
                contents: formattedMessages,
                generationConfig: {
                    temperature: 0.7,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 2048
                }
            }
        );

        console.log('Gemini API Response:', JSON.stringify(response.data, null, 2));

        let generatedText = '';
        if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            generatedText = response.data.candidates[0].content.parts[0].text;
        } else if (response.data?.candidates?.[0]?.content?.text) {
            generatedText = response.data.candidates[0].content.text;
        } else {
            throw new Error('Unable to generate response from Gemini API');
        }

        // Clean the text for display
        const cleanedText = cleanText(generatedText);

        // Generate TTS URLs for the response
        const ttsUrls = await generateTTSUrls(cleanedText);

        return {
            cleanedFacts: cleanedText,
            ttsUrls: ttsUrls
        };
    } catch (error) {
        console.error('Error generating facts:', error);
        if (error.response) {
            console.error('API Error Response:', error.response.data);
        }
        throw new Error('Failed to generate facts: ' + (error.message || 'Unknown error'));
    }
};

module.exports = { generateDisprovenFacts };
