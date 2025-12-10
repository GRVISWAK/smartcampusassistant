import { useState, useEffect } from 'react'
import { Calendar, Loader, Trash2, Eye } from 'lucide-react'
import { createStudyPlan, getStudyPlans, deleteStudyPlan } from '../services/api'

function StudyPlan() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    syllabus: '',
    difficulty_level: 'medium',
    start_date: '',
    exam_date: '',
    daily_hours: 2
  })
  
  useEffect(() => {
    loadPlans()
  }, [])
  
  const loadPlans = async () => {
    try {
      const data = await getStudyPlans()
      setPlans(data)
    } catch (error) {
      console.error('Failed to load study plans:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setCreating(true)
    
    try {
      await createStudyPlan(formData)
      await loadPlans()
      
      // Reset form
      setFormData({
        title: '',
        syllabus: '',
        difficulty_level: 'medium',
        start_date: '',
        exam_date: '',
        daily_hours: 2
      })
      
      alert('Study plan created successfully!')
    } catch (error) {
      alert('Failed to create study plan: ' + error.message)
    } finally {
      setCreating(false)
    }
  }
  
  const handleDelete = async (planId) => {
    if (window.confirm('Are you sure you want to delete this study plan?')) {
      try {
        await deleteStudyPlan(planId)
        await loadPlans()
      } catch (error) {
        alert('Failed to delete study plan')
      }
    }
  }
  
  const viewPlan = (plan) => {
    setSelectedPlan(plan)
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Plans</h1>
        <p className="text-gray-600">Create personalized study schedules for your exams</p>
      </div>
      
      {/* Create Study Plan Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Study Plan</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="e.g., Computer Science Midterm"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Syllabus / Topics to Cover
            </label>
            <textarea
              name="syllabus"
              value={formData.syllabus}
              onChange={handleInputChange}
              required
              rows="4"
              placeholder="List all topics you need to cover, separated by commas or new lines"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Date
              </label>
              <input
                type="date"
                name="exam_date"
                value={formData.exam_date}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                name="difficulty_level"
                value={formData.difficulty_level}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Study Hours
              </label>
              <input
                type="number"
                name="daily_hours"
                value={formData.daily_hours}
                onChange={handleInputChange}
                min="1"
                max="12"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={creating}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {creating ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Creating Study Plan...</span>
              </>
            ) : (
              <>
                <Calendar className="h-5 w-5" />
                <span>Generate Study Plan</span>
              </>
            )}
          </button>
        </form>
      </div>
      
      {/* Study Plans List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Study Plans</h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No study plans yet. Create your first one above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>📅 {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.exam_date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>⏱️ {plan.total_days} days</span>
                      <span>•</span>
                      <span>📊 {plan.difficulty_level}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{plan.syllabus}</p>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => viewPlan(plan)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Plan Details Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedPlan.title}</h2>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Syllabus</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedPlan.syllabus}</p>
              </div>
              
              {/* Weekly Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Plan</h3>
                <div className="space-y-4">
                  {(() => {
                    try {
                      const weeklyPlan = JSON.parse(selectedPlan.weekly_plan)
                      return weeklyPlan.map((week, index) => (
                        <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                          <div className="flex items-center mb-3">
                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                              Week {week.week}
                            </span>
                            {week.hours_per_day && (
                              <span className="ml-3 text-sm text-gray-600">
                                ⏱️ {week.hours_per_day} hours/day
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            {week.topics && week.topics.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">📚 Topics:</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-700">
                                  {week.topics.map((topic, i) => (
                                    <li key={i}>{topic}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {week.daily_focus && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-1">🎯 Daily Focus:</h4>
                                <p className="text-gray-700">{week.daily_focus}</p>
                              </div>
                            )}
                            
                            {week.focus_areas && week.focus_areas.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">🔍 Focus Areas:</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-700">
                                  {week.focus_areas.map((area, i) => (
                                    <li key={i}>{area}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {week.milestones && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-1">🏆 Milestones:</h4>
                                <p className="text-gray-700">{week.milestones}</p>
                              </div>
                            )}
                            
                            {week.topics_covered && week.topics_covered.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">✅ Topics Covered:</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-700">
                                  {week.topics_covered.map((topic, i) => (
                                    <li key={i}>{topic}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    } catch (e) {
                      return <p className="text-gray-500">No weekly plan available</p>
                    }
                  })()}
                </div>
              </div>
              
              {/* Daily Schedule / Key Dates */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Schedule & Key Dates</h3>
                <div className="space-y-3">
                  {(() => {
                    try {
                      const dailyPlan = JSON.parse(selectedPlan.daily_plan)
                      if (Array.isArray(dailyPlan) && dailyPlan.length > 0) {
                        // Check if it's daily breakdown or key dates
                        if (dailyPlan[0].day) {
                          // Daily breakdown format
                          return dailyPlan.map((day, index) => (
                            <div key={index} className="bg-green-50 rounded-lg p-4 border border-green-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                  Day {day.day}
                                </span>
                                {day.estimated_hours && (
                                  <span className="text-sm text-gray-600">⏱️ {day.estimated_hours} hours</span>
                                )}
                              </div>
                              
                              {day.topics && day.topics.length > 0 && (
                                <div className="mb-2">
                                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Topics:</h4>
                                  <ul className="list-disc list-inside text-sm text-gray-700">
                                    {day.topics.map((topic, i) => (
                                      <li key={i}>{topic}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {day.focus_areas && day.focus_areas.length > 0 && (
                                <div className="mb-2">
                                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Focus:</h4>
                                  <ul className="list-disc list-inside text-sm text-gray-700">
                                    {day.focus_areas.map((area, i) => (
                                      <li key={i}>{area}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {day.goals && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Goals:</h4>
                                  <p className="text-sm text-gray-700">{day.goals}</p>
                                </div>
                              )}
                            </div>
                          ))
                        } else if (dailyPlan[0].date) {
                          // Key dates format
                          return dailyPlan.map((item, index) => (
                            <div key={index} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                              <div className="flex items-start">
                                <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold mr-3">
                                  {item.date}
                                </span>
                                <p className="text-gray-700 flex-1">{item.activity}</p>
                              </div>
                            </div>
                          ))
                        }
                      }
                      return <p className="text-gray-500">No daily schedule available</p>
                    } catch (e) {
                      return <p className="text-gray-500">No daily schedule available</p>
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function X({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export default StudyPlan
