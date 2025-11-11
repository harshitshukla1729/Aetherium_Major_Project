import React, { useState } from 'react';
import api from '../api/axios'; // Imports the custom axios instance
import { useNavigate, Link } from 'react-router-dom'; // Added 'Link'
import toast from 'react-hot-toast';

// --- ENGLISH QUESTIONS ---
const questionSet1_en = [
  'Do you stay up late just to finish watching a video or reading posts?',
  'Do you feel more confident expressing yourself online than in person?',
  'Do you get irritated if someone interrupts your online activity?',
  'Do you get distracted by incoming notifications while studying?',
  'Have you noticed changes in your mental well-being due to digital overload?',
  'If asked to give up your phone for 24 hours, would you feel anxious or restless?',
  'Do you spend more than half of your waking hours online for non-work activities?',
  'Do you find it hard to stop once you start scrolling on social media?',
  'Do you stay online even while spending time with family or friends?',
  'Do you hide your online habits from friends or family?',
  'Do you think your screen habits contribute to your stress or anxiety?',
  'Do you find it difficult to focus on work without checking your phone?',
  'Do you often check your phone in between tasks or assignments?',
  'Do you multitask between phone and laptop most of the day?',
  'Do you feel uneasy or bored when you’re away from your phone?',
  'Do you feel restless when you’re forced to stay offline?',
  'Do you feel more productive when you stay away from screens?',
  'Do you feel that being offline makes you disconnected or ‘out of the loop’?',
  'Do you check your notifications immediately after waking up?',
  'Do you feel the urge to pick up your phone even when you’re busy?',
  'Do you use multiple screens at once (like watching something while texting)?',
  'Does your mood depend on the number of likes or comments you get online?',
  'Do you feel like you’ve lost control over your internet usage?',
  'Do you find comfort or emotional relief in scrolling or chatting online?',
  'Do you promise yourself ‘just 5 more minutes’ and end up spending hours?',
];
const questionSet2_en = [
  'Do you feel mentally exhausted after spending time on social media?',
  'Do you feel that excessive screen time has made you less energetic overall?',
  'Do you feel proud or validated when you receive many online interactions?',
  'Do you notice more headaches after long periods online?',
  'Do you get frustrated when your internet connection is slow?',
  'Do you find offline time boring or uncomfortable?',
  'Do you procrastinate important work to stay online a bit longer?',
  'Do you feel less productive because of frequent internet breaks?',
  'Do you lose track of time while browsing or watching videos?',
  'Have you ever been late to an event or class because of mobile distraction?',
  'Do you install screen-time trackers but ignore their warnings?',
  'Do you keep multiple tabs or apps open and switch between them frequently?',
  'Do you experience neck or back pain due to extended device use?',
  'Do you find it difficult to focus on offline tasks after being online for long?',
  'Would you find a full day without the internet extremely hard to manage?',
  'Have your sleeping habits worsened due to late-night scrolling?',
  'Do you think your happiness level drops when you spend too much time online?',
  'Do you feel you could achieve more if you cut down internet usage?',
  'Do you regret the amount of time you spend online but still continue?',
  'Do you feel anxious when someone takes too long to reply to you?',
  'Have your grades or work performance dropped due to screen time?',
  'Do you often unlock your phone without any specific purpose?',
  'Do you believe being online helps you forget your real-life problems?',
  'Do you worry about missing out if you disconnect for a while?',
  'Do you check your screen time reports and feel surprised at the total hours?',
];
const questionSet3_en = [
  'Have you tried to cut down screen time but couldn’t stick to it?',
  'Do you skip physical activities because of your internet usage?',
  'Do you turn to your phone for company when you’re feeling lonely?',
  'Do your eyes feel strained after long screen sessions?',
  'Have you ever lied about how long you spend on your phone?',
  'Do you feel physically tired after being on your phone for hours?',
  'Is scrolling through your phone part of your bedtime routine?',
  'Has your interest in offline hobbies reduced because of your online activity?',
  'Do you use your phone to distract yourself when feeling upset or stressed?',
  'Do you believe your offline opportunities have suffered because of online time?',
  'Do you notice mood changes depending on your online experiences?',
  'Do you often end up spending longer online than you originally planned?',
  'Have your social relationships weakened because you prefer online interaction?',
  'Do you skip meals or sleep to continue using your phone?',
  'Do you spend less time meeting people in person than you used to?',
  'Do you find yourself using your phone during meals?',
  'Is your phone usage the last thing you do before sleeping at night?',
  'Do you constantly refresh apps or websites without a specific reason?',
  'Have you ever missed a deadline because you were online?',
  'Do you feel calmer only after checking all your notifications?',
];

