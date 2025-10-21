import React, { useState } from 'react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'

export default function Survey() {
  // Dummy questions for now
  const questionSet1 = [
    'How satisfied are you with your work-life balance?',
    'How often do you feel stressed at work?',
    'How motivated are you to achieve your goals?',
    'How well do you manage your time?',
    'How often do you exercise?',
    'How satisfied are you with your diet?',
    'How often do you feel productive?',
    'How well do you handle conflicts?',
    'How satisfied are you with your social life?',
    'How often do you take breaks during work?',
    'How confident are you in your skills?',
    'How often do you try new things?',
    'How satisfied are you with your financial situation?',
    'How well do you sleep at night?',
    'How often do you feel anxious?',
    'How satisfied are you with your personal growth?',
    'How often do you spend time with family?',
    'How satisfied are you with your friendships?',
    'How often do you relax and unwind?',
    'How motivated are you to learn new skills?'
  ]

  const questionSet2 = [
    'How satisfied are you with your current job?',
    'How often do you feel recognized for your work?',
    'How satisfied are you with your team collaboration?',
    'How clear are your work goals?',
    'How likely are you to recommend your workplace to others?'
  ]

  const [part1, setPart1] = useState(Array(questionSet1.length).fill(3))
  const [part2, setPart2] = useState(Array(questionSet2.length).fill(3))
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const setValue = (arr, setArr, idx, val) => {
    const copy = [...arr]
    copy[idx] = Number(val)
    setArr(copy)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/survey/submit', { scoresPart1: part1, scoresPart2: part2 })
      setMessage(res.data?.message || 'Submitted')
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login')
      } else {
        setMessage(err.response?.data?.message || 'Submission failed')
      }
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Survey</h2>
      {message && <div className="bg-green-100 p-2 mb-4">{message}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Part 1 */}
        <div>
          <h3 className="font-semibold mb-2">Part 1 - choose 1 to 5</h3>
          <div className="grid grid-cols-1 gap-4">
            {questionSet1.map((q, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <label className="w-8">Q{idx + 1}</label>
                <span className="flex-1">{q}</span>
                <select
                  value={part1[idx]}
                  onChange={(e) => setValue(part1, setPart1, idx, e.target.value)}
                  className="p-1 border rounded w-16"
                >
                  {[1, 2, 3, 4, 5].map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Part 2 */}
        <div>
          <h3 className="font-semibold mb-2">Part 2 - choose 1 to 5</h3>
          <div className="grid grid-cols-1 gap-4">
            {questionSet2.map((q, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <label className="w-8">Q{idx + 1}</label>
                <span className="flex-1">{q}</span>
                <select
                  value={part2[idx]}
                  onChange={(e) => setValue(part2, setPart2, idx, e.target.value)}
                  className="p-1 border rounded w-16"
                >
                  {[1, 2, 3, 4, 5].map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit Survey</button>
      </form>
    </div>
  )
}
