interface Window {
  SpeechRecognition: typeof SpeechRecognition
  webkitSpeechRecognition: typeof SpeechRecognition
}

interface SpeechRecognition {
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: SpeechRecognitionError) => void
  onstart: () => void
  onend: () => void
  start: () => void
  stop: () => void
  continuous: boolean
  lang: string
  interimResults: boolean
  maxAlternatives: number
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
  emma: string
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  0: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionError {
  error: string
  message: string
}

