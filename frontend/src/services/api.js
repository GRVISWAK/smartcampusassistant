import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Documents API
export const uploadDocument = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

export const getDocuments = async () => {
  const response = await api.get('/documents/')
  return response.data
}

export const getDocument = async (documentId) => {
  const response = await api.get(`/documents/${documentId}`)
  return response.data
}

export const deleteDocument = async (documentId) => {
  await api.delete(`/documents/${documentId}`)
}

// Chat API
export const chatWithDocument = async (documentId, question, includeSources = true, chatHistory = []) => {
  const response = await api.post('/chat/', {
    document_id: documentId,
    question,
    include_sources: includeSources,
    chat_history: chatHistory
  })
  return response.data
}

// Summary API
export const generateSummary = async (documentId, summaryType = 'concise', pageNumber = null) => {
  const response = await api.post('/summary/', {
    document_id: documentId,
    summary_type: summaryType,
    page_number: pageNumber
  })
  return response.data
}

// Quiz API
export const generateQuiz = async (documentId, numQuestions = 5, difficulty = 'medium', topic = null, questionTypes = null) => {
  const response = await api.post('/quiz/', {
    document_id: documentId,
    num_questions: numQuestions,
    difficulty,
    topic,
    question_types: questionTypes
  })
  return response.data
}

export const gradeShortAnswer = async (userAnswer, expectedAnswer, keyPoints, question) => {
  const response = await api.post('/quiz/grade', {
    user_answer: userAnswer,
    expected_answer: expectedAnswer,
    key_points: keyPoints,
    question: question
  })
  return response.data
}

// Study Plan API
export const createStudyPlan = async (planData) => {
  const response = await api.post('/study-plan/', planData)
  return response.data
}

export const getStudyPlans = async () => {
  const response = await api.get('/study-plan/')
  return response.data
}

export const getStudyPlan = async (planId) => {
  const response = await api.get(`/study-plan/${planId}`)
  return response.data
}

export const deleteStudyPlan = async (planId) => {
  await api.delete(`/study-plan/${planId}`)
}

export default api
