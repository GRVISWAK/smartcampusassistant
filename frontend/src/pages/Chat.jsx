import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, Loader, ArrowLeft, BookOpen } from 'lucide-react'
import { getDocument, chatWithDocument } from '../services/api'
import { TextToSpeechButton } from '../hooks/useTextToSpeech'

function Chat() {
  const { documentId } = useParams()
  const navigate = useNavigate()
  const [document, setDocument] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  
  useEffect(() => {
    loadDocument()
  }, [documentId])
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const loadDocument = async () => {
    try {
      const doc = await getDocument(documentId)
      setDocument(doc)
      
      // Add welcome message
      setMessages([{
        type: 'assistant',
        content: `Hello! I'm ready to answer questions about "${doc.original_filename}". What would you like to know?`,
        timestamp: new Date()
      }])
    } catch (error) {
      alert('Failed to load document')
      navigate('/documents')
    }
  }
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    
    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setLoading(true)
    
    try {
      // Send conversation history (last 10 messages) for context
      const chatHistory = messages.slice(-10).map(msg => ({
        type: msg.type === 'assistant' ? 'bot' : msg.type,
        content: msg.content
      }))
      
      const response = await chatWithDocument(documentId, currentInput, true, chatHistory)
      
      const assistantMessage = {
        type: 'assistant',
        content: response.answer,
        sources: response.sources,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage = {
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }
  
  if (!document) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/documents')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <BookOpen className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {document.original_filename}
              </h1>
              <p className="text-sm text-gray-500">
                {document.total_pages} pages • {document.total_chunks} chunks
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col" style={{ height: '600px' }}>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.type === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-start justify-between space-x-3">
                  <p className="whitespace-pre-wrap flex-1">{message.content}</p>
                  {message.type === 'bot' && (
                    <TextToSpeechButton text={message.content} />
                  )}
                </div>
                
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-xs font-semibold mb-2">Sources:</p>
                    {message.sources.map((source, idx) => (
                      <div key={idx} className="text-xs mb-2">
                        <span className="font-medium">Page {source.page_number}</span>
                        <span className="mx-2">•</span>
                        <span className="opacity-75">{source.chunk_text}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-xs opacity-75 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4">
                <Loader className="h-5 w-5 animate-spin text-primary" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Form */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this document..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Chat