// --- HINDI QUESTIONS ---
const questionSet1_hi = [
  'क्या आप केवल वीडियो देखने या पोस्ट पढ़ने के लिए देर रात तक जागते हैं?',
  'क्या आप ऑनलाइन खुद को व्यक्त करने में व्यक्तिगत रूप से अधिक आत्मविश्वास महसूस करते हैं?',
  'क्या आपको चिढ़ होती है जब कोई आपकी ऑनलाइन गतिविधि में बाधा डालता है?',
  'क्या पढ़ाई करते समय आने वाले नोटिफिकेशन आपको विचलित करते हैं?',
  'क्या आपने डिजिटल ओवरलोड के कारण अपने मानसिक स्वास्थ्य में बदलाव देखा है?',
  'अगर आपसे 24 घंटे के लिए फोन छोड़ने को कहा जाए तो क्या आप बेचैन या चिंतित महसूस करेंगे?',
  'क्या आप अपने जागने के समय का आधा से अधिक हिस्सा गैर-कार्य ऑनलाइन गतिविधियों में बिताते हैं?',
  'क्या आपको सोशल मीडिया स्क्रॉल करना शुरू करने के बाद रुकना मुश्किल लगता है?',
  'क्या आप परिवार या दोस्तों के साथ समय बिताते हुए भी ऑनलाइन रहते हैं?',
  'क्या आप अपनी ऑनलाइन आदतें दोस्तों या परिवार से छिपाते हैं?',
  'क्या आपको लगता है कि आपकी स्क्रीन की आदतें आपके तनाव या चिंता का कारण हैं?',
  'क्या आपको बिना फोन देखे काम पर ध्यान केंद्रित करना कठिन लगता है?',
  'क्या आप कार्यों या असाइनमेंट के बीच में अक्सर फोन चेक करते हैं?',
  'क्या आप दिन का अधिकांश समय फोन और लैपटॉप के बीच मल्टीटास्किंग करते हैं?',
  'क्या आप फोन से दूर रहने पर असहज या ऊब महसूस करते हैं?',
  'क्या आप जबरन ऑफलाइन रहने पर बेचैनी महसूस करते हैं?',
  'क्या आप स्क्रीन से दूर रहने पर अधिक उत्पादक महसूस करते हैं?',
  'क्या आपको लगता है कि ऑफलाइन रहने से आप दूसरों से कटे हुए महसूस करते हैं?',
  'क्या आप जागने के तुरंत बाद नोटिफिकेशन चेक करते हैं?',
  'क्या आपको व्यस्त होने पर भी फोन उठाने की इच्छा होती है?',
  'क्या आप एक साथ कई स्क्रीन का उपयोग करते हैं (जैसे वीडियो देखते समय टेक्स्ट करना)?',
  'क्या आपका मूड ऑनलाइन लाइक या कमेंट की संख्या पर निर्भर करता है?',
  'क्या आपको लगता है कि आपने अपने इंटरनेट उपयोग पर नियंत्रण खो दिया है?',
  'क्या आपको ऑनलाइन स्क्रॉलिंग या चैटिंग में भावनात्मक राहत मिलती है?',
  'क्या आप खुद से ‘सिर्फ 5 मिनट और’ कहकर घंटों ऑनलाइन रहते हैं?',
];
const questionSet2_hi = [
  'क्या आप सोशल मीडिया पर समय बिताने के बाद मानसिक रूप से थकान महसूस करते हैं?',
  'क्या अत्यधिक स्क्रीन समय ने आपको कम ऊर्जावान बना दिया है?',
  'क्या आप कई ऑनलाइन इंटरैक्शन मिलने पर गर्व या मान्यता महसूस करते हैं?',
  'क्या आप लंबे समय तक ऑनलाइन रहने के बाद सिरदर्द महसूस करते हैं?',
  'क्या आपको इंटरनेट कनेक्शन धीमा होने पर झुंझलाहट होती है?',
  'क्या आपको ऑफलाइन समय उबाऊ या असहज लगता है?',
  'क्या आप ऑनलाइन रहने के लिए महत्वपूर्ण काम टालते हैं?',
  'क्या बार-बार इंटरनेट ब्रेक लेने से आपकी उत्पादकता घटती है?',
  'क्या आप ब्राउज़िंग या वीडियो देखने के दौरान समय का ध्यान खो देते हैं?',
  'क्या आप मोबाइल के कारण किसी कार्यक्रम या कक्षा में देर से पहुंचे हैं?',
  'क्या आप स्क्रीन टाइम ट्रैकर इंस्टॉल करते हैं लेकिन उसकी चेतावनियों को नजरअंदाज करते हैं?',
  'क्या आप कई टैब या ऐप खोलकर बार-बार उनके बीच स्विच करते हैं?',
  'क्या लंबे समय तक डिवाइस का उपयोग करने से आपकी गर्दन या पीठ में दर्द होता है?',
  'क्या लंबे समय ऑनलाइन रहने के बाद ऑफलाइन कार्यों पर ध्यान केंद्रित करना कठिन लगता है?',
  'क्या आपको एक पूरा दिन बिना इंटरनेट के बिताना बहुत कठिन लगेगा?',
  'क्या देर रात स्क्रॉलिंग के कारण आपकी नींद की आदतें बिगड़ गई हैं?',
  'क्या आपको लगता है कि अधिक समय ऑनलाइन रहने से आपकी खुशी का स्तर घट जाता है?',
  'क्या आपको लगता है कि इंटरनेट उपयोग घटाने पर आप अधिक हासिल कर सकते हैं?',
  'क्या आप ऑनलाइन समय पर पछताते हैं लेकिन फिर भी जारी रखते हैं?',
  'क्या आपको तब चिंता होती है जब कोई जवाब देने में देर करता है?',
  'क्या स्क्रीन टाइम के कारण आपके ग्रेड या काम का प्रदर्शन गिरा है?',
  'क्या आप बिना किसी कारण के अपना फोन बार-बार अनलॉक करते हैं?',
  'क्या आपको लगता है कि ऑनलाइन रहना आपको वास्तविक समस्याओं से दूर रखता है?',
  'क्या आप ऑफलाइन रहने पर कुछ मिस करने की चिंता करते हैं?',
  'क्या आप अपनी स्क्रीन टाइम रिपोर्ट देखकर कुल घंटों पर हैरान होते हैं?',
];
const questionSet3_hi = [
  'क्या आपने स्क्रीन टाइम कम करने की कोशिश की है लेकिन सफल नहीं हुए?',
  'क्या आप इंटरनेट उपयोग के कारण शारीरिक गतिविधियों को छोड़ देते हैं?',
  'क्या आप अकेलापन महसूस करने पर फोन का सहारा लेते हैं?',
  'क्या लंबे समय स्क्रीन देखने से आपकी आंखों में तनाव होता है?',
  'क्या आपने कभी फोन पर बिताए समय के बारे में झूठ बोला है?',
  'क्या आप घंटों फोन पर रहने के बाद शारीरिक रूप से थकान महसूस करते हैं?',
  'क्या सोने से पहले फोन स्क्रॉल करना आपकी दिनचर्या का हिस्सा है?',
  'क्या ऑनलाइन गतिविधियों के कारण आपकी ऑफलाइन रुचियां कम हो गई हैं?',
  'क्या आप उदास या तनावग्रस्त होने पर खुद को विचलित करने के लिए फोन का उपयोग करते हैं?',
  'क्या आपको लगता है कि ऑनलाइन समय ने आपकी ऑफलाइन अवसरों को प्रभावित किया है?',
  'क्या आप अपने ऑनलाइन अनुभवों के अनुसार मूड में बदलाव महसूस करते हैं?',
  'क्या आप अक्सर योजना से अधिक समय ऑनलाइन बिताते हैं?',
  'क्या आपके सामाजिक संबंध कमजोर हो गए हैं क्योंकि आप ऑनलाइन बातचीत को प्राथमिकता देते हैं?',
  'क्या आप फोन का उपयोग जारी रखने के लिए भोजन या नींद छोड़ते हैं?',
  'क्या आप पहले की तुलना में लोगों से आमने-सामने कम मिलते हैं?',
  'क्या आप भोजन के दौरान भी फोन का उपयोग करते हैं?',
  'क्या फोन का उपयोग आपके सोने से पहले की आखिरी गतिविधि है?',
  'क्या आप बिना किसी कारण ऐप्स या वेबसाइट को बार-बार रिफ्रेश करते हैं?',
  'क्या आप ऑनलाइन रहने के कारण कभी समय सीमा चूक गए हैं?',
  'क्या आप सभी नोटिफिकेशन चेक करने के बाद ही शांत महसूस करते हैं?',
];

