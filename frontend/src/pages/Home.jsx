import { useNavigate } from 'react-router-dom'
import { BookOpen, Upload, MessageSquare, FileText, ClipboardList, Calendar } from 'lucide-react'

function Home() {
  const navigate = useNavigate()
  
  const features = [
    {
      icon: Upload,
      title: 'Upload PDFs',
      description: 'Upload your study materials and notes in PDF format',
      action: () => navigate('/documents'),
      color: 'bg-blue-500'
    },
    {
      icon: MessageSquare,
      title: 'AI Chat',
      description: 'Ask questions and get instant answers from your documents',
      action: () => navigate('/documents'),
      color: 'bg-green-500'
    },
    {
      icon: FileText,
      title: 'Smart Summaries',
      description: 'Generate concise summaries of your study materials',
      action: () => navigate('/documents'),
      color: 'bg-purple-500'
    },
    {
      icon: ClipboardList,
      title: 'Quiz Generator',
      description: 'Create practice quizzes from your notes',
      action: () => navigate('/documents'),
      color: 'bg-orange-500'
    },
    {
      icon: Calendar,
      title: 'Study Plans',
      description: 'Get personalized study schedules for your exams',
      action: () => navigate('/study-plan'),
      color: 'bg-pink-500'
    }
  ]
  
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <BookOpen className="h-20 w-20 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to StudyPilot
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your AI-powered study companion. Upload your notes, get instant summaries, 
          practice with quizzes, and create personalized study plans.
        </p>
        <div className="pt-4">
          <button
            onClick={() => navigate('/documents')}
            className="px-8 py-3 bg-primary text-white rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
      
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            onClick={feature.action}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              <feature.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 text-sm">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
      
      {/* How It Works */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Upload', desc: 'Upload your PDF notes or study materials' },
            { step: '2', title: 'Process', desc: 'AI analyzes and indexes your content' },
            { step: '3', title: 'Interact', desc: 'Ask questions, get summaries, or take quizzes' },
            { step: '4', title: 'Learn', desc: 'Study smarter with AI-powered insights' }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                {item.step}
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
