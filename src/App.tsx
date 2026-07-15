import { useEffect, useRef, useState } from 'react'

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [brightness, setBrightness] = useState(0)
  const [brightnessHistory, setBrightnessHistory] = useState<number[]>([])

  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')

  const PASSWORD_HASH =
    '1b5b1039a3474e35e86a1f8cb68e4fa890db1b90abb36caedec253dc836964ff'

  useEffect(() => {
    const savedAuth = localStorage.getItem('authenticated')

    if (savedAuth === 'true') {
      setAuthenticated(true)
    }
  }, [])

  const sha256 = async (text: string) => {
    const data = new TextEncoder().encode(text)

    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      data
    )

    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  const login = async () => {
    const hash = await sha256(password)

    if (hash === PASSWORD_HASH) {
      localStorage.setItem('authenticated', 'true')
      setAuthenticated(true)
    } else {
      alert('パスコードが違います')
    }
  }

  const logout = () => {
    localStorage.removeItem('authenticated')
    setAuthenticated(false)
    setPassword('')
  }

  const startCamera = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
          },
        })

      if (videoRef.current) {
        videoRef.current.srcObject = stream

        videoRef.current.onloadedmetadata = () => {
          startBrightnessMonitoring()
        }
      }
    } catch (error) {
      console.error(error)

      if (error instanceof Error) {
        alert(error.name + ': ' + error.message)
      } else {
        alert('カメラの起動に失敗しました')
      }
    }
  }

  const startBrightnessMonitoring = () => {
    setInterval(() => {
      const video = videoRef.current
      const canvas = canvasRef.current

      if (!video || !canvas) return

      const ctx = canvas.getContext('2d')

      if (!ctx) return

      canvas.width = 100
      canvas.height = 100

      ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      )

      const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      )

      const data = imageData.data

      let sum = 0

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        sum += (r + g + b) / 3
      }

      const avg =
        sum / (data.length / 4)
      
      const brightnessValue = Math.round(avg)

      setBrightness(
        brightnessValue
      )

      setBrightnessHistory((prev) => [
        ...prev.slice(-299),
        brightnessValue,
      ])

    }, 200)
  }

  if (!authenticated) {
    return (
      <div>
        <h1>HRV Monitor</h1>

        <p>パスコードを入力してください</p>

        <input
          type="password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <br />
        <br />

        <button onClick={login}>
          ログイン
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1>HRV Monitor</h1>

      <button onClick={logout}>
        ログアウト
      </button>

      <br />
      <br />

      <button onClick={startCamera}>
        カメラ起動
      </button>

      <br />
      <br />

      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="300"
      />

      <p>
        平均輝度: {brightness}
      </p>
      <p>
        データ数： {brightnessHistory.length}
      </p>
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
    </div>
  )
}

export default App