// Helper component for questions
const QuestionBlock = ({ title, questions, scoreSet, scoreKey, setValue }) => (
  <div className="mb-8">
    <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">{title}</h3>
    <div className="space-y-4">
      {questions.map((q, idx) => (
        <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
          <span className="flex-1 text-gray-700">{`${idx + 1}. ${q}`}</span>
          <select
            value={scoreSet[idx]}
            onChange={(e) => setValue(scoreKey, idx, e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 w-full sm:w-20 text-center bg-white focus:ring-2 focus:ring-blue-400"
          >
            {[1, 2, 3, 4, 5].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  </div>
);


export default function Survey() {
  const navigate = useNavigate();

  // 🔹 State
  const [language, setLanguage] = useState('en');
  const [currentSet, setCurrentSet] = useState(1); // Control which set is visible
  const [questionSets, setQuestionSets] = useState({
    set1: questionSet1_en,
    set2: questionSet2_en,
    set3: questionSet3_en,
  });
  const [scores, setScores] = useState({
    set1: Array(questionSet1_en.length).fill(3),
    set2: Array(questionSet2_en.length).fill(3),
    set3: Array(questionSet3_en.length).fill(3),
  });

  // --- NEW STATE for results modal ---
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleLanguage = () => {
    if (language === 'en') {
      setLanguage('hi');
      setQuestionSets({
        set1: questionSet1_hi,
        set2: questionSet2_hi,
         set3: questionSet3_hi,
      });
    } else {
      setLanguage('en');
      setQuestionSets({
        set1: questionSet1_en,
        set2: questionSet2_en,
        set3: questionSet3_en,
      });
    }
  };

  const setValue = (setName, idx, val) => {
    setScores((prevScores) => {
      const newScores = [...prevScores[setName]];
      newScores[idx] = Number(val);
      return {
        ...prevScores,
        [setName]: newScores,
      };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Prepare data based on current step
    const dataToSend = {
      scoresSet1: scores.set1,
      // Only send scores for sets that have been viewed
      scoresSet2: currentSet >= 2 ? scores.set2 : undefined,
      scoresSet3: currentSet === 3 ? scores.set3 : undefined,
    };

    try {
      // Use the 'api' instance which already has the token
      // This path MUST match your backend routes
      const res = await api.post('/api/survey/submit', dataToSend); 
      
      if (res.data && res.data.assessment) {
        setAssessmentResult(res.data.assessment);
        // Use DaisyUI method to show the modal
        document.getElementById('assessment_modal').showModal();
      } else {
        // Fallback if assessment is missing
        toast.success('Survey submitted successfully!');
        navigate('/tasks');
      }
      
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("You are not authorized. Please log in again.");
        navigate('/login');
      } else {
        toast.error(err.response?.data?.message || 'Submission failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NEW: Helper to get classes for the modal alert ---
  const getRiskClasses = () => {
    if (!assessmentResult) return { bg: 'bg-gray-100', text: 'text-gray-800', radial: 'text-gray-500' };
    
    switch (assessmentResult.riskLevel) {
      case 'Low Risk':
        return { bg: 'bg-green-50', text: 'text-green-800', radial: 'text-green-500' };
      case 'Moderate Risk':
        return { bg: 'bg-yellow-50', text: 'text-yellow-800', radial: 'text-yellow-500' };
      case 'High Risk':
        return { bg: 'bg-red-50', text: 'text-red-800', radial: 'text-red-500' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', radial: 'text-gray-500' };
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 py-10 px-6">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-700">📋 {language === 'en' ? 'Wellbeing & Usage Survey' : 'कल्याण और उपयोग सर्वेक्षण'}</h2>
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition"
            >
              {language === 'en' ? 'हिन्दी में देखें' : 'View in English'}
            </button>
          </div>

          {/* Chatbot Card */}
          <div
            onClick={() => navigate('/agent-survey')}
            className="cursor-pointer mb-8 p-5 bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-xl hover:shadow-lg transition"
         >
            <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
              🤖 {language === 'en' ? 'Prefer to chat? Talk to an AI Assistant' : 'चैट करना पसंद है? AI असिस्टेंट से बात करें'}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              {language === 'en' ? 'Get a personalized assessment by answering questions in a natural conversation.' : 'प्राकृतिक बातचीत में सवालों के जवाब देकर व्यक्तिगत मूल्यांकन प्राप्त करें।'}
            </p>
          </div>

          {/* Form */}
          {/* We no longer use <form> tag to prevent accidental submission */}
          <div className="space-y-8">
            
            {/* --- Set 1 --- */}
            <QuestionBlock 
              title={language === 'en' ? 'Set 1 (25 Questions) – Rate from 1 (Never) to 5 (Always)' : 'सेट 1 (25 प्रश्न) – 1 (कभी नहीं) से 5 (हमेशा) तक चुनें'}
              questions={questionSets.set1}
              scoreSet={scores.set1}
              scoreKey="set1"
              setValue={setValue}
            />
            {currentSet === 1 && (
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition btn btn-success flex-1" disabled={isSubmitting}>
                  {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : (language === 'en' ? 'Submit Set 1 & Get Assessment' : 'सेट 1 सबमिट करें')}
                </button>
                <button onClick={() => setCurrentSet(2)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition btn btn-primary btn-outline flex-1">
                  {language === 'en' ? 'Continue to Set 2' : 'सेट 2 पर जाएँ'}
                </button>
            </div>
            )}

            {/* --- Set 2 --- */}
            {currentSet >= 2 && (
              <>
                <QuestionBlock 
                  title={language === 'en' ? 'Set 2 (25 Questions) – Rate from 1 (Never) to 5 (Always)' : 'सेट 2 (25 प्रश्न) – 1 (कभी नहीं) से 5 (हमेशा) तक चुनें'}
                  questions={questionSets.set2}
                  scoreSet={scores.set2}
                 scoreKey="set2"
                  setValue={setValue}
                />
                {currentSet === 2 && (
               <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition btn btn-success flex-1" disabled={isSubmitting}>
                      {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : (language === 'en' ? 'Submit Set 1 & 2' : 'सेट 1 और 2 सबमिट करें')}
                    </button>
                    <button onClick={() => setCurrentSet(3)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition btn btn-primary btn-outline flex-1">
                      {language === 'en' ? 'Continue to Set 3' : 'सेट 3 पर जाएँ'}
                     </button>
                  </div>
                )}
              </>
            )}

            {/* --- Set 3 --- */}
            {currentSet === 3 && (
              <>
                <QuestionBlock 
                  title={language === 'en' ? 'Set 3 (20 Questions) – Rate from 1 (Never) to 5 (Always)' : 'सेट 3 (20 प्रश्न) – 1 (कभी नहीं) से 5 (हमेशा) तक चुनें'}
                  questions={questionSets.set3}
                  scoreSet={scores.set3}
                  scoreKey="set3"
                  setValue={setValue}
                />
                <button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition btn btn-success w-full" disabled={isSubmitting}>
                 {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : (language === 'en' ? 'Submit Final Assessment' : 'अंतिम मूल्यांकन सबमिट करें')}
                </button>
              </>
            )}
            
          </div>
        </div>
      </div>

      {/* --- ASSESSMENT RESULTS MODAL (REDESIGNED) --- */}
      <dialog id="assessment_modal" className="modal">
        <div className="modal-box bg-white max-w-lg p-0">
          {assessmentResult && (
            <>
              {/* Header with Title and Close Button */}
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="font-bold text-2xl text-blue-700">
                  {language === 'en' ? 'Your Assessment' : 'आपका मूल्यांकन'}
                </h3>
                <form method="dialog">
                  <button className="btn btn-sm btn-circle btn-ghost">✕</button>
                </form>
              </div>

              {/* Body Content */}
              <div className="p-6">
                <div className="text-center my-4">
                  <div 
                    className={`radial-progress ${getRiskClasses().radial}`} 
                    style={{ "--value": assessmentResult.percentage, "--size": "8rem", "--thickness": "0.7rem" }}
s                 >
                    <span className="font-bold text-2xl text-gray-800">{assessmentResult.percentage}%</span>
                 </div>
                  <div className={`text-2xl font-semibold mt-4 ${getRiskClasses().text}`}>{assessmentResult.riskLevel}</div>
                  <p className="text-sm text-gray-500">({assessmentResult.questionsAnswered} {language === 'en' ? 'questions answered' : 'प्रश्नों के उत्तर दिए गए'})</p>
           </div>

                {/* Suggestions Alert Box */}
                <div role="alert" className={`alert ${getRiskClasses().bg} ${getRiskClasses().text} border-l-4 ${getRiskClasses().radial} border-opacity-30`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 <div>
                    <h3 className="font-bold">{language === 'en' ? 'Suggestions' : 'सुझाव'}</h3>
                    <div className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{language === 'en' ? assessmentResult.suggestions : (assessmentResult.suggestions_hi || assessmentResult.suggestions)}</div>
                </div>
                </div>

                {/* Actionable Goal */}
               <div className="mt-6">
                   <h4 className="font-semibold text-lg text-gray-800">
                    {language === 'en' ? 'Recommended Goal:' : 'अनुशंसित लक्ष्य:'}
                  </h4>
                  <div className="p-4 bg-blue-50 text-blue-800 rounded-lg mt-2 text-center">
                    <span className="font-bold text-lg">
                     {language === 'en' ? assessmentResult.actionableGoal : (assessmentResult.actionableGoal_hi || assessmentResult.actionableGoal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* --- 2. MODIFIED: Footer Button & New Link --- */}
              <div className="modal-action p-6 bg-gray-50 rounded-b-2xl flex flex-col gap-3">
                
                {/* --- 1. Original Button (Unchanged) --- */}
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition btn btn-primary w-full text-white bg-blue-600 hover:bg-blue-700 border-none"
                  onClick={() => {
                    document.getElementById('assessment_modal').close();
                    navigate('/tasks');
                  }}
                >
             {language === 'en' ? 'Go to Tasks' : 'टास्क पर जाएं'}
                </button>
                
                {/* --- 2. YOUR NEW HYPERLINK --- */}
                <Link
                  to="/planner"
                  onClick={() => document.getElementById('assessment_modal').close()}
                 className="text-center text-blue-600 hover:underline text-sm"
                >
                  {language === 'en' ? '...or, let us help you plan!' : '...या, हमें आपकी योजना बनाने में मदद करने दें!'}
                </Link>

              </div>
        </>
          )}
        </div>
        {/* Click outside to close */}
{/*         <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form> */}
      </dialog>
    </>
  );
}