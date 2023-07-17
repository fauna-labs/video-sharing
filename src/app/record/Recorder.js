'use client'
import React, { useEffect, useRef } from "react";
import styles from "./Recorder.module.css";

const Recorder = ({
  onRecordedChunks,
}) => {
  let localCamStream,
    localScreenStream,
    localOverlayStream,
    rafId,
    cam,
    screen,
    mediaRecorder,
    audioContext
  let recordedChunks = [];
  let encoderOptions = { mimeType: "video/webm; codecs=vp9" };

  const mediaWrapperDivRef = useRef(null);
  const canvasElementRef = useRef(null);

  useEffect(() => {
    canvasElementRef.current = document.createElement("canvas");
  }, []);

    async function startStream() {
        if(mediaWrapperDivRef.current.childNodes.length > 0) {
            mediaWrapperDivRef.current.innerHTML = "";
        }
        await startWebcamFn()
        await startScreenShareFn()
    }

    const requestVideoFrame = function (callback) {
        return window.setTimeout(function () {
            callback(Date.now());
        }, 1000 / 60); // 60 fps - just like requestAnimationFrame
    };

    async function startWebcamFn() {
        localCamStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: { deviceId: { ideal: "communications" } }
        });
        if (localCamStream) {
            cam = await attachToDOM("justWebcam", localCamStream);
        }
    }

    async function startScreenShareFn() {
        localScreenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
        });
        if (localScreenStream) {
            screen = await attachToDOM("justScreenShare", localScreenStream);
        }
    }

    async function makeComposite() {
      if (screen) {
          let canvasCtx = canvasElementRef.current.getContext("2d");
          canvasCtx.save();
          canvasElementRef.current.setAttribute("width", `${screen.videoWidth}px`);
          canvasElementRef.current.setAttribute("height", `${screen.videoHeight}px`);
          canvasCtx.clearRect(0, 0, screen.videoWidth, screen.videoHeight);
          canvasCtx.drawImage(screen, 0, 0, screen.videoWidth, screen.videoHeight);
          if (cam && localCamStream) {
              // Set a circular path for clipping the cam image
              let camWidth = Math.floor(screen.videoWidth / 4);
              let camHeight = Math.floor(screen.videoHeight / 4);
              let camX = 0;
              let camY = Math.floor(screen.videoHeight - screen.videoHeight / 4);
              let camRadius = Math.min(camWidth, camHeight) / 2;
              canvasCtx.beginPath();
              canvasCtx.arc(camX + camWidth / 2, camY + camHeight / 2, camRadius, 0, Math.PI * 2);
              canvasCtx.clip();
  
              // Draw the cam image
              canvasCtx.drawImage(cam, camX, camY, camWidth, camHeight);
          }
          let imageData = canvasCtx.getImageData(0, 0, screen.videoWidth, screen.videoHeight);
          canvasCtx.putImageData(imageData, 0, 0);
          canvasCtx.restore();
  
          rafId = requestVideoFrame(makeComposite);
      }
  }
  function handleDataAvailable(event) {
      if (recordedChunks.length > 0) {
        recordedChunks = [];
      }
      if (event.data.size > 0) {
          recordedChunks.push(event.data);
          console.log('===>', recordedChunks);
          processVideoData();
      }
  }

    const cancelVideoFrame = function (id) {
        clearTimeout(id);
    };

    async function processVideoData() {
      let blob = new Blob(recordedChunks, {
          type: "video/webm"
      });
      let url = URL.createObjectURL(blob);
      let videoElem = document.createElement("video");
      videoElem.controls = true;
      videoElem.width = 640;
      videoElem.height = 360;
      videoElem.src = url;
      mediaWrapperDivRef.current.appendChild(videoElem);

      onRecordedChunks(blob);

    }

    async function stopAllStreamsFn() {
        [
            ...(localCamStream ? localCamStream.getTracks() : []),
            ...(localScreenStream ? localScreenStream.getTracks() : []),
            ...(localOverlayStream ? localOverlayStream.getTracks() : [])
        ].map((track) => track.stop());
        localCamStream = null;
        localScreenStream = null;
        localOverlayStream = null;
        cancelVideoFrame(rafId);
        mediaWrapperDivRef.current.innerHTML = "";
        mediaRecorder = null;
    }

    async function startRecordingFn() {
        mediaRecorder.start();
        console.log(mediaRecorder.state);
        console.log("recorder started");
        document.getElementById("pipOverlayStream").style.border = "10px solid red";
    }

    async function mergeStreamsFn() {
      await makeComposite();
      audioContext = new AudioContext();
      let audioDestination = audioContext.createMediaStreamDestination();
      let fullVideoStream = canvasElementRef.current.captureStream();
      let existingAudioStreams = [
          ...(localScreenStream ? localScreenStream.getAudioTracks() : []),
          ...(localCamStream ? localCamStream.getAudioTracks() : [])
      ];
  
      let audioSourceNodes = existingAudioStreams.map((audioTrack) =>
        audioContext.createMediaStreamSource(new MediaStream([audioTrack]))
      );
      audioSourceNodes.forEach((sourceNode) => sourceNode.connect(audioDestination));
  
      localOverlayStream = new MediaStream([...fullVideoStream.getVideoTracks()]);
      let fullOverlayStream = new MediaStream([
          ...fullVideoStream.getVideoTracks(),
          ...audioDestination.stream.getTracks()
      ]);
      if (localOverlayStream) {
          let overlay = await attachToDOM("pipOverlayStream", localOverlayStream);
          mediaRecorder = new MediaRecorder(fullOverlayStream, encoderOptions);
          mediaRecorder.ondataavailable = handleDataAvailable;
          overlay.volume = 0;
          if (cam) {
              cam.volume = 0;
              cam.style.display = "none";
          }
          screen.volume = 0;
          screen.style.display = "none";
      }
      startRecordingFn();
  }
   

    function stopRecordingFn() {
        mediaRecorder.stop();
        stopAllStreamsFn()
    }

    async function attachToDOM(id, stream) {
        let videoElem = document.createElement("video");
        videoElem.id = id;
        videoElem.width = 640;
        videoElem.height = 360;
        videoElem.autoplay = true;
        videoElem.setAttribute("playsinline", true);
        videoElem.srcObject = new MediaStream(stream.getTracks());
        mediaWrapperDivRef.current.appendChild(videoElem);
        return videoElem;
    }

    async function startScreenOnlyStream() { 
      await startScreenShareFn();
    }

  return (
    <main>
      <div ref={mediaWrapperDivRef} id="mediaWrapper"></div>
      <div className={styles.buttonWrapper}>
        <button
          className={styles.startWebcam}
          title="Start Webcam"
          onClick={startStream} // assuming you named your function "startStream"
        >
          📹 Stream with Cam
        </button>

        <button
          className={styles.startWebcam}
          title="Start Webcam"
          onClick={startScreenOnlyStream} // assuming you named your function "startStream"
        >
          🖥️  Stream screen only
        </button>
        
        <button
          className={styles.mergeStreams}
          title="Merge Streams"
          onClick={mergeStreamsFn} // assuming you named your function "mergeStreamsFn"
        >
          ⏺️ Record
        </button>
        <button
          className={styles.stopRecording}
          title="Stop Recording"
          onClick={stopRecordingFn} // assuming you named your function "stopRecordingFn"
        >
          ✋ Stop Recording
        </button>
      </div>
    </main>
  );
};

export default Recorder;
