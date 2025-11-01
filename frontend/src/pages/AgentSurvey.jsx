import React, { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';

const systemInstruction = {
  /* same as your code */
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
      toast.error('Something went wrong.');
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
    <div
      className='flex flex-col h-[calc(100vh-80px)] max-w-3xl mx-auto p-4 bg-gradient-to-br from-white via-blue-50 to-blue-100'
      data-theme='light'
    >
      <Toaster position='top-right' />

      {/* Chat Window */}
      <div className='flex-1 overflow-y-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-200 space-y-4'>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat ${
              msg.role === 'user' ? 'chat-end' : 'chat-start'
            }`}
          >
            <div className='chat-image avatar'>
              <div className='w-10 rounded-full bg-blue-100 flex items-center justify-center'>
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
            </div>
            <div
              className={`chat-bubble text-gray-800 ${
                msg.role === 'user'
                  ? 'chat-bubble-primary bg-blue-500 text-white shadow-md'
                  : 'chat-bubble-secondary bg-gray-100 text-gray-800 shadow-sm'
              }`}
            >
              {msg.parts[0].text}
            </div>
          </div>
        ))}

        {isLoading && !assessment && (
          <div className='chat chat-start'>
            <div className='chat-image avatar'>
              <div className='w-10 rounded-full bg-blue-100 flex items-center justify-center'>
                🤖
              </div>
            </div>
            <div className='chat-bubble bg-gray-100 text-gray-800 shadow-sm'>
              <span className='loading loading-dots loading-md'></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Assessment Section */}
      {assessment ? (
        <div className='card bg-gradient-to-br from-white to-blue-50 shadow-xl border border-blue-200 mt-4'>
          <div className='card-body'>
            <h2 className='card-title text-2xl flex items-center text-blue-700'>
              📋 Your Assessment
            </h2>
            <div className='text-center my-4'>
              <div
                className={`radial-progress ${
                  assessment.severityScore > 7
                    ? 'text-red-500'
                    : assessment.severityScore > 4
                    ? 'text-yellow-500'
                    : 'text-green-500'
                }`}
                style={{
                  '--value': assessment.severityScore * 10,
                  '--size': '6rem',
                  '--thickness': '8px',
                }}
              >
                <span className='font-bold text-xl text-gray-800'>
                  {assessment.severityScore}
                </span>
                /10
              </div>
              <p className='font-semibold mt-2 text-gray-700'>Severity Score</p>
            </div>
            <p className='mb-2 text-gray-700 leading-relaxed'>
              {assessment.assessment}
            </p>
            {assessment.keyAreas && (
              <div className='mt-4'>
                <h3 className='font-semibold mb-2 text-gray-800'>
                  Key Areas of Concern:
                </h3>
                <div className='flex flex-wrap gap-2'>
                  {assessment.keyAreas.map((area, i) => (
                    <div
                      key={i}
                      className='badge badge-error badge-lg text-white'
                    >
                      {area}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSend} className='flex gap-2 mt-4'>
          <input
            type='text'
            className='input input-bordered flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition'
            placeholder='Type your answer...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type='submit'
            className='btn bg-blue-500 hover:bg-blue-600 text-white rounded-lg'
            disabled={isLoading}
          >
            {isLoading ? (
              <span className='loading loading-spinner'></span>
            ) : (
              <span>➤</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default AgentSurvey;
