import React, { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';

const systemInstruction = {
  // same as your code
};

const AgentSurvey = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const chatEndRef = useRef(null);

  const apiKey = 'AIzaSyD3-qPZyWY83tV-irlzUCc6EyDxm1ggI4o';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const callGeminiAPI = async (chatHistory) => {
    setIsLoading(true);
    try {
      const payload = { contents: chatHistory, systemInstruction };
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      const jsonMatch = text?.match(/{[\s\S]*}/);

      if (jsonMatch && jsonMatch[0]) {
        const parsedAssessment = JSON.parse(jsonMatch[0]);
        setAssessment(parsedAssessment);
        const introText = text.substring(0, jsonMatch.index).trim();
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            parts: [
              { text: introText || 'Thank you for completing the survey!' },
            ],
          },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: 'model', parts: [{ text }] }]);
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    callGeminiAPI([
      {
        role: 'user',
        parts: [{ text: "Hello, I'm ready to start the survey." }],
      },
    ]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, assessment]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || assessment) return;
    const userMessage = { role: 'user', parts: [{ text: input }] };
    const newChatHistory = [...messages, userMessage];
    setMessages(newChatHistory);
    setInput('');
    await callGeminiAPI(newChatHistory);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center justify-center p-6'>
      <Toaster position='top-right' />

      <div className='w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl'>
        {/* Header */}
        <div className='px-6 pt-6 pb-3 border-b border-gray-100 text-center'>
          <h1 className='text-2xl font-bold text-blue-700'>
            AI Survey Assistant 🤖
          </h1>
          <p className='text-gray-500 text-sm mt-1'>
            Chat with the AI and receive your personalized assessment.
          </p>
        </div>

        {/* Chat Window */}
        <div className='flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gradient-to-br from-white to-blue-50'>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role !== 'user' && (
                <div className='flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl'>
                  🤖
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                {msg.parts[0].text}
              </div>
              {msg.role === 'user' && (
                <div className='flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl'>
                  👤
                </div>
              )}
            </div>
          ))}

          {isLoading && !assessment && (
            <div className='flex items-start gap-3'>
              <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl'>
                🤖
              </div>
              <div className='bg-gray-100 text-gray-700 px-4 py-2 rounded-2xl shadow-sm animate-pulse'>
                Typing...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Assessment Section */}
        {assessment ? (
          <div className='p-6 border-t border-gray-200 bg-gradient-to-br from-white to-blue-50'>
            <h2 className='text-xl font-semibold text-blue-700 mb-3'>
              📋 Your Assessment
            </h2>

            {/* Severity circle */}
            <div className='flex flex-col items-center mb-4'>
              <div
                className={`relative w-24 h-24 rounded-full flex items-center justify-center font-bold text-2xl ${
                  assessment.severityScore > 7
                    ? 'bg-red-100 text-red-600'
                    : assessment.severityScore > 4
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-green-100 text-green-600'
                } shadow-md`}
              >
                {assessment.severityScore}/10
              </div>
              <p className='mt-2 text-gray-700 font-medium'>Severity Score</p>
            </div>

            {/* Assessment text */}
            <p className='text-gray-700 leading-relaxed mb-3'>
              {assessment.assessment}
            </p>

            {/* Key Areas */}
            {assessment.keyAreas && assessment.keyAreas.length > 0 && (
              <div>
                <h3 className='font-semibold text-gray-800 mb-2'>
                  Key Areas of Concern:
                </h3>
                <div className='flex flex-wrap gap-2'>
                  {assessment.keyAreas.map((area, i) => (
                    <span
                      key={i}
                      className='px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-medium'
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Input Field
          <form
            onSubmit={handleSend}
            className='flex items-center gap-3 border-t border-gray-100 p-4 bg-white'
          >
            <input
              type='text'
              className='flex-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all'
              placeholder='Type your answer...'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type='submit'
              disabled={isLoading}
              className='px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all'
            >
              {isLoading ? '...' : 'Send ➤'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AgentSurvey;
