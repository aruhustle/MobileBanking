
import React, { useCallback, useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import { X, Flashlight, Image as ImageIcon, AlertCircle, Zap, ZapOff, RefreshCcw } from 'lucide-react';
import jsQR from 'jsqr';
import { parseUPIUri } from '../utils/upiParser';

export const Scan: React.FC = () => {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const [invalidQrDetected, setInvalidQrDetected] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraType, setCameraType] = useState<'environment' | 'user'>('environment');
  
  // Visual Feedback State
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleScan = useCallback(() => {
    if (!webcamRef.current || !webcamRef.current.video) return;

    const video = webcamRef.current.video;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      // 1. Prepare Processing Canvas
      if (!processingCanvasRef.current) {
         processingCanvasRef.current = document.createElement('canvas');
      }
      const canvas = processingCanvasRef.current;
      
      // Resize only if needed
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
         canvas.width = video.videoWidth;
         canvas.height = video.videoHeight;
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      // 2. Prepare Overlay Canvas
      const overlayCtx = overlayCanvasRef.current?.getContext('2d');
      if (overlayCanvasRef.current && overlayCtx) {
          if (overlayCanvasRef.current.width !== video.videoWidth || overlayCanvasRef.current.height !== video.videoHeight) {
              overlayCanvasRef.current.width = video.videoWidth;
              overlayCanvasRef.current.height = video.videoHeight;
          }
          overlayCtx.clearRect(0, 0, video.videoWidth, video.videoHeight);
      }
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          const parsed = parseUPIUri(code.data);

          if (parsed) {
            if (overlayCtx) {
               drawSuccessOverlay(overlayCtx, code.location);
            }

            setScanning(false);
            if (navigator.vibrate) navigator.vibrate(50);
            
            setTimeout(() => {
                navigate('/confirm', { state: { data: parsed } });
            }, 200);
          } else {
            if (!invalidQrDetected) {
                setInvalidQrDetected(true);
                setTimeout(() => setInvalidQrDetected(false), 2000);
            }
          }
        }
      }
    }
  }, [navigate, invalidQrDetected]);

  const drawSuccessOverlay = (ctx: CanvasRenderingContext2D, location: any) => {
      const { topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner } = location;
      const time = Date.now() / 1000;
      
      ctx.beginPath();
      ctx.moveTo(topLeftCorner.x, topLeftCorner.y);
      ctx.lineTo(topRightCorner.x, topRightCorner.y);
      ctx.lineTo(bottomRightCorner.x, bottomRightCorner.y);
      ctx.lineTo(bottomLeftCorner.x, bottomLeftCorner.y);
      ctx.closePath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#3b82f6";
      ctx.stroke();
      
      const pulseOpacity = 0.1 + (Math.sin(time * 8) + 1) * 0.1;
      ctx.fillStyle = `rgba(59, 130, 246, ${pulseOpacity})`;
      ctx.fill();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (scanning) {
        handleScan();
      }
    }, 150); 
    return () => clearInterval(interval);
  }, [handleScan, scanning]);

  const toggleTorch = () => {
    const video = webcamRef.current?.video;
    if (video && video.srcObject) {
        const stream = video.srcObject as MediaStream;
        const track = stream.getVideoTracks()[0];
        
        try {
            const newStatus = !torchOn;
            track.applyConstraints({
                advanced: [{ torch: newStatus } as any]
            })
            .then(() => setTorchOn(newStatus))
            .catch((err: any) => {
                console.error("Torch error", err);
                // Fail silently on UI, most devices just ignore it
            });
        } catch(e) {
            console.error(e);
        }
    }
  };

  const switchCamera = () => {
    setCameraType(prev => prev === 'environment' ? 'user' : 'environment');
    setError(null); // Reset error on switch
  };

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
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
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
    event.target.value = '';
  };

  const simulateScan = () => {
    const mockUri = "upi://pay?pa=merchant@bank&pn=CoffeeShop&am=150.00&tn=Latte&mc=5411";
    const parsed = parseUPIUri(mockUri);
    if (navigator.vibrate) navigator.vibrate(50);
    navigate('/confirm', { state: { data: parsed } });
  };

  // Relaxed constraints for Android compatibility
  const videoConstraints = {
    facingMode: cameraType
    // Removed width/height to prevent OverconstrainedError on some Androids
  };

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden flex flex-col">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileUpload} 
      />

      <div className="absolute inset-0 z-0 bg-gray-900">
        {!error && (
            <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="h-full w-full object-cover"
            playsInline={true}
            onUserMediaError={(e) => {
                console.error("Camera Error:", e);
                let msg = "Could not access camera.";
                if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") msg = "Camera permission denied. Please allow access in browser settings.";
                if (e.name === "NotFoundError" || e.name === "DevicesNotFoundError") msg = "No camera found.";
                if (e.name === "NotReadableError" || e.name === "TrackStartError") msg = "Camera is in use by another app.";
                if (e.name === "OverconstrainedError") msg = "Camera resolution not supported.";
                setError(msg);
            }}
            />
        )}
        <canvas 
            ref={overlayCanvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      </div>

      <div className="absolute inset-0 z-10 flex flex-col justify-between p-6">
        <div className="flex justify-between items-center pt-4">
           <button onClick={() => navigate(-1)} className="p-3 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition">
             <X size={24} />
           </button>
           <div className="flex gap-4">
              <button 
                onClick={switchCamera}
                className="p-3 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition"
              >
                 <RefreshCcw size={24} />
              </button>
              <button 
                onClick={toggleTorch}
                className={`p-3 backdrop-blur-md rounded-full text-white transition ${torchOn ? 'bg-yellow-500/80 text-white' : 'bg-black/30 hover:bg-black/50'}`}
              >
                 {torchOn ? <Zap size={24} fill="currentColor" /> : <ZapOff size={24} />}
              </button>
           </div>
        </div>

        {error ? (
             <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                 <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-4">
                     <AlertCircle size={32} />
                 </div>
                 <h3 className="text-white font-bold text-lg mb-2">Camera Issue</h3>
                 <p className="text-gray-300 text-sm mb-6">{error}</p>
                 <button 
                   onClick={() => window.location.reload()}
                   className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold"
                 >
                   Retry
                 </button>
                 <button 
                   onClick={simulateScan}
                   className="mt-4 text-gray-400 text-xs underline"
                 >
                   Use Simulator (Dev)
                 </button>
             </div>
        ) : (
            <div className="flex-1 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border border-white/20 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1 rounded-br-lg"></div>
                    <div className="absolute top-0 left-0 w-full h-2 bg-blue-400/80 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-scan-pulse"></div>
                </div>
            </div>
        )}

        <div className={`absolute left-1/2 -translate-x-1/2 bottom-32 transition-all duration-300 ${invalidQrDetected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-red-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
                <AlertCircle size={16} /> Invalid QR Code detected
            </div>
        </div>

        <div className="text-center pb-8 space-y-4">
           {!error && (
               <p className="text-white/80 text-sm font-medium bg-black/20 py-1 px-3 rounded-full inline-block backdrop-blur-sm">
                Scan UPI or Bharat QR to pay
               </p>
           )}
           
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
        </div>
      </div>
      
      <style>{`
        @keyframes scan-pulse {
          0% { top: 0%; opacity: 0; box-shadow: 0 0 5px rgba(59,130,246,0.5); }
          15% { opacity: 1; box-shadow: 0 0 15px rgba(59,130,246,0.8); }
          50% { box-shadow: 0 0 25px rgba(96, 165, 250, 1); }
          85% { opacity: 1; box-shadow: 0 0 15px rgba(59,130,246,0.8); }
          100% { top: 100%; opacity: 0; box-shadow: 0 0 5px rgba(59,130,246,0.5); }
        }
        .animate-scan-pulse {
            animation: scan-pulse 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
    