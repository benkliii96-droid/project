import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, Upload, Loader2, Flame, Beef, Wheat, Droplets, Salad } from 'lucide-react'
import { analyzeFoodPhotoAI, type FoodAnalysisResult } from '../lib/openai'

interface Props {
  onClose: () => void
}

export default function FoodAnalyzer({ onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [mode, setMode] = useState<'pick' | 'camera' | 'preview' | 'loading' | 'result'>('pick')
  const [preview, setPreview] = useState<string>('')      // data URL for display
  const [base64, setBase64] = useState<string>('')        // raw base64 for API
  const [mime, setMime] = useState('image/jpeg')
  const [result, setResult] = useState<FoodAnalysisResult | null>(null)
  const [error, setError] = useState('')

  // ── Camera ────────────────────────────────────────────────────────────────

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      setMode('camera')
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }, 50)
    } catch {
      setError('Camera access denied. Please use file upload instead.')
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d')!.drawImage(videoRef.current, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    stopCamera()
    setPreview(dataUrl)
    setBase64(dataUrl.split(',')[1])
    setMime('image/jpeg')
    setMode('preview')
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  // ── File upload ───────────────────────────────────────────────────────────

  const handleFile = (file: File) => {
    setMime(file.type || 'image/jpeg')
    const reader = new FileReader()
    reader.onload = e => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)
      setBase64(dataUrl.split(',')[1])
      setMode('preview')
    }
    reader.readAsDataURL(file)
  }

  // ── Analysis ──────────────────────────────────────────────────────────────

  const analyze = async () => {
    setMode('loading')
    setError('')
    try {
      const res = await analyzeFoodPhotoAI(base64, mime)
      setResult(res)
      setMode('result')
    } catch {
      setError('Could not analyze the image. Make sure there is clearly visible food.')
      setMode('preview')
    }
  }

  const reset = () => {
    stopCamera()
    setPreview('')
    setBase64('')
    setResult(null)
    setError('')
    setMode('pick')
  }

  const handleClose = () => {
    stopCamera()
    onClose()
  }

  const macros = result
    ? [
        { label: 'Calories', value: result.calories, unit: 'kcal', icon: Flame,  color: 'text-orange-400' },
        { label: 'Protein',  value: result.protein,  unit: 'g',    icon: Beef,   color: 'text-brand-400' },
        { label: 'Carbs',    value: result.carbs,    unit: 'g',    icon: Wheat,  color: 'text-yellow-400' },
        { label: 'Fat',      value: result.fat,      unit: 'g',    icon: Droplets, color: 'text-blue-400' },
        { label: 'Fiber',    value: result.fiber,    unit: 'g',    icon: Salad,  color: 'text-green-400' },
      ]
    : []

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-border">
          <div>
            <div className="font-bold">Food Analyzer</div>
            <div className="text-xs text-slate-400">AI-powered nutrition scan</div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <AnimatePresence mode="wait">

            {/* Pick mode */}
            {mode === 'pick' && (
              <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <p className="text-sm text-slate-400 text-center mb-4">Take a photo or upload an image of your meal to get instant macros breakdown.</p>
                <button onClick={openCamera} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                  <Camera size={18} /> Take Photo
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="btn-secondary w-full py-3 flex items-center justify-center gap-2">
                  <Upload size={18} /> Upload from Gallery
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
              </motion.div>
            )}

            {/* Camera mode */}
            {mode === 'camera' && (
              <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="relative rounded-xl overflow-hidden bg-black mb-3" style={{ aspectRatio: '4/3' }}>
                  <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                  {/* Crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-2 border-brand-400/60 rounded-xl" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { stopCamera(); setMode('pick') }} className="btn-secondary flex-1 py-3 text-sm">Cancel</button>
                  <button onClick={capturePhoto} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 text-sm">
                    <Camera size={16} /> Capture
                  </button>
                </div>
              </motion.div>
            )}

            {/* Preview mode */}
            {mode === 'preview' && (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="rounded-xl overflow-hidden mb-3" style={{ aspectRatio: '4/3' }}>
                  <img src={preview} alt="Food" className="w-full h-full object-cover" />
                </div>
                {error && <p className="text-red-400 text-xs text-center mb-2">{error}</p>}
                <div className="flex gap-2">
                  <button onClick={reset} className="btn-secondary flex-1 py-3 text-sm">Retake</button>
                  <button onClick={analyze} className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2">
                    <Flame size={16} /> Analyze
                  </button>
                </div>
              </motion.div>
            )}

            {/* Loading */}
            {mode === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center py-10 gap-4">
                <div className="relative">
                  <img src={preview} alt="Food" className="w-24 h-24 rounded-xl object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={32} className="text-brand-400 animate-spin" />
                  </div>
                </div>
                <p className="text-sm text-slate-400">AI is analyzing your meal…</p>
              </motion.div>
            )}

            {/* Result */}
            {mode === 'result' && result && (
              <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {/* Food photo + name */}
                <div className="flex items-center gap-3 mb-4">
                  <img src={preview} alt="Food" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  <div>
                    <div className="font-bold text-base">{result.foodName}</div>
                    <div className="text-xs text-slate-400">{result.portionDescription}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i < result.healthScore ? 'bg-brand-500' : 'bg-surface-elevated'}`} />
                      ))}
                      <span className="text-xs text-slate-400 ml-1">{result.healthScore}/10</span>
                    </div>
                  </div>
                </div>

                {/* Macros grid */}
                <div className="grid grid-cols-5 gap-1.5 mb-4">
                  {macros.map(m => (
                    <div key={m.label} className="text-center p-2 bg-surface-elevated rounded-xl">
                      <m.icon size={12} className={`${m.color} mx-auto mb-1`} />
                      <div className="text-sm font-bold">{m.value}</div>
                      <div className="text-[10px] text-slate-500">{m.unit}</div>
                      <div className="text-[10px] text-slate-500">{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {result.notes && (
                  <div className="p-3 bg-surface-elevated rounded-xl mb-4 text-xs text-slate-300 leading-relaxed">
                    {result.notes}
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={reset} className="btn-secondary flex-1 py-3 text-sm">Scan Another</button>
                  <button onClick={handleClose} className="btn-primary flex-1 py-3 text-sm">Done</button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
