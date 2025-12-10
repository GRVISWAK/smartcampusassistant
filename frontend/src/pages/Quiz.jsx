import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ClipboardList, Loader, CheckCircle, XCircle } from 'lucide-react'
import { getDocument, generateQuiz, gradeShortAnswer } from '../services/api'

function Quiz() {
  const { documentId } = useParams()
  const navigate = useNavigate()
  const [document, setDocument] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(false)
  const [numQuestions, setNumQuestions] = useState(5)
  const [difficulty, setDifficulty] = useState('medium')
  const [topic, setTopic] = useState('')
  const [questionTypes, setQuestionTypes] = useState(['mix'])
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [gradingShortAnswers, setGradingShortAnswers] = useState(false)
  const [shortAnswerGrades, setShortAnswerGrades] = useState({})
  
  useEffect(() => {
    loadDocument()
  }, [documentId])
  
  const loadDocument = async () => {
    try {
      const doc = await getDocument(documentId)
      setDocument(doc)
    } catch (error) {
      alert('Failed to load document')
      navigate('/documents')
    }
  }
  
  const handleGenerateQuiz = async () => {
    setLoading(true)
    setQuiz(null)
    setAnswers({})
    setShowResults(false)
    
    try {
      const result = await generateQuiz(
        documentId,
        numQuestions,
        difficulty,
        topic || null,
        questionTypes
      )
      setQuiz(result)
    } catch (error) {
      alert('Failed to generate quiz')
    } finally {
      setLoading(false)
    }
  }
  
  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }))
  }
  
  const handleSubmit = async () => {
    setGradingShortAnswers(true)
    setShowResults(true)
    
    // Grade short answer questions
    const grades = {}
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i]
      if (question.type === 'short_answer' && answers[i]) {
        try {
          const grade = await gradeShortAnswer(
            answers[i],
            question.expected_answer,
            question.key_points || [],
            question.question
          )
          grades[i] = grade
        } catch (error) {
          console.error('Failed to grade question', i, error)
          grades[i] = {
            score: 0,
            feedback: 'Failed to grade automatically',
            points_covered: [],
            points_missed: question.key_points || []
          }
        }
      }
    }
    
    setShortAnswerGrades(grades)
    setGradingShortAnswers(false)
  }
  
  const calculateScore = () => {
    let correct = 0
    let total = quiz.questions.length
    
    quiz.questions.forEach((question, index) => {
      if (question.type === 'short_answer') {
        // Use AI grade
        if (shortAnswerGrades[index]) {
          correct += shortAnswerGrades[index].score / 100
        }
      } else {
        // Use checkAnswer for MCQ and fill_blank
        const isCorrect = checkAnswer(question, answers[index])
        if (isCorrect) {
          correct++
        }
        // Debug logging
        if (question.type === 'mcq') {
          console.log(`Q${index + 1} MCQ:`, {
            userAnswer: answers[index],
            correctAnswer: question.correct_answer,
            isCorrect: isCorrect,
            match: answers[index]?.trim() === question.correct_answer?.trim()
          })
        }
      }
    })
    
    return {
      correct: Math.round(correct * 10) / 10,
      total: total,
      percentage: Math.round((correct / total) * 100)
    }
  }
  
  const checkAnswer = (question, answer) => {
    if (!answer) return false
    
    if (question.type === 'mcq') {
      // For MCQ, do exact string comparison (case-sensitive, trimmed)
      const userAnswer = answer.trim()
      const correctAnswer = question.correct_answer.trim()
      return userAnswer === correctAnswer
    } else if (question.type === 'fill_blank') {
      // Case-insensitive comparison with trimmed whitespace
      return answer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim()
    }
    
    return null // For short answer, we'll grade it differently
  }
  
  if (!document) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/documents')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <ClipboardList className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Quiz Generator
            </h1>
            <p className="text-sm text-gray-500">
              {document.original_filename}
            </p>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Configure Quiz</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions
            </label>
            <input
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              min="1"
              max="20"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic (Optional)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Leave empty for all topics"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        
        {/* Question Type Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Types
          </label>
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'mix', label: 'Mix (All Types)' },
              { value: 'mcq', label: 'Multiple Choice' },
              { value: 'fill_blank', label: 'Fill in the Blank' },
              { value: 'short_answer', label: 'Short Answer' }
            ].map(type => (
              <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="questionType"
                  value={type.value}
                  checked={questionTypes.includes(type.value)}
                  onChange={(e) => setQuestionTypes([e.target.value])}
                  className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                />
                <span className="text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>
        
        <button
          onClick={handleGenerateQuiz}
          disabled={loading}
          className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              <span>Generating Quiz...</span>
            </>
          ) : (
            <span>Generate Quiz</span>
          )}
        </button>
      </div>
      
      {/* Quiz Display */}
      {quiz && quiz.questions && quiz.questions.length > 0 && (
        <div className="space-y-4">
          {quiz.questions.map((question, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Question {index + 1}
                </h3>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {question.type.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <p className="text-gray-800 mb-4">{question.question}</p>
              
              {question.type === 'mcq' && (
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <label
                      key={optIndex}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        showResults
                          ? option === question.correct_answer
                            ? 'border-green-500 bg-green-50'
                            : answers[index] === option
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        checked={answers[index] === option}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        disabled={showResults}
                        className="text-primary"
                      />
                      <span>{option}</span>
                      {showResults && option === question.correct_answer && (
                        <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                      )}
                      {showResults && answers[index] === option && option !== question.correct_answer && (
                        <XCircle className="h-5 w-5 text-red-500 ml-auto" />
                      )}
                    </label>
                  ))}
                </div>
              )}
              
              {(question.type === 'fill_blank' || question.type === 'short_answer') && (
                <input
                  type="text"
                  value={answers[index] || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  disabled={showResults}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Type your answer here..."
                />
              )}
              
              {showResults && question.type === 'short_answer' && shortAnswerGrades[index] && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-purple-900">AI Grading:</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      shortAnswerGrades[index].score >= 80 ? 'bg-green-100 text-green-800' :
                      shortAnswerGrades[index].score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      Score: {shortAnswerGrades[index].score}/100
                    </span>
                  </div>
                  <p className="text-sm text-purple-800 mb-2">{shortAnswerGrades[index].feedback}</p>
                  
                  {shortAnswerGrades[index].points_covered.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-green-700 mb-1">✓ Points Covered:</p>
                      <ul className="text-xs text-green-700 list-disc list-inside">
                        {shortAnswerGrades[index].points_covered.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {shortAnswerGrades[index].points_missed.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-red-700 mb-1">✗ Points Missed:</p>
                      <ul className="text-xs text-red-700 list-disc list-inside">
                        {shortAnswerGrades[index].points_missed.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <p className="text-xs text-purple-700 mt-3">
                    <span className="font-semibold">Expected Answer:</span> {question.expected_answer}
                  </p>
                </div>
              )}
              
              {showResults && question.explanation && question.type !== 'short_answer' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
                  <p className="text-sm text-blue-800">{question.explanation}</p>
                  {question.type !== 'mcq' && (
                    <p className="text-sm text-blue-800 mt-2">
                      <span className="font-semibold">Correct Answer:</span> {question.correct_answer || question.expected_answer}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {!showResults && (
            <button
              onClick={handleSubmit}
              disabled={gradingShortAnswers}
              className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {gradingShortAnswers ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Grading Answers...</span>
                </>
              ) : (
                <span>Submit Answers</span>
              )}
            </button>
          )}
          
          {showResults && !gradingShortAnswers && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Results</h3>
              <p className="text-4xl font-bold text-primary mb-2">
                {calculateScore().percentage}%
              </p>
              <p className="text-gray-600 mb-4">
                You scored {calculateScore().correct} out of {calculateScore().total} questions
              </p>
              <p className="text-gray-600 mb-4">
                Review your answers above and check the explanations
              </p>
              <button
                onClick={() => {
                  setQuiz(null)
                  setAnswers({})
                  setShowResults(false)
                  setShortAnswerGrades({})
                }}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Generate New Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Quiz
