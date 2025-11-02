import React, { useState, useEffect, useRef } from 'react';
// Removed react-icons import to prevent compilation errors
import { Toaster, toast } from 'react-hot-toast';

// This is the "brain" of your agent. It defines its persona and the 25 questions.
const systemInstruction = {
  parts: [{
    text: `You are a kind, empathetic, and non-judgmental wellness assistant. Your goal is to have a natural conversation with a user to help them understand their digital habits.

RULES:
1.  Start with a brief, warm greeting.
2.  Your task is to ask the 25 questions listed below.
3.  **DO NOT just read the questions.** Ask them ONE AT A TIME in a natural, conversational way. You can paraphrase them to sound more human.
    * Example: Instead of "Do you spend more time online/on your phone than you initially intended?", say "For the first question, do you ever find yourself spending more time online or on your phone than you originally meant to?"
4.  **Add human-like transitions.** After the user answers, add a brief acknowledgment before the next question, like "Thanks for sharing," "Got it," "Okay, next question...", or "That's helpful to know. What about this:".
5.  Do NOT ask any questions other than the 25.
6.  Maintain a supportive, non-judgmental tone throughout.
7.  After the user answers the 25th question, you MUST respond with ONLY a JSON object. This JSON object should rate their potential for digital addiction based on their 25 answers.
8.  The JSON object must have this exact structure:
    {
      "severityScore": (A number from 1-10, where 1 is "Very Healthy" and 10 is "Very High Dependency"),
      "assessment": (A short, supportive, and constructive summary of their habits based on their answers, highlighting areas of concern from the categories),
      "keyAreas": (An array of strings listing the 2-3 most concerning categories, e.g., "Emotional Dependence", "Impact on Daily Life")
    }

THE 25 QUESTIONS:
A. Usage Habits
1. Do you spend more time online/on your phone than you initially intended?
2. Do you check your phone first thing in the morning or last before sleeping?
3. Do you use your phone even while eating or during family time?
4. Do you continue using your phone late into the night, even when you should be sleeping?
5. Do you use multiple devices (phone + laptop + tablet) simultaneously to stay online?
B. Emotional Dependence
6. Do you feel restless, moody, or irritated when you can’t access the internet/phone?
7. Do you feel anxious when you have no notifications or messages?
8. Do you use the internet/mobile to escape from problems or stress?
9. Do you feel guilty after spending excessive time online?
10. Do you feel happier or more comfortable online than offline?
C. Impact on Daily Life
11. Do you neglect studies, work, or sleep because of internet/mobile use?
12. Do you get distracted by phone notifications while studying or working?
13. Do you postpone important tasks because you were using your phone/internet?
14. Do you feel your real-life/social interactions are reducing due to online activity?
15. Do you feel you are missing opportunities because of spending too much time online?
D. Physical & Mental Health
16. Do you experience headaches, eye strain, or reduced physical activity due to screen time?
17. Do you feel more tired or lazy after long mobile/internet usage?
18. Do you think your internet/mobile habits affect your mental health (stress, anxiety, mood swings)?
19. How would you rate your focus compared to when you are not online?
20. How would you rate your overall happiness and efficiency in daily life?
E. Control & Awareness
21. Do you lie to family or friends about how much time you spend online?
22. Do you try to reduce your screen time but fail repeatedly?
23. Do you feel uncomfortable or bored when you are offline?
24. Do you spend more than 6–7 hours daily on non-work/study online activities?
25. If you had to stay without internet/mobile for one full day, how difficult would it be for you?`
  }]
};

