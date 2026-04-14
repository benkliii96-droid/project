import { useEffect, useRef, useState, useCallback } from 'react'
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision'
import { Camera, CameraOff, RefreshCw, AlertCircle } from 'lucide-react'

// MediaPipe landmark indices
const LM = {
  LEFT_SHOULDER: 11,  RIGHT_SHOULDER: 12,
  LEFT_ELBOW:    13,  RIGHT_ELBOW:    14,
  LEFT_WRIST:    15,  RIGHT_WRIST:    16,
  LEFT_HIP:      23,  RIGHT_HIP:      24,
  LEFT_KNEE:     25,  RIGHT_KNEE:     26,
  LEFT_ANKLE:    27,  RIGHT_ANKLE:    28,
}

type Lm = { x: number; y: number; z: number; visibility?: number }

/** Angle at joint B formed by A-B-C (degrees) */
function jointAngle(a: Lm, b: Lm, c: Lm): number {
  const ab = { x: a.x - b.x, y: a.y - b.y }
  const cb = { x: c.x - b.x, y: c.y - b.y }
  const dot = ab.x * cb.x + ab.y * cb.y
  const mag = Math.hypot(ab.x, ab.y) * Math.hypot(cb.x, cb.y)
  if (mag === 0) return 180
  return (Math.acos(Math.min(1, Math.max(-1, dot / mag))) * 180) / Math.PI
}

/** All landmarks must be visible enough to count */
function visible(lms: Lm[], indices: number[], threshold = 0.55): boolean {
  return indices.every(i => (lms[i]?.visibility ?? 1) >= threshold)
}

/** True if person appears to be horizontal (for push-ups / plank) */
function isHorizontal(lms: Lm[]): boolean {
  const shoulderY = (lms[LM.LEFT_SHOULDER].y + lms[LM.RIGHT_SHOULDER].y) / 2
  const hipY      = (lms[LM.LEFT_HIP].y    + lms[LM.RIGHT_HIP].y) / 2
  const ankleY    = (lms[LM.LEFT_ANKLE].y  + lms[LM.RIGHT_ANKLE].y) / 2
  // In horizontal position shoulders, hips, and ankles are roughly at same Y
  return Math.abs(shoulderY - hipY) < 0.25 && Math.abs(hipY - ankleY) < 0.25
}

/** True if person appears to be standing/seated upright (for squats, curls) */
function isUpright(lms: Lm[]): boolean {
  const shoulderY = (lms[LM.LEFT_SHOULDER].y + lms[LM.RIGHT_SHOULDER].y) / 2
  const hipY      = (lms[LM.LEFT_HIP].y    + lms[LM.RIGHT_HIP].y) / 2
  return hipY - shoulderY > 0.15   // hips below shoulders in image coords
}

type ExStrategy = {
  /** Relevant landmark indices that must be visible */
  landmarks: number[]
  /** Returns the key angle value */
  measure: (lms: Lm[]) => number
  /** Angle threshold to enter "down" phase */
  downThreshold: number
  /** Angle threshold to enter "up" phase (must be > downThreshold + margin) */
  upThreshold: number
  /** Guard: returns false when body is in wrong position for this exercise */
  positionOk: (lms: Lm[]) => boolean
  downLabel: string
  upLabel: string
  wrongPositionLabel: string
}

