"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { useWalletStore } from "@/lib/store"

interface VoiceControlProps {
  onCommand: (command: string) => void
  selectedVoice: SpeechSynthesisVoice | null
}

export default function VoiceControl({ onCommand, selectedVoice }: VoiceControlProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const recognitionRef = useRef<any>(null)
  const { toast } = useToast()
  const { address: walletAddress } = useWalletStore()

  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex
        const result = event.results[current]
        const transcriptText = result[0].transcript
        setTranscript(transcriptText)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        if (event.error === "not-allowed") {
          setHasPermission(false)
          speakResponse("Microphone access denied. Please allow microphone access in your browser settings.")
          toast({
            variant: "destructive",
            title: "Microphone Access Denied",
            description: "Please allow microphone access in your browser settings to use voice commands.",
          })
        }
        stopRecording()
      }

      recognitionRef.current.onend = () => {
        setIsRecording(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null
        recognitionRef.current.onerror = null
        recognitionRef.current.onend = null
      }
    }
  }, [toast])

  const requestPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setHasPermission(true)
      return true
    } catch (error) {
      console.error("Permission request failed:", error)
      setHasPermission(false)
      speakResponse("Microphone access is required for voice commands. Please allow access in your browser settings.")
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "Microphone access is required for voice commands. Please allow access in your browser settings.",
      })
      return false
    }
  }

  const startRecording = async () => {
    if (hasPermission === null || hasPermission === false) {
      const permissionGranted = await requestPermission()
      if (!permissionGranted) return
    }

    if (!recognitionRef.current || isRecording) return

    try {
      recognitionRef.current.start()
      setIsRecording(true)
      setTranscript("")

      speakResponse("Listening...")
    } catch (error) {
      console.error("Failed to start recording:", error)
      if (error instanceof DOMException && error.name === "InvalidStateError") {
        setIsRecording(true)
      } else {
        speakResponse("Failed to start voice recording. Please try again.")
        toast({
          variant: "destructive",
          title: "Recording Failed",
          description: "Failed to start voice recording. Please try again.",
        })
      }
    }
  }

  const stopRecording = () => {
    if (!recognitionRef.current || !isRecording) return

    try {
      recognitionRef.current.stop()
      setIsRecording(false)

      if (transcript) {
        setIsProcessing(true)
        setTimeout(() => {
          processVoiceCommand(transcript)
          setIsProcessing(false)
        }, 500)
      }
    } catch (error) {
      console.error("Failed to stop recording:", error)
      setIsRecording(false)
    }
  }

  const processVoiceCommand = (command: string) => {
    if (!walletAddress) {
      speakResponse("Please connect your wallet before using voice commands.")
      return
    }

    const parsedCommand = parseVoiceRequest(command)
    if (parsedCommand.error) {
      speakResponse(parsedCommand.error)
      toast({
        variant: "destructive",
        title: "Invalid Command",
        description: parsedCommand.error,
      })
    } else if (parsedCommand.action) {
      onCommand(JSON.stringify(parsedCommand))
      speakResponse(`Processing ${parsedCommand.action} command.`)
    } else {
      speakResponse("I'm not sure how to process that command. Please try again.")
    }
  }

  const parseVoiceRequest = (text: string) => {
    const patterns = {
      create_vm: /(create|start|launch)\s+(vm|virtual\s+machine)/i,
      create_storage: /(create|add)\s+(storage|disk)/i,
      create_k8s: /(create|deploy)\s+(k8s|kubernetes)/i,
      delete_resource: /(delete|remove|stop)\s+(resource|vm|storage|k8s)/i,
      list_resources: /(list|show|get)\s+(resources|vms|storages|k8s)/i,
    }

    let action = null
    const details: any = {}

    for (const [key, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        action = key
        break
      }
    }

    if (!action) return { error: "Invalid command format" }

    const cpuMatch = text.match(/(\d+)\s*(cpu|core)/i)
    const memMatch = text.match(/(\d+)\s*(gb|ram)/i)
    const sizeMatch = text.match(/(\d+)\s*(storage|disk)/i)
    const nodesMatch = text.match(/(\d+)\s*(nodes)/i)
    const idMatch = text.match(/id\s*(\d+)/i)

    if (cpuMatch) details.cpu = Number.parseInt(cpuMatch[1])
    if (memMatch) details.memory = Number.parseInt(memMatch[1])
    if (sizeMatch) details.size = Number.parseInt(sizeMatch[1])
    if (nodesMatch) details.nodes = Number.parseInt(nodesMatch[1])
    if (idMatch) details.resource_id = Number.parseInt(idMatch[1])

    // Validate required specs
    if (action === "create_vm" && (!details.cpu || !details.memory)) {
      return { error: "VM creation requires CPU and memory specifications" }
    } else if (action === "create_storage" && !details.size) {
      return { error: "Storage creation requires size specification" }
    } else if (action === "create_k8s" && !details.nodes) {
      return { error: "Kubernetes creation requires number of nodes" }
    } else if (action === "delete_resource" && !details.resource_id) {
      return { error: "Resource deletion requires a resource ID" }
    }

    return { action, details }
  }

  const speakResponse = (text: string) => {
    if (!selectedVoice) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = selectedVoice
    window.speechSynthesis.speak(utterance)
  }

  return (
    <Card className="bg-gradient-to-r from-gray-800 to-gray-900 border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <motion.div className="relative" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              className={`rounded-full w-20 h-20 flex items-center justify-center transition-all duration-300 ${
                isRecording ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>

            <AnimatePresence>
              {isRecording && (
                <motion.div
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-40"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <WaveformAnimation />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="text-center">
            <p className="text-sm text-gray-300">
              {hasPermission === false
                ? "Microphone access required. Check browser settings."
                : isRecording
                  ? "Listening... Release to process command"
                  : isProcessing
                    ? "Processing command..."
                    : "Tap and hold to speak"}
            </p>
            <AnimatePresence mode="wait">
              {transcript && (
                <motion.p
                  className="mt-2 text-md font-medium text-white"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  "{transcript}"
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function WaveformAnimation() {
  return (
    <div className="flex items-center justify-center space-x-1 h-2">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="bg-blue-500 w-1 rounded-full"
          animate={{
            height: [4, Math.random() * 16 + 4, 4],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.2,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

