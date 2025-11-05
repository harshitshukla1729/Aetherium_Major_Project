import React, { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';

const systemInstruction = {
  parts: [{
    text: `You are a kind, empathetic, and non-judgmental wellness assistant. Your goal is to have a natural, flowing conversation with a user to help them understand their digital habits.

RULES:
1.  **Language Detection:** You are fluent in both English and Hindi. Detect the user's language from their first message. Conduct the ENTIRE survey in that language. If they speak Hindi, you MUST translate and paraphrase all your questions and responses into natural, conversational Hindi.
2.  **Start:** Start with a brief, warm greeting in the detected language.
3.  **No Ratings:** DO NOT ask the user to rate themselves. Ask the 70 questions (listed below) one by one, conversationally.
4.  **Internal Rating:** After the user gives a conversational answer, you MUST internally and privately assign a severity rating from 1 (Very Healthy) to 5 (Very High Dependency). DO NOT state this rating to the user.
5.  **Conversational Flow:** Be conversational. Acknowledge the user's answer (e.g., "I see," "Thanks for sharing," "That makes sense," "Okay, got it") before moving to the next question.
6.  **No Numbers/Verbatim:** NEVER use the question numbers (like '1.', '25.'). DO NOT repeat the questions verbatim. Paraphrase them to sound human.
7.  **3-Set Structure:**
8.  **After Set 1 (Question 25):** STOP. Ask (in their language) if they are comfortable continuing to Set 2 (25 more questions).
9.  **If user says NO:** Stop. Respond ONLY with the JSON assessment object based on your internal ratings for the 25 questions.
10. **After Set 2 (Question 50):** STOP. Ask (in their language) if they are comfortable continuing to the final Set 3 (20 questions).
11. **If user says NO:** Stop. Respond ONLY with the JSON assessment object based on your internal ratings for the 50 questions.
12. **After Set 3 (Question 70):** Thank them. Respond ONLY with the final JSON assessment object based on all 70 questions.
13. **JSON Structure:** The final JSON object must always be:
    {
      "severityScore": (A number from 1-10, calculated from your internal 1-5 ratings),
      "assessment": (A short, supportive summary *in the user's language*),
      "keyAreas": (An array of strings listing the 2-3 most concerning categories)
    }

---
THE 70 QUESTIONS (Mini Project Questionnaire):

### Set 1 (Questions 1-25)
1. Do you stay up late just to finish watching a video or reading posts?
2. Do you feel more confident expressing yourself online than in person?
3. Do you get irritated if someone interrupts your online activity?
4. Do you get distracted by incoming notifications while studying?
5. Have you noticed changes in your mental well-being due to digital overload?
6. If asked to give up your phone for 24 hours, would you feel anxious or restless?
7. Do you spend more than half of your waking hours online for non-work activities?
8. Do you find it hard to stop once you start scrolling on social media?
9. Do you stay online even while spending time with family or friends?
10. Do you hide your online habits from friends or family?
11. Do you think your screen habits contribute to your stress or anxiety?
12. Do you find it difficult to focus on work without checking your phone?
13. Do you often check your phone in between tasks or assignments?
14. Do you multitask between phone and laptop most of the day?
15. Do you feel uneasy or bored when you’re away from your phone?
16. Do you feel restless when you’re forced to stay offline?
17. Do you feel more productive when you stay away from screens?
18. Do you feel that being offline makes you disconnected or ‘out of the loop’?
19. Do you check your notifications immediately after waking up?
20. Do you feel the urge to pick up your phone even when you’re busy?
21. Do you use multiple screens at once (like watching something while texting)?
22. Does your mood depend on the number of likes or comments you get online?
23. Do you feel like you’ve lost control over your internet usage?
24. Do you find comfort or emotional relief in scrolling or chatting online?
25. Do you promise yourself ‘just 5 more minutes’ and end up spending hours?

### Set 2 (Questions 26-50)
26. Do you feel mentally exhausted after spending time on social media?
27. Do you feel that excessive screen time has made you less energetic overall?
28. Do you feel proud or validated when you receive many online interactions?
29. Do you notice more headaches after long periods online?
30. Do you get frustrated when your internet connection is slow?
31. Do you find offline time boring or uncomfortable?
32. Do you procrastinate important work to stay online a bit longer?
33. Do you feel less productive because of frequent internet breaks?
34. Do you lose track of time while browsing or watching videos?
35. Have you ever been late to an event or class because of mobile distraction?
36. Do you install screen-time trackers but ignore their warnings?
37. Do you keep multiple tabs or apps open and switch between them frequently?
38. Do you experience neck or back pain due to extended device use?
39. Do you find it difficult to focus on offline tasks after being online for long?
40. Would you find a full day without the internet extremely hard to manage?
41. Have your sleeping habits worsened due to late-night scrolling?
42. Do you think your happiness level drops when you spend too much time online?
43. Do you feel you could achieve more if you cut down internet usage?
44. Do you regret the amount of time you spend online but still continue?
45. Do you feel anxious when someone takes too long to reply to you?
46. Have your grades or work performance dropped due to screen time?
47. Do you often unlock your phone without any specific purpose?
48. Do you believe being online helps you forget your real-life problems?
49. Do you worry about missing out if you disconnect for a while?
50. Do you check your screen time reports and feel surprised at the total hours?

### Set 3 (Questions 51-70)
51. Have you tried to cut down screen time but couldn’t stick to it?
52. Do you skip physical activities because of your internet usage?
53. Do you turn to your phone for company when you’re feeling lonely?
54. Do your eyes feel strained after long screen sessions?
55. Have you ever lied about how long you spend on your phone?
56. Do you feel physically tired after being on your phone for hours?
57. Is scrolling through your phone part of your bedtime routine?
58. Has your interest in offline hobbies reduced because of your online activity?
59. Do you use your phone to distract yourself when feeling upset or stressed?
60. Do you believe your offline opportunities have suffered because of online time?
61. Do you notice mood changes depending on your online experiences?
62. Do you often end up spending longer online than you originally planned?
63. Have your social relationships weakened because you prefer online interaction?
64. Do you skip meals or sleep to continue using your phone?
65. Do you spend less time meeting people in person than you used to?
66. Do you find yourself using your phone during meals?
67. Is your phone usage the last thing you do before sleeping at night?
68. Do you constantly refresh apps or websites without a specific reason?
69. Have you ever missed a deadline because you were online?
70. Do you feel calmer only after checking all your notifications?`
  }]
};

// Check for Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const synthesis = window.speechSynthesis;

const AgentSurvey = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true); // Enabled by default
  const [voices, setVoices] = useState([]); // State to hold available voices
  const [conversationStarted, setConversationStarted] = useState(false); // New state to control start
  
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  
  // NOTE: You have hardcoded your API key.
  // For security, move this to a .env file (VITE_GEMINI_API_KEY=your_key)
  // and read it with: const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const apiKey = 'AIzaSyD3-qPZyWY83tV-irlzUCc6EyDxm1ggI4o';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  // --- Load voices on mount ---
  useEffect(() => {
    const loadVoices = () => {
      setVoices(synthesis.getVoices());
    };
    // Voices load asynchronously
    synthesis.onvoiceschanged = loadVoices;
    loadVoices(); // Initial load
  }, []);

  // --- Text-to-Speech (TTS) Function ---
  const speakText = (text) => {
    if (!synthesis || !isSpeakingEnabled) return;
    synthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to find a Hindi voice if needed
    if (text.match(/[\u0900-\u097F]/)) { // Check for Hindi characters
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
      if (!response.ok) {
        throw new Error(result.error?.message || "An error occurred with the API.");
      }
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("Received an empty response from the agent.");
      }

      const jsonMatch = text?.match(/{[\s\S]*}/);
      if (jsonMatch && jsonMatch[0]) {
        const parsedAssessment = JSON.parse(jsonMatch[0]);
        setAssessment(parsedAssessment);
        const introText = text.substring(0, jsonMatch.index).trim();
        const assessmentMessage = introText || 'Thank you for completing the survey!';
        setMessages((prev) => [
          ...prev,
          { role: 'model', parts: [{ text: assessmentMessage }] },
        ]);
        speakText(assessmentMessage); // Speak the final message
      } else {
        setMessages((prev) => [...prev, { role: 'model', parts: [{ text }] }]);
        speakText(text); // Speak the bot's question
      }
    } catch (err) {
      console.error("Gemini API Error:", err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Speech-to-Text (STT) Setup ---
  useEffect(() => {
    if (!SpeechRecognition) {
      if (messages.length === 0) { // Only toast once on mount
        toast.error("Sorry, your browser doesn't support speech recognition.");
      }
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; // Will be updated by AI's language detection

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
      setInput(transcript); // Put speech in text box
      // Automatically send the message
      const userMessage = { role: 'user', parts: [{ text: transcript }] };
      const newChatHistory = [...messages, userMessage];
      setMessages(newChatHistory);
      setInput(''); // Clear input after sending
      callGeminiAPI(newChatHistory);
    };
    
    recognitionRef.current = recognition;
  }, [messages, voices]); // Re-create if messages or voices change

  // --- NEW: Function to start the chat ---
  const startChat = (language) => {
    let firstMessage;
    if (language === 'hi') {
      firstMessage = "नमस्ते, मैं सर्वेक्षण शुरू करने के लिए तैयार हूँ।";
    } else {
      firstMessage = "Hello, I'm ready to start the survey.";
    }
    
    // Set the first "user" message (which is hidden) and call the API
    const startMessage = { role: 'user', parts: [{ text: firstMessage }] };
    setMessages([startMessage]); // Start the chat history
    callGeminiAPI([startMessage]);
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
    await callGeminiAPI(newChatHistory);
  };
  
  // Handle MIC button click
  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Check the last bot message to guess the language
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
      synthesis.cancel(); // Stop speaking immediately
      setIsSpeakingEnabled(false);
    } else {
      setIsSpeakingEnabled(true);
      // Speak the last message if it was a bot and we are TURNING ON speech
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