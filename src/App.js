import React, { useRef, useState } from "react";
import axios from "axios";
import Webcam from "react-webcam";
import "./App.css"; // si quieres más estilos luego

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

  const handleCloseCamera = () => {
    setUseCam(false);
  };

  const handleClearPreview = () => {
    setPreview(null);
    setResult(null);
  };

  const handleClearVideo = () => {
    setVideoFile(null);
    setVideoURL(null);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🧠 Detección de Objetos con YOLOv8</h1>

      <div style={styles.buttonGroup}>
        <button style={styles.button} onClick={() => setUseCam(false)}>
          📂 Subir Imagen
        </button>
        <button style={styles.button} onClick={() => setUseCam(true)}>
          📸 Usar Cámara
        </button>
      </div>

      {!useCam ? (
        <input type="file" accept="image/*" onChange={handleFileChange} />
      ) : (
        <div style={styles.cameraContainer}>
          <h3>📺 Detección en vivo desde cámara:</h3>
          <img
            src={`${API_URL}/video_feed?source=cam`}
            alt="Stream de cámara"
            width={640}
            height={480}
            style={styles.videoBox}
          />
          <button style={styles.closeButton} onClick={handleCloseCamera}>
            ❌ Cerrar Cámara
          </button>
        </div>
      )}

      {preview && (
        <div style={styles.previewContainer}>
          <h3>🖼️ Vista previa:</h3>
          <img src={preview} alt="preview" width={300} />
          <button style={styles.closeButton} onClick={handleClearPreview}>
            ❌ Cerrar Imagen
          </button>
        </div>
      )}

      <br />
      <button
        style={styles.detectButton}
        onClick={handleDetect}
        disabled={loading}
      >
        {loading ? "Detectando..." : "🔍 Detectar Objetos"}
      </button>

      {result && (
        <div style={styles.resultContainer}>
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
      <button style={styles.button} onClick={handleUploadVideo}>
        🔄 Subir y Procesar Video
      </button>

      {videoURL && (
        <div style={styles.videoContainer}>
          <h3>🎬 Video procesado:</h3>
          <img src={videoURL} alt="Video procesado" style={styles.videoBox} />
          <button style={styles.closeButton} onClick={handleClearVideo}>
            ❌ Cerrar Video
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f7f9fc",
    color: "#333",
    textAlign: "center",
  },
  title: {
    color: "#2c3e50",
  },
  buttonGroup: {
    marginBottom: 15,
  },
  button: {
    margin: "0 5px",
    padding: "10px 15px",
    borderRadius: "5px",
    backgroundColor: "#2980b9",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  detectButton: {
    marginTop: 10,
    padding: "10px 25px",
    borderRadius: "5px",
    backgroundColor: "#27ae60",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  closeButton: {
    marginTop: 10,
    padding: "5px 10px",
    borderRadius: "5px",
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  previewContainer: {
    marginTop: 20,
  },
  resultContainer: {
    marginTop: 20,
    textAlign: "left",
    display: "inline-block",
  },
  videoContainer: {
    marginTop: 20,
  },
  cameraContainer: {
    marginTop: 10,
  },
  videoBox: {
    border: "1px solid #ccc",
    maxWidth: "100%",
    borderRadius: "8px",
  },
};

export default App;
