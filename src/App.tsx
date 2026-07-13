import { useRef } from 'react'

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error(error)

      if (error instanceof Error) {
         alert(error.name + ": " + error.message)
      } else {
        alert("カメラの起動に失敗しました")
      }
    }
  }

  return (
    <div>
      <h1>HRV Monitor</h1>

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
    </div>
  )
}

export default App