const AgentSurvey = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const chatEndRef = useRef(null);

  // Load API Key from .env file
  // Vite exposes env variables via import.meta.env
  const apiKey = "AIzaSyD3-qPZyWY83tV-irlzUCc6EyDxm1ggI4o";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  // Function to call the Gemini API
  const callGeminiAPI = async (chatHistory) => {
    setIsLoading(true);
    
    // Check if API key is present
    if (!apiKey) {
      toast.error("API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        contents: chatHistory,
        systemInstruction: systemInstruction,
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("No text response from API.");
      }

      // Updated Parsing Logic: Find the JSON block anywhere in the response
      const jsonMatch = text.match(/{[\s\S]*}/);

      if (jsonMatch && jsonMatch[0]) {
        try {
          const parsedAssessment = JSON.parse(jsonMatch[0]);
          setAssessment(parsedAssessment);
          
          // Add the AI's introductory text *before* the assessment card
          const introText = text.substring(0, jsonMatch.index).trim();
          if (introText) {
            setMessages(prev => [...prev, {
              role: 'model',
              parts: [{ text: introText }]
            }]);
          } else {
             // Add a generic "thank you" message if no intro text is found
             setMessages(prev => [...prev, {
              role: 'model',
              parts: [{ text: "Thank you for completing the survey. Your assessment is now ready." }]
            }]);
          }
        } catch (e) {
          toast.error("Failed to parse the final assessment.");
          console.error("JSON Parse Error:", e);
          // Fallback: If parsing fails, just show the raw text
          setMessages(prev => [...prev, { role: 'model', parts: [{ text }] }]);
        }
      } else {
        // It's a regular question, add it to the chat
        setMessages(prev => [...prev, { role: 'model', parts: [{ text }] }]);
      }

    } catch (error) {
      toast.error("Error communicating with the agent. Please try again.");
      console.error('Gemini API Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    callGeminiAPI([{ role: 'user', parts: [{ text: "Hello, I'm ready to start the survey." }] }]);
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
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-3xl mx-auto p-4" data-theme="emerald">
      <Toaster position="top-right" />
      
     
      <div className="flex-1 overflow-y-auto bg-base-100 p-4 rounded-lg shadow-inner mb-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`chat ${msg.role === 'user' ? 'chat-end' : 'chat-start'}`}>
            <div className="chat-image avatar">
              <div className="w-10 rounded-full bg-base-300 flex items-center justify-center">
                
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
            </div>
            <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-accent'}`}>
              {msg.parts[0].text}
            </div>
          </div>
        ))}
        {isLoading && !assessment && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="w-10 rounded-full bg-base-300 flex items-center justify-center">
               
                <span className="text-xl">🤖</span>
              </div>
            </div>
            <div className="chat-bubble chat-bubble-accent">
              <span className="loading loading-dots loading-md"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      
      {assessment ? (
        <div className="card bg-base-100 shadow-xl border-2 border-primary">
          <div className="card-body">
            <h2 className="card-title text-2xl flex items-center">
             
              <span className="mr-2 text-2xl">📋</span> Your Assessment
            </h2>
            <div className="text-center my-4">
              <div className={`radial-progress ${assessment.severityScore > 7 ? 'text-error' : assessment.severityScore > 4 ? 'text-warning' : 'text-success'}`} 
                   style={{"--value": assessment.severityScore * 10, "--size": "6rem", "--thickness": "8px"}}>
                <span className="font-bold text-xl">{assessment.severityScore}</span>/10
              </div>
              <p className="font-semibold mt-2">Severity Score</p>
            </div>
            <p className="mb-2">{assessment.assessment}</p>
            {assessment.keyAreas && assessment.keyAreas.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Key Areas of Concern:</h3>
                <div className="flex flex-wrap gap-2">
                  {assessment.keyAreas.map((area, i) => (
                    <div key={i} className="badge badge-error badge-lg">{area}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            className="input input-bordered input-primary flex-1"
            placeholder="Type your answer..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="btn btn-primary btn-square" disabled={isLoading}>
            {isLoading ? <span className="loading loading-spinner"></span> : <span className="text-xl">➤</span>}
          </button>
        </form>
      )}
    </div>
  );
};

export default AgentSurvey;

