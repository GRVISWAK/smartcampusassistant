import { useState, useEffect } from 'react'
import { Volume2, VolumeX, Pause, Play } from 'lucide-react'

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      setVoices(availableVoices)
      // Set default voice (prefer English voices)
      const englishVoice = availableVoices.find(voice => voice.lang.startsWith('en'))
      setSelectedVoice(englishVoice || availableVoices[0])
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  const speak = (text, options = {}) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    if (!text) return

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Set voice
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    // Set options
    utterance.rate = options.rate || 1.0 // Speed (0.1 to 10)
    utterance.pitch = options.pitch || 1.0 // Pitch (0 to 2)
    utterance.volume = options.volume || 1.0 // Volume (0 to 1)

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true)
      setIsPaused(false)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      setIsPaused(false)
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event)
      setIsSpeaking(false)
      setIsPaused(false)
    }

    window.speechSynthesis.speak(utterance)
  }

  const pause = () => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }

  const resume = () => {
    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
    }
  }

  const stop = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
  }

  return {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    voices,
    selectedVoice,
    setSelectedVoice
  }
}

export function TextToSpeechButton({ text, className = '' }) {
  const { speak, stop, isSpeaking, isPaused, pause, resume } = useTextToSpeech()

  const handleClick = () => {
    if (isSpeaking) {
      if (isPaused) {
        resume()
      } else {
        pause()
      }
    } else {
      speak(text)
    }
  }

  const handleStop = (e) => {
    e.stopPropagation()
    stop()
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={handleClick}
        className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center space-x-2"
        title={isSpeaking ? (isPaused ? 'Resume' : 'Pause') : 'Listen'}
      >
        {isSpeaking ? (
          isPaused ? (
            <>
              <Play className="h-4 w-4" />
              <span className="text-sm">Resume</span>
            </>
          ) : (
            <>
              <Pause className="h-4 w-4" />
              <span className="text-sm">Pause</span>
            </>
          )
        ) : (
          <>
            <Volume2 className="h-4 w-4" />
            <span className="text-sm">Listen</span>
          </>
        )}
      </button>
      
      {isSpeaking && (
        <button
          onClick={handleStop}
          className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
          title="Stop"
        >
          <VolumeX className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default useTextToSpeech
