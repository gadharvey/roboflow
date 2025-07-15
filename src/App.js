import React, { useRef, useState } from "react";
import axios from "axios";
import Webcam from "react-webcam";

const API_URL = "https://72d2cdd55784.ngrok-free.app";

function App() {
  const webcamRef = useRef(null);
  const [useCam, setUseCam] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [videoFile, setVideoFile] = useState(null);
  const [videoURL, setVideoURL] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const captureFromWebcam = () => {
    const screenshot = webcamRef.current.getScreenshot();
    setPreview(screenshot);
    setResult(null);

    // Convertir base64 a archivo
    const byteString = atob(screenshot.split(",")[1]);
    const mimeString = screenshot.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], "captura.jpg", { type: mimeString });
    setImageFile(file);
  };

  const handleDetect = async () => {
    if (!imageFile) {
      alert("Primero selecciona o captura una imagen");
      return;
    }

    const formData = new FormData();
    formData.append("file", imageFile);
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/detectar/`, formData);
      setResult(response.data);
    } catch (err) {
      alert("❌ Error al conectar con la API.");
    }

    setLoading(false);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    setVideoFile(file);
  };

  const handleUploadVideo = async () => {
    if (!videoFile) {
      alert("Selecciona un video");
      return;
    }

    const formData = new FormData();
    formData.append("file", videoFile);

    try {
      const res = await axios.post(`${API_URL}/video_upload/`, formData);
      setVideoURL(res.data.url);
    } catch (err) {
      alert("❌ Error al subir el video");
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>🧠 Detección de Objetos con YOLOv8</h1>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setUseCam(false)}>📂 Subir Imagen</button>
        <button onClick={() => setUseCam(true)}>📸 Usar Cámara</button>
      </div>

      {!useCam ? (
        <input type="file" accept="image/*" onChange={handleFileChange} />
      ) : (
        <div>
          <h3>📺 Detección en vivo desde cámara:</h3>
          <img
            src={`${API_URL}/video_feed?source=cam`}
            alt="Stream de cámara"
            width={640}
            height={480}
            style={{ border: "1px solid #ccc" }}
          />
        </div>
      )}

      {preview && (
        <div style={{ marginTop: 10 }}>
          <h3>🖼️ Vista previa:</h3>
          <img src={preview} alt="preview" width={300} />
        </div>
      )}

      <br />
      <button onClick={handleDetect} disabled={loading}>
        {loading ? "Detectando..." : "🔍 Detectar Objetos"}
      </button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h2>📦 Objetos Detectados:</h2>
          <img
            src={`data:image/jpeg;base64,${result.image}`}
            alt="resultado"
            width={400}
          />
          <ul>
            {Object.entries(result.conteo).map(([clase, cantidad]) => (
              <li key={clase}>
                {clase}: {cantidad}
              </li>
            ))}
          </ul>
        </div>
      )}

      <hr style={{ margin: "40px 0" }} />
      <h2>🎥 Detección desde Video</h2>
      <input type="file" accept="video/*" onChange={handleVideoChange} />
      <br />
      <button onClick={handleUploadVideo}>🔄 Subir y Procesar Video</button>

      {videoURL && (
        <div style={{ marginTop: 20 }}>
          <h3>🎬 Video procesado:</h3>
          <img
            src={videoURL}
            alt="Video procesado"
            style={{ maxWidth: "100%" }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
