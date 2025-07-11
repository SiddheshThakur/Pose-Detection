import React, { useRef, useEffect } from 'react';
import './App.css';
import * as posenet from '@tensorflow-models/posenet';
import Webcam from "react-webcam";
import { drawKeypoints, drawSkeleton } from './utilities';

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const netRef = useRef(null);

  useEffect(() => {
    let intervalId;
    const detect = async () => {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4 &&
        netRef.current
      ) {
        const video = webcamRef.current.video;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        video.width = videoWidth;
        video.height = videoHeight;

        const pose = await netRef.current.estimateSinglePose(video);
        console.log(pose);

        drawCanvas(pose, videoWidth, videoHeight);
      }
    };

    const drawCanvas = (pose, videoWidth, videoHeight) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      ctx.clearRect(0, 0, videoWidth, videoHeight);
      // Optional: set a background color for debugging
      // ctx.fillStyle = 'rgba(0,0,0,0.1)';
      // ctx.fillRect(0, 0, videoWidth, videoHeight);
      drawKeypoints(pose.keypoints, 0.5, ctx);
      drawSkeleton(pose.keypoints, 0.5, ctx);
    };

    const runPosenet = async () => {
      netRef.current = await posenet.load({
        inputResolution: { width: 640, height: 480 },
        scale: 0.5,
      });
      intervalId = setInterval(() => {
        detect();
      }, 100);
    };

    runPosenet();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: 'absolute',
            marginLeft: 'auto',
            marginRight: 'auto',
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 8,
            width: 640,
            height: 480,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            marginLeft: 'auto',
            marginRight: 'auto',
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 9,
            width: 640,
            height: 480,
            // Optional: backgroundColor for debugging
            // backgroundColor: 'rgba(0,0,0,0.1)',
          }}
        />
      </header>
    </div>
  );
}

export default App;
