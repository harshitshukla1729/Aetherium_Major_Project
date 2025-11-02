import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Survey() {
  const navigate = useNavigate();

  // 🔹 English question sets
  const questionSet1_en = [
    // A. Usage Habits
    'Do you spend more time online/on your phone than you initially intended?',
    'Do you check your phone first thing in the morning or last before sleeping?',
    'Do you use your phone even while eating or during family time?',
    'Do you continue using your phone late into the night, even when you should be sleeping?',
    'Do you use multiple devices (phone + laptop + tablet) simultaneously to stay online?',
    // B. Emotional Dependence
    'Do you feel restless, moody, or irritated when you can’t access the internet/phone?',
    'Do you feel anxious when you have no notifications or messages?',
    'Do you use the internet/mobile to escape from problems or stress?',
    'Do you feel guilty after spending excessive time online?',
    'Do you feel happier or more comfortable online than offline?',
    // C. Impact on Daily Life
    'Do you neglect studies, work, or sleep because of internet/mobile use?',
    'Do you get distracted by phone notifications while studying or working?',
    'Do you postpone important tasks because you were using your phone/internet?',
    'Do you feel your real-life/social interactions are reducing due to online activity?',
    'Do you feel you are missing opportunities because of spending too much time online?',
    // D. Physical & Mental Health
    'Do you experience headaches, eye strain, or reduced physical activity due to screen time?',
    'Do you feel more tired or lazy after long mobile/internet usage?',
    'Do you think your internet/mobile habits affect your mental health (stress, anxiety, mood swings)?',
    'How would you rate your focus compared to when you are not online?',
    'How would you rate your overall happiness and efficiency in daily life?',
    // E. Control & Awareness
    'Do you lie to family or friends about how much time you spend online?',
    'Do you try to reduce your screen time but fail repeatedly?',
    'Do you feel uncomfortable or bored when you are offline?',
    'Do you spend more than 6–7 hours daily on non-work/study online activities?',
    'If you had to stay without internet/mobile for one full day, how difficult would it be for you?',
  ];

  const questionSet2_en = [
    'How satisfied are you with your current job?',
    'How often do you feel recognized for your work?',
    'How satisfied are you with your team collaboration?',
    'How clear are your work goals?',
    'How likely are you to recommend your workplace to others?',
  ];

  // 🔹 Hindi question sets
  const questionSet1_hi = [
    'क्या आप अपने फोन/इंटरनेट पर उतना समय बिताते हैं जितना आपने सोचा नहीं था?',
    'क्या आप सुबह उठते ही या सोने से पहले सबसे पहले फोन देखते हैं?',
    'क्या आप खाने के समय या परिवार के साथ रहते हुए भी फोन का इस्तेमाल करते हैं?',
    'क्या आप देर रात तक फोन चलाते रहते हैं, भले ही आपको सोना चाहिए?',
    'क्या आप एक साथ कई डिवाइस (फोन + लैपटॉप + टैबलेट) का उपयोग करते हैं?',
    'क्या इंटरनेट/फोन का उपयोग न कर पाने पर आप बेचैन, चिड़चिड़े या परेशान महसूस करते हैं?',
    'क्या आपको नोटिफिकेशन या संदेश न मिलने पर चिंता होती है?',
    'क्या आप समस्याओं या तनाव से बचने के लिए इंटरनेट/मोबाइल का इस्तेमाल करते हैं?',
    'क्या आप ऑनलाइन बहुत समय बिताने के बाद अपराधबोध महसूस करते हैं?',
    'क्या आप ऑनलाइन दुनिया में खुद को अधिक खुश या सहज महसूस करते हैं?',
    'क्या आप इंटरनेट/मोबाइल की वजह से पढ़ाई, काम या नींद को नजरअंदाज करते हैं?',
    'क्या पढ़ाई या काम करते समय फोन नोटिफिकेशन से आपका ध्यान भटकता है?',
    'क्या आप फोन/इंटरनेट का इस्तेमाल करते हुए जरूरी काम टाल देते हैं?',
    'क्या आपको लगता है कि ऑनलाइन रहने से आपके वास्तविक जीवन/सामाजिक संबंध कम हो रहे हैं?',
    'क्या आपको लगता है कि आप अधिक समय ऑनलाइन बिताने के कारण अवसर खो रहे हैं?',
    'क्या स्क्रीन समय के कारण आपको सिरदर्द, आंखों में दर्द या शारीरिक गतिविधि में कमी महसूस होती है?',
    'क्या आप लंबे समय तक मोबाइल/इंटरनेट इस्तेमाल के बाद अधिक थकान या आलस्य महसूस करते हैं?',
    'क्या आपको लगता है कि आपकी इंटरनेट/मोबाइल आदतें आपके मानसिक स्वास्थ्य (तनाव, चिंता, मूड स्विंग) को प्रभावित करती हैं?',
    'क्या आपका ध्यान केंद्रित करने की क्षमता ऑनलाइन न होने की तुलना में कम है?',
    'क्या आप अपनी दैनिक खुशी और कार्यक्षमता को कम महसूस करते हैं?',
    'क्या आप अपने परिवार या दोस्तों से अपने ऑनलाइन समय के बारे में झूठ बोलते हैं?',
    'क्या आप स्क्रीन टाइम कम करने की कोशिश करते हैं लेकिन असफल रहते हैं?',
    'क्या आप ऑफलाइन रहने पर असहज या बोरियत महसूस करते हैं?',
    'क्या आप रोज़ 6-7 घंटे से अधिक गैर-शैक्षणिक/गैर-कार्य ऑनलाइन गतिविधियों में बिताते हैं?',
    'अगर आपको एक पूरा दिन इंटरनेट/मोबाइल के बिना रहना पड़े, तो यह आपके लिए कितना मुश्किल होगा?',
  ];

  const questionSet2_hi = [
    'क्या आप अपनी वर्तमान नौकरी से संतुष्ट हैं?',
    'क्या आपके काम की सराहना की जाती है?',
    'क्या आप अपनी टीम के साथ सहयोग से संतुष्ट हैं?',
    'क्या आपके कार्य लक्ष्यों के बारे में स्पष्टता है?',
    'क्या आप अपने कार्यस्थल की सिफारिश दूसरों को करेंगे?',
  ];

  // 🔹 State for language and questions
  const [language, setLanguage] = useState('en');
  const [questionSet1, setQuestionSet1] = useState(questionSet1_en);
  const [questionSet2, setQuestionSet2] = useState(questionSet2_en);

  const [part1, setPart1] = useState(Array(questionSet1.length).fill(3));
  const [part2, setPart2] = useState(Array(questionSet2.length).fill(3));
  const [message, setMessage] = useState('');

  // 🔹 Toggle between English and Hindi
  const toggleLanguage = () => {
    if (language === 'en') {
      setLanguage('hi');
      setQuestionSet1(questionSet1_hi);
      setQuestionSet2(questionSet2_hi);
    } else {
      setLanguage('en');
      setQuestionSet1(questionSet1_en);
      setQuestionSet2(questionSet2_en);
    }
  };

  const setValue = (arr, setArr, idx, val) => {
    const copy = [...arr];
    copy[idx] = Number(val);
    setArr(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/survey/submit', {
        scoresPart1: part1,
        scoresPart2: part2,
      });
      toast.success('Survey submitted successfully!');
      navigate('/tasks', {
        state: { message: 'Survey submitted successfully!' },
      });
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else {
        const errMsg = err.response?.data?.message || 'Submission failed';
        toast.error(errMsg);
      }
    }
  };

  return (
    <div className='p-6 max-w-3xl mx-auto'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-bold'>Survey</h2>
        <button
          type='button'
          onClick={toggleLanguage}
          className='bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition'
        >
          {language === 'en' ? 'हिन्दी में देखें' : 'View in English'}
        </button>
      </div>
       <div
          onClick={() => navigate('/agent-survey')}
          className='cursor-pointer p-4 bg-white rounded-lg shadow hover:shadow-lg transition'
        >
          <h3 className='font-semibold text-lg mb-2'>Talk to a Chatbot!</h3>
          <p className='text-gray-600 text-sm'>Feeling like rating does not give your issues a justice? Talk to an AI bot .</p>
        </div>
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Part 1 */}
        <div>
          <h3 className='font-semibold mb-2'>
            {language === 'en'
              ? 'Part 1 - choose 1 to 5'
              : 'भाग 1 - 1 से 5 चुनें'}
          </h3>
          <div className='grid grid-cols-1 gap-4'>
            {questionSet1.map((q, idx) => (
              <div key={idx} className='flex items-center gap-2'>
                <label className='w-8'>Q{idx + 1}</label>
                <span className='flex-1'>{q}</span>
                <select
                  value={part1[idx]}
                  onChange={(e) =>
                    setValue(part1, setPart1, idx, e.target.value)
                  }
                  className='p-1 border rounded w-16'
                >
                  {[1, 2, 3, 4, 5].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Part 2 */}
        <div>
          <h3 className='font-semibold mb-2'>
            {language === 'en'
              ? 'Part 2 - choose 1 to 5'
              : 'भाग 2 - 1 से 5 चुनें'}
          </h3>
          <div className='grid grid-cols-1 gap-4'>
            {questionSet2.map((q, idx) => (
              <div key={idx} className='flex items-center gap-2'>
                <label className='w-8'>Q{idx + 1}</label>
                <span className='flex-1'>{q}</span>
                <select
                  value={part2[idx]}
                  onChange={(e) =>
                    setValue(part2, setPart2, idx, e.target.value)
                  }
                  className='p-1 border rounded w-16'
                >
                  {[1, 2, 3, 4, 5].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <button
          type='submit'
          className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition'
        >
          {language === 'en' ? 'Submit Survey' : 'सर्वे सबमिट करें'}
        </button>
      </form>
    </div>
  );
}
