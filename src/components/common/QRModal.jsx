import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

const QRScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Camera access denied or not available.");
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const scanQRCode = () => {
      if (!canvasRef.current || !videoRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const video = videoRef.current;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

        if (qrCode) {
          onScan(qrCode.data);
        }
      }

      requestAnimationFrame(scanQRCode);
    };

    requestAnimationFrame(scanQRCode);
  }, [onScan]);

  return (
    <div className="relative w-full max-w-lg">
      {error && <p className="text-red-500">{error}</p>}
      <video ref={videoRef} className="w-full rounded-lg shadow-md" autoPlay playsInline />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default QRScanner;
