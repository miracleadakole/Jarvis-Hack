"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VoiceSelectorProps {
  onVoiceSelected: (voice: SpeechSynthesisVoice) => void
}

export default function VoiceSelector({ onVoiceSelected }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("")

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      if (availableVoices.length > 0) {
        // Filter to English voices and limit to 20
        const englishVoices = availableVoices.filter((voice) => voice.lang.startsWith("en-")).slice(0, 20)
        setVoices(englishVoices)
        const defaultVoice = englishVoices.find((voice) => voice.default) || englishVoices[0]
        setSelectedVoiceId(defaultVoice.voiceURI)
        onVoiceSelected(defaultVoice)
      }
    }

    loadVoices()
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [onVoiceSelected])

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoiceId(voiceId)
    const selectedVoice = voices.find((voice) => voice.voiceURI === voiceId)
    if (selectedVoice) {
      onVoiceSelected(selectedVoice)
    }
  }

  return (
    <Select value={selectedVoiceId} onValueChange={handleVoiceChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select voice" />
      </SelectTrigger>
      <SelectContent>
        {voices.map((voice) => (
          <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
            {voice.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

