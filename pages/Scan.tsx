
import React, { useCallback, useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import { X, Flashlight, Image as ImageIcon, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';
import { parseUPIUri } from '../utils/upiParser';

export const Scan: React.FC = () => {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  
  // Visual Feedback State
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleScan = useCallback(() => {
    if (!webcamRef.current || !webcamRef.current.video) return;

    const video = webcamRef.current.video;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      // 1. Prepare Canvas
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      // 2. Prepare Overlay Canvas for Visual Feedback
      const overlayCtx = overlayCanvasRef.current?.getContext('2d');
      if (overlayCanvasRef.current && overlayCtx) {
          overlayCanvasRef.current.width = video.videoWidth;
          overlayCanvasRef.current.height = video.videoHeight;
          overlayCtx.clearRect(0, 0, video.videoWidth, video.videoHeight);
      }
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
           // Draw sophisticated visual feedback
           if (overlayCtx) {
               const { topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner } = code.location;
               const time = Date.now() / 1000;
               
               // Draw filled quad
               overlayCtx.beginPath();
               overlayCtx.moveTo(topLeftCorner.x, topLeftCorner.y);
               overlayCtx.lineTo(topRightCorner.x, topRightCorner.y);
               overlayCtx.lineTo(bottomRightCorner.x, bottomRightCorner.y);
               overlayCtx.lineTo(bottomLeftCorner.x, bottomLeftCorner.y);
               overlayCtx.closePath();
               overlayCtx.lineWidth = 4;
               overlayCtx.strokeStyle = "#3b82f6"; // Blue 500
               overlayCtx.stroke();
               
               // Pulsing semi-transparent fill
               const pulseOpacity = 0.1 + (Math.sin(time * 8) + 1) * 0.1; // Oscillate between 0.1 and 0.3
               overlayCtx.fillStyle = `rgba(59, 130, 246, ${pulseOpacity})`;
               overlayCtx.fill();

               // Draw Laser Line Logic
               // We want a line that moves from top to bottom relative to the QR orientation
               
               overlayCtx.save();
               overlayCtx.clip(); // Clip subsequent drawing to the QR quad

               const speed = 2; // scans per second
               const phase = (time * speed) % 1;
               
               // Calculate bounds to interpolate line position
               const minX = Math.min(topLeftCorner.x, bottomLeftCorner.x);
               const maxX = Math.max(topRightCorner.x, bottomRightCorner.x);
               const minY = Math.min(topLeftCorner.y, topRightCorner.y);
               const maxY = Math.max(bottomLeftCorner.y, bottomRightCorner.y);
               const height = maxY - minY;
               
               const lineY = minY + (height * phase);
               
               // Draw the laser line
               overlayCtx.beginPath();
               overlayCtx.moveTo(minX, lineY);
               overlayCtx.lineTo(maxX, lineY);
               overlayCtx.strokeStyle = "#93c5fd"; // Blue 300 (lighter for laser)
               overlayCtx.lineWidth = 4;
               overlayCtx.shadowColor = "#3b82f6";
               overlayCtx.shadowBlur = 15;
               overlayCtx.stroke();

               overlayCtx.restore();
           }

          const parsed = parseUPIUri(code.data);
          if (parsed) {
            setScanning(false);
            // Haptic feedback on success
            if (navigator.vibrate) navigator.vibrate(50);
            
            // Slight delay to show the box before navigating
            setTimeout(() => {
                navigate('/confirm', { state: { data: parsed } });
            }, 200);
          } else {
            // Found QR but not UPI/BharatQR
            // console.log("Found QR but not UPI:", code.data);
          }
        }
      }
    }
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scanning) {
        handleScan();
      }
    }, 50); // High refresh rate for smoother animation
    return () => clearInterval(interval);
  }, [handleScan, scanning]);

  // Handle Gallery Upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageResult = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
             const parsed = parseUPIUri(code.data);
             if (parsed) {
                if (navigator.vibrate) navigator.vibrate(50);
                navigate('/confirm', { state: { data: parsed } });
             } else {
                alert("QR Code detected but it is not a valid UPI QR.");
             }
          } else {
             alert("No QR Code found in the selected image.");
          }
        }
      };
      img.src = imageResult;
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again if needed
    event.target.value = '';
  };

  // Fallback/Simulator
  const simulateScan = () => {
    const mockUri = "upi://pay?pa=merchant@bank&pn=CoffeeShop&am=150.00&tn=Latte&mc=5411";
    const parsed = parseUPIUri(mockUri);
    if (navigator.vibrate) navigator.vibrate(50);
    navigate('/confirm', { state: { data: parsed } });
  };

  const videoConstraints = {
    facingMode: "environment"
  };

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden flex flex-col">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileUpload} 
      />

      {/* Camera View */}
      <div className="absolute inset-0 z-0">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="h-full w-full object-cover"
          onUserMediaError={(e) => setError("Camera access denied or not available.")}
        />
        {/* Canvas for Drawing Bounding Box */}
        <canvas 
            ref={overlayCanvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      </div>

      {/* Overlay UI */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-6">
        {/* Header Controls */}
        <div className="flex justify-between items-center pt-4">
           <button onClick={() => navigate(-1)} className="p-3 bg-black/30 backdrop-blur-md rounded-full text-white">
             <X size={24} />
           </button>
           <div className="flex gap-4">
              <button className="p-3 bg-black/30 backdrop-blur-md rounded-full text-white">
                 <Flashlight size={24} />
              </button>
              <button className="p-3 bg-black/30 backdrop-blur-md rounded-full text-white">
                 <AlertCircle size={24} />
              </button>
           </div>
        </div>

        {/* Scanner Frame Guide */}
        <div className="flex-1 flex items-center justify-center pointer-events-none">
           <div className="w-64 h-64 border border-white/20 rounded-3xl relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1 rounded-br-lg"></div>
              
              {/* Static Scanning Line Animation (CSS based fallback if canvas fails) */}
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
           </div>
        </div>

        {/* Footer Text & Controls */}
        <div className="text-center pb-8 space-y-4">
           <p className="text-white/80 text-sm font-medium bg-black/20 py-1 px-3 rounded-full inline-block backdrop-blur-sm">
             Scan UPI or Bharat QR to pay
           </p>
           
           <div className="flex justify-center pt-4">
              <button 
                className="flex flex-col items-center gap-2 text-white/90 active:scale-95 transition-transform" 
                onClick={() => fileInputRef.current?.click()}
              >
                 <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md hover:bg-white/20 transition">
                    <ImageIcon size={20} />
                 </div>
                 <span className="text-xs">Upload from gallery</span>
              </button>
           </div>

           {/* Dev Only: Simulation Button if camera fails */}
           {error && (
              <button 
                onClick={simulateScan}
                className="bg-red-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg"
              >
                Dev: Simulate Scan
              </button>
           )}
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