function getStrategy(name: string): ExStrategy {
  const n = name.toLowerCase()

  if (n.includes('squat') || n.includes('lunge')) {
    return {
      landmarks: [LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE,
                  LM.RIGHT_HIP, LM.RIGHT_KNEE, LM.RIGHT_ANKLE],
      measure: lms =>
        (jointAngle(lms[LM.LEFT_HIP],  lms[LM.LEFT_KNEE],  lms[LM.LEFT_ANKLE]) +
         jointAngle(lms[LM.RIGHT_HIP], lms[LM.RIGHT_KNEE], lms[LM.RIGHT_ANKLE])) / 2,
      downThreshold: 105,
      upThreshold:   160,
      positionOk: isUpright,
      downLabel: 'Go lower — break parallel',
      upLabel:   'Stand up tall',
      wrongPositionLabel: 'Stand facing the camera',
    }
  }

  if (n.includes('push') || n.includes('press')) {
    return {
      landmarks: [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST,
                  LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST],
      measure: lms =>
        (jointAngle(lms[LM.LEFT_SHOULDER],  lms[LM.LEFT_ELBOW],  lms[LM.LEFT_WRIST]) +
         jointAngle(lms[LM.RIGHT_SHOULDER], lms[LM.RIGHT_ELBOW], lms[LM.RIGHT_WRIST])) / 2,
      downThreshold: 95,
      upThreshold:   155,
      positionOk: isHorizontal,
      downLabel: 'Push up — extend arms',
      upLabel:   'Lower chest to floor',
      wrongPositionLabel: 'Get into push-up position (horizontal)',
    }
  }

  if (n.includes('curl') || n.includes('bicep')) {
    return {
      landmarks: [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST,
                  LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST],
      measure: lms =>
        (jointAngle(lms[LM.LEFT_SHOULDER],  lms[LM.LEFT_ELBOW],  lms[LM.LEFT_WRIST]) +
         jointAngle(lms[LM.RIGHT_SHOULDER], lms[LM.RIGHT_ELBOW], lms[LM.RIGHT_WRIST])) / 2,
      downThreshold: 65,
      upThreshold:   150,
      positionOk: isUpright,
      downLabel: 'Extend arms fully',
      upLabel:   'Curl up — squeeze bicep',
      wrongPositionLabel: 'Stand upright facing the camera',
    }
  }

  if (n.includes('row') || n.includes('pull') || n.includes('lat')) {
    return {
      landmarks: [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST,
                  LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST],
      measure: lms =>
        (jointAngle(lms[LM.LEFT_SHOULDER],  lms[LM.LEFT_ELBOW],  lms[LM.LEFT_WRIST]) +
         jointAngle(lms[LM.RIGHT_SHOULDER], lms[LM.RIGHT_ELBOW], lms[LM.RIGHT_WRIST])) / 2,
      downThreshold: 80,
      upThreshold:   150,
      positionOk: () => true,
      downLabel: 'Pull elbows back — squeeze',
      upLabel:   'Extend arms forward',
      wrongPositionLabel: 'Face the camera',
    }
  }

  if (n.includes('deadlift') || n.includes('hinge') || n.includes('rdl')) {
    return {
      landmarks: [LM.LEFT_SHOULDER, LM.LEFT_HIP, LM.LEFT_KNEE,
                  LM.RIGHT_SHOULDER, LM.RIGHT_HIP, LM.RIGHT_KNEE],
      measure: lms =>
        (jointAngle(lms[LM.LEFT_SHOULDER],  lms[LM.LEFT_HIP],  lms[LM.LEFT_KNEE]) +
         jointAngle(lms[LM.RIGHT_SHOULDER], lms[LM.RIGHT_HIP], lms[LM.RIGHT_KNEE])) / 2,
      downThreshold: 105,
      upThreshold:   165,
      positionOk: () => true,
      downLabel: 'Drive hips forward — stand tall',
      upLabel:   'Hinge at hips — push back',
      wrongPositionLabel: 'Stand side-on to the camera',
    }
  }

  // Generic — detect significant vertical wrist movement
  return {
    landmarks: [LM.LEFT_WRIST, LM.RIGHT_WRIST, LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER],
    measure: lms => {
      const wristY    = (lms[LM.LEFT_WRIST].y    + lms[LM.RIGHT_WRIST].y) / 2
      const shoulderY = (lms[LM.LEFT_SHOULDER].y + lms[LM.RIGHT_SHOULDER].y) / 2
      // Return angle-like value: distance from shoulder as % of frame height * 180
      return Math.min(180, Math.abs(wristY - shoulderY) * 500)
    },
    downThreshold: 40,
    upThreshold:   90,
    positionOk: () => true,
    downLabel: 'Move through full range',
    upLabel:   'Keep moving — good pace',
    wrongPositionLabel: 'Step into frame',
  }
}

// ── Debounce helper ──────────────────────────────────────────────────────────
// Require N consecutive frames in a new state before committing to it
const DEBOUNCE_FRAMES = 4

interface Props {
  exerciseName: string
  targetReps: number
}

