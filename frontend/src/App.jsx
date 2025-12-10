import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Documents from './pages/Documents'
import Chat from './pages/Chat'
import Summary from './pages/Summary'
import Quiz from './pages/Quiz'
import StudyPlan from './pages/StudyPlan'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/chat/:documentId" element={<Chat />} />
          <Route path="/summary/:documentId" element={<Summary />} />
          <Route path="/quiz/:documentId" element={<Quiz />} />
          <Route path="/study-plan" element={<StudyPlan />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
