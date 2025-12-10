import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Loader } from 'lucide-react'
import { getDocument, generateSummary } from '../services/api'
import { TextToSpeechButton } from '../hooks/useTextToSpeech'

function Summary() {
  const { documentId } = useParams()
  const navigate = useNavigate()
  const [document, setDocument] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [summaryType, setSummaryType] = useState('concise')
  const [pageNumber, setPageNumber] = useState('')
  
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
  
  const handleGenerateSummary = async () => {
    setLoading(true)
    setSummary(null)
    
    try {
      const page = pageNumber ? parseInt(pageNumber) : null
      const result = await generateSummary(documentId, summaryType, page)
      setSummary(result)
    } catch (error) {
      alert('Failed to generate summary')
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
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Summary Generator
            </h1>
            <p className="text-sm text-gray-500">
              {document.original_filename}
            </p>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Configure Summary</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary Type
            </label>
            <select
              value={summaryType}
              onChange={(e) => setSummaryType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="concise">Concise (Brief overview)</option>
              <option value="detailed">Detailed (Comprehensive)</option>
              <option value="bullet_points">Bullet Points</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Number (Optional)
            </label>
            <input
              type="number"
              value={pageNumber}
              onChange={(e) => setPageNumber(e.target.value)}
              placeholder={`Leave empty for full document (1-${document.total_pages})`}
              min="1"
              max={document.total_pages}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <button
            onClick={handleGenerateSummary}
            disabled={loading}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Generating Summary...</span>
              </>
            ) : (
              <span>Generate Summary</span>
            )}
          </button>
        </div>
      </div>
      
      {/* Summary Display */}
      {summary && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
            <div className="flex items-center space-x-4">
              <TextToSpeechButton text={summary.summary} />
              <div className="text-sm text-gray-500">
                {summary.page_number ? `Page ${summary.page_number}` : 'Full Document'} • 
                {summary.chunks_used} chunks analyzed
              </div>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <div className="bg-gray-50 rounded-lg p-6 whitespace-pre-wrap">
              {summary.summary}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Summary