export default function ExerciseCamera({ exerciseName, targetReps }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const landmarkerRef  = useRef<PoseLandmarker | null>(null)
  const streamRef      = useRef<MediaStream | null>(null)
  const rafRef         = useRef<number>(0)

  // Rep-counting state kept in refs to avoid stale closures in rAF
  const repStateRef    = useRef<'up' | 'down'>('up')
  const debounceRef    = useRef(0)
  const pendingStateRef = useRef<'up' | 'down' | null>(null)

  const [cameraActive, setCameraActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reps, setReps] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  const strategy = getStrategy(exerciseName)

  // ── Init MediaPipe ───────────────────────────────────────────────────────

  const initLandmarker = async () => {
    if (landmarkerRef.current) return
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm',
    )
    landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
    })
  }

  // ── Camera ───────────────────────────────────────────────────────────────

  const startCamera = async () => {
    setLoading(true)
    setError('')
    try {
      await initLandmarker()
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraActive(true)
      startDetection()
    } catch {
      setError('Camera access denied or not available.')
    } finally {
      setLoading(false)
    }
  }

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraActive(false)
  }, [])

  // ── Detection loop ───────────────────────────────────────────────────────

  const startDetection = () => {
    const detect = () => {
      const video  = videoRef.current
      const canvas = canvasRef.current
      const lm     = landmarkerRef.current
      if (!video || !canvas || !lm || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(detect)
        return
      }

      canvas.width  = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const results = lm.detectForVideo(video, performance.now())

      if (results.landmarks.length > 0) {
        const rawLandmarks = results.landmarks[0]
        const landmarks = rawLandmarks as Lm[]

        // Draw skeleton
        const du = new DrawingUtils(ctx)
        du.drawConnectors(rawLandmarks, PoseLandmarker.POSE_CONNECTIONS, {
          color: 'rgba(0,201,160,0.5)', lineWidth: 2,
        })
        du.drawLandmarks(rawLandmarks, {
          color: '#00c9a0', fillColor: '#0a0a15', lineWidth: 1, radius: 4,
        })

        // Validate: all needed landmarks visible + body in right position
        const lmsVisible = visible(landmarks, strategy.landmarks)
        const posOk      = strategy.positionOk(landmarks)

        if (!lmsVisible) {
          setFeedback('Step into frame — full body visible')
        } else if (!posOk) {
          setFeedback(strategy.wrongPositionLabel)
          // Reset debounce so stray angles don't count
          debounceRef.current = 0
          pendingStateRef.current = null
        } else {
          // Measure and update rep state with debounce
          const val = strategy.measure(landmarks)
          let desired: 'up' | 'down' | null = null

          if (repStateRef.current === 'up'   && val < strategy.downThreshold) desired = 'down'
          if (repStateRef.current === 'down' && val > strategy.upThreshold)   desired = 'up'

          if (desired !== null && desired === pendingStateRef.current) {
            debounceRef.current++
            if (debounceRef.current >= DEBOUNCE_FRAMES) {
              if (desired === 'down') {
                repStateRef.current = 'down'
                setFeedback(strategy.downLabel)
              } else {
                repStateRef.current = 'up'
                setReps(r => {
                  const next = r + 1
                  setFeedback(`Rep ${next} done! 💪`)
                  setTimeout(() => setFeedback(strategy.upLabel), 900)
                  return next
                })
              }
              debounceRef.current = 0
              pendingStateRef.current = null
            }
          } else if (desired !== null) {
            pendingStateRef.current = desired
            debounceRef.current = 1
          } else {
            debounceRef.current = 0
            pendingStateRef.current = null
          }

          if (!feedback.includes('done') && desired === null) {
            setFeedback(repStateRef.current === 'up' ? strategy.upLabel : strategy.downLabel)
          }
        }
      } else {
        setFeedback('No person detected — step closer')
        debounceRef.current = 0
        pendingStateRef.current = null
      }

      rafRef.current = requestAnimationFrame(detect)
    }
    rafRef.current = requestAnimationFrame(detect)
  }

  useEffect(() => () => { stopCamera() }, [stopCamera])

  useEffect(() => {
    setReps(0)
    repStateRef.current = 'up'
    debounceRef.current = 0
    pendingStateRef.current = null
    setFeedback('')
  }, [exerciseName])

  const repPercent = Math.min(100, (reps / targetReps) * 100)
  const repsDone   = reps >= targetReps

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="section-label">Live Tracking</span>
        {cameraActive && (
          <button
            onClick={stopCamera}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <CameraOff size={13} /> Stop
          </button>
        )}
      </div>

      {/* Video + canvas */}
      <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          playsInline muted
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full scale-x-[-1]"
        />

        {/* Placeholder when camera is off */}
        {!cameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-elevated">
            <Camera size={32} className="text-slate-600" />
            <p className="text-slate-500 text-xs text-center px-6 leading-relaxed">
              AI tracks your reps in real time using pose detection. Position yourself so your full body is visible.
            </p>
            {error && (
              <div className="flex items-center gap-1.5 text-red-400 text-xs px-4">
                <AlertCircle size={13} /> {error}
              </div>
            )}
            <button
              onClick={startCamera}
              disabled={loading}
              className="btn-primary px-5 py-2 text-sm flex items-center gap-2"
            >
              {loading
                ? <><RefreshCw size={13} className="animate-spin" /> Loading AI…</>
                : <><Camera size={13} /> Start Camera</>}
            </button>
          </div>
        )}

        {/* Feedback overlay */}
        {cameraActive && feedback && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap max-w-[90%] text-center">
            {feedback}
          </div>
        )}
      </div>

      {/* Rep counter */}
      {cameraActive && (
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-slate-400">Reps</span>
            <span className="font-bold">
              <span className={repsDone ? 'text-brand-400' : 'text-white'}>{reps}</span>
              <span className="text-slate-500"> / {targetReps}</span>
            </span>
          </div>
          <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${repsDone ? 'bg-brand-400' : 'bg-gradient-to-r from-brand-500 to-cyan-400'}`}
              style={{ width: `${repPercent}%` }}
            />
          </div>
          {repsDone && (
            <p className="text-brand-400 text-xs text-center mt-2 font-semibold">
              Set complete! 🏆
            </p>
          )}
        </div>
      )}
    </div>
  )
}
