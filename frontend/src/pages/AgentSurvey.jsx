import React, { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import api from '../api/axios'; // Import your custom Axios instance

// Check for Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const synthesis = window.speechSynthesis;

const AgentSurvey = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true); 
  const [voices, setVoices] = useState([]); 
  const [conversationStarted, setConversationStarted] = useState(false); 
  
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // --- REMOVED API KEY AND URL ---
  // We will now call our OWN backend securely
  const secureApiUrl = '/api/agent/chat';

  // --- Load voices on mount ---
  useEffect(() => {
    const loadVoices = () => {
      setVoices(synthesis.getVoices());
    };
    synthesis.onvoiceschanged = loadVoices;
    loadVoices(); 
  }, []);

  // --- Text-to-Speech (TTS) Function ---
  const speakText = (text) => {
    if (!synthesis || !isSpeakingEnabled) return;
    synthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (text.match(/[\u0900-\u097F]/)) { 
      const hindiVoice = voices.find(v => v.lang === 'hi-IN');
      if (hindiVoice) {
        utterance.voice = hindiVoice;
        utterance.lang = 'hi-IN';
      }
    } else {
      utterance.lang = 'en-US';
    }
    synthesis.speak(utterance);
  };

  // --- UPDATED: This function now calls YOUR backend ---
  const callAgentAPI = async (chatHistory) => {
    setIsLoading(true);
    try {
      // We send the chat history to our secure backend endpoint
      const response = await api.post(secureApiUrl, {
        chatHistory: chatHistory 
      });

      // The backend processes, calls Google, saves to DB, and returns the AI's response
      const { text, assessmentData } = response.data;

      if (!text) {
        throw new Error("Received an empty response from the agent.");
      }

      // If the backend sent assessment data, it means the survey is done
      if (assessmentData) {
        setAssessment(assessmentData);
        setMessages((prev) => [
          ...prev,
          { role: 'model', parts: [{ text }] }, // This text includes the planner handoff
        ]);
        speakText(text);
      } else {
        // This is just a normal back-and-forth question
        setMessages((prev) => [...prev, { role: 'model', parts: [{ text }] }]);
        speakText(text); 
      }
    } catch (err) {
      console.error("Agent API Error:", err);
      const errorMsg = err.response?.data?.message || 'Failed to get response from agent.';
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Speech-to-Text (STT) Setup ---
  useEffect(() => {
    if (!SpeechRecognition) {
      if (messages.length === 0) { 
        toast.error("Sorry, your browser doesn't support speech recognition.");
      }
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; 

    recognition.onstart = () => {
      setIsListening(true);
      toast.success("Listening...");
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      toast.error(`Speech error: ${event.error}`);
      setIsListening(false);
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript); 
      const userMessage = { role: 'user', parts: [{ text: transcript }] };
      // We MUST use the functional form of setMessages to get the latest state
      setMessages((prevMessages) => {
        const newChatHistory = [...prevMessages, userMessage];
        callAgentAPI(newChatHistory);
        return newChatHistory;
      });
      setInput(''); 
    };
    
    recognitionRef.current = recognition;
  }, [voices]); // Removed 'messages' from dependency array to prevent re-creation

  // --- Function to start the chat ---
  const startChat = (language) => {
    let firstMessage;
    if (language === 'hi') {
      firstMessage = "नमस्ते, मैं सर्वेक्षण शुरू करने के लिए तैयार हूँ।";
    } else {
      firstMessage = "Hello, I'm ready to start the survey.";
    }
    
    const startMessage = { role: 'user', parts: [{ text: firstMessage }] };
    setMessages([startMessage]); 
    callAgentAPI([startMessage]);
    setConversationStarted(true);
  };

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, assessment]);

  // Handle TEXT send
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || assessment) return;
    const userMessage = { role: 'user', parts: [{ text: input }] };
    const newChatHistory = [...messages, userMessage];
    setMessages(newChatHistory);
    setInput('');
    await callAgentAPI(newChatHistory);
  };
  
  // Handle MIC button click
  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      const lastBotMessage = messages.slice().reverse().find(m => m.role === 'model');
      if (lastBotMessage && lastBotMessage.parts[0].text.match(/[\u0900-\u097F]/)) {
        recognitionRef.current.lang = 'hi-IN';
      } else {
        recognitionRef.current.lang = 'en-US';
      }
      recognitionRef.current.start();
    }
  };

  // Handle SPEAKER button click
  const toggleSpeaking = () => {
    if (isSpeakingEnabled) {
      synthesis.cancel(); 
      setIsSpeakingEnabled(false);
    } else {
      setIsSpeakingEnabled(true);
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'model') {
        speakText(lastMessage.parts[0].text);
      }
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center justify-center p-6'>
      <Toaster position='top-right' />

      <div className='w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl'>
        {/* Header */}
        <div className='px-6 pt-6 pb-3 border-b border-gray-100 flex justify-between items-center'>
          <div className='text-center flex-1'>
             <h1 className='text-2xl font-bold text-blue-700'>
              AI Survey Assistant 🤖
            </h1>
            <p className='text-gray-500 text-sm mt-1'>
              Chat with the AI and receive your personalized assessment.
            </p>
          </div>
          {/* Speaker Toggle Button */}
          <button 
            onClick={toggleSpeaking} 
            className={`btn btn-ghost btn-circle ${isSpeakingEnabled ? 'text-blue-600' : 'text-gray-400'}`}
            title={isSpeakingEnabled ? "Disable Speech" : "Enable Speech"}
          >
            {isSpeakingEnabled ? '🔈' : '🔇'}
           </button>
        </div>

        {/* --- NEW: Language Start Screen --- */}
        {!conversationStarted ? (
          <div className="flex flex-col items-center justify-center p-10" style={{ minHeight: '400px' }}>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Welcome!</h2>
            <p className="text-gray-600 mb-6 text-center">Please select your preferred language to begin the survey.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => startChat('en')}
                 className="btn btn-primary"
              >
                Start in English
              </button>
              <button 
                onClick={() => startChat('hi')}
                className="btn btn-accent"
              >
                सर्वेक्षण हिंदी में शुरू करें
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Window */}
             <div className='flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gradient-to-br from-white to-blue-50' style={{ minHeight: '400px', maxHeight: '60vh' }}>
              {/* We slice(1) to hide the first "Hello, I'm ready" message */}
              {messages.slice(1).map((msg, index) => (
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
                  <div className='flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl'>
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
              			assessment.percentageScore > 70 // Updated to percentageScore
              					? 'bg-red-100 text-red-600'
              					: assessment.percentageScore > 40
              					? 'bg-yellow-100 text-yellow-600'
            						: 'bg-green-100 text-green-600'
            				} shadow-md`}
              		>
              			{Math.round(assessment.percentageScore)}% 
              		</div>
              		<p className='mt-2 text-gray-700 font-medium'>Dependency Score</p>
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
                  placeholder={isListening ? "Listening..." : "Type your answer..."}
                   value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                {/* Microphone Button */}
                {SpeechRecognition && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={isLoading}
                    className={`px-4 py-2.5 rounded-lg shadow-sm transition-all ${
                       isListening 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
               >
                    {isListening ? '...' : '🎤'}
                  </button>
                )}
                <button
                  type='submit'
                  disabled={isLoading || !input.trim()}
                   className='px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-50'
                >
                  {isLoading ? '...' : 'Send ➤'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
     </div>
  );
};

export default AgentSurvey;