import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Trash2, MessageSquare, FileBarChart, ClipboardList, Loader } from 'lucide-react'
import FileUpload from '../components/FileUpload'
import { uploadDocument, getDocuments, deleteDocument } from '../services/api'

function Documents() {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadDocuments()
  }, [])
  
  const loadDocuments = async () => {
    try {
      const docs = await getDocuments()
      setDocuments(docs)
    } catch (error) {
      console.error('Failed to load documents:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleUpload = async (file) => {
    await uploadDocument(file)
    await loadDocuments()
  }
  
  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(documentId)
        await loadDocuments()
      } catch (error) {
        alert('Failed to delete document')
      }
    }
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Documents</h1>
        <p className="text-gray-600">Upload and manage your study materials</p>
      </div>
      
      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload New Document</h2>
        <FileUpload onUploadSuccess={handleUpload} />
      </div>
      
      {/* Documents List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Documents</h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No documents yet. Upload your first PDF to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <FileText className="h-10 w-10 text-primary mt-1" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {doc.original_filename}
                      </h3>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>{doc.total_pages} pages</span>
                        <span>•</span>
                        <span>{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                        <span>•</span>
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {doc.text_preview}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/chat/${doc.id}`)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Chat</span>
                  </button>
                  
                  <button
                    onClick={() => navigate(`/summary/${doc.id}`)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <FileBarChart className="h-4 w-4" />
                    <span>Summary</span>
                  </button>
                  
                  <button
                    onClick={() => navigate(`/quiz/${doc.id}`)}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <ClipboardList className="h-4 w-4" />
                    <span>Quiz</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Documents
