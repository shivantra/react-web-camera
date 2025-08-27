import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export type CaptureType = "jpeg" | "png" | "webp";
export type CaptureQuality =
  | 0.1
  | 0.2
  | 0.3
  | 0.4
  | 0.5
  | 0.6
  | 0.7
  | 0.8
  | 0.9
  | 1;
export type CaptureMode = "front" | "back";
export type FacingMode = "user" | "environment";

export interface WebCameraProps {
  className?: string;
  style?: React.CSSProperties;
  videoClassName?: string;
  videoStyle?: React.CSSProperties;
  getFileName?: () => string;
  captureMode?: CaptureMode;
  captureType?: CaptureType;
  captureQuality?: CaptureQuality;
  onError?: (err: Error) => void;
}

export type WebCameraHandler = {
  capture: () => Promise<File | null>;
  switch: (facingMode?: FacingMode) => Promise<void>;
  getMode: () => CaptureMode;
};

const CAPTURE_MODES: Record<CaptureMode, FacingMode> = {
  back: "environment",
  front: "user",
};

export const WebCamera = forwardRef<WebCameraHandler, WebCameraProps>(
  (
    {
      className,
      style,
      videoClassName,
      videoStyle,
      getFileName,
      captureMode = "back",
      captureType = "jpeg",
      captureQuality = 0.8,
      onError,
    },
    ref,
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [facingMode, setFacingMode] = useState<FacingMode>(
      CAPTURE_MODES[captureMode],
    );
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

    const captureImage = useCallback(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) return null;
      if (video.readyState < 2) return null; // not ready yet

      return new Promise<File>((resolve) => {
        const context = canvas.getContext("2d")!;

        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;
        canvas.width = width;
        canvas.height = height;

        context.drawImage(video, 0, 0, width, height);

        const imageType = `image/${captureType}`;

        canvas.toBlob(
          async (blob) => {
            if (!blob) return;

            const file = new File(
              [blob],
              getFileName?.() ?? `capture-${Date.now()}.${captureType}`,
              {
                type: imageType,
                lastModified: Date.now(),
              },
            );

            resolve(file);
          },
          imageType,
          captureQuality,
        );
      });
    }, [captureType, captureQuality, getFileName]);

    const switchCamera = useCallback(async () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
      }

      const newFacingMode = facingMode === "user" ? "environment" : "user";
      setFacingMode(newFacingMode);

      try {
        let constraints: MediaStreamConstraints;

        // fallback: if facingMode not supported, use deviceId
        if (devices.length >= 2) {
          const device = devices.find((d) =>
            newFacingMode === "user"
              ? d.label.toLowerCase().includes("front")
              : d.label.toLowerCase().includes("back"),
          );

          constraints = device
            ? { video: { deviceId: { exact: device.deviceId } } }
            : { video: { facingMode: { ideal: newFacingMode } } };
        } else {
          constraints = { video: { facingMode: { ideal: newFacingMode } } };
        }

        const newStream =
          await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) videoRef.current.srcObject = newStream;
        setStream(newStream);
      } catch (err) {
        onError?.(err as Error);
      }
    }, [stream, facingMode, devices, onError]);

    useImperativeHandle(
      ref,
      () => ({
        capture: captureImage,
        switch: switchCamera,
        getMode: () => (facingMode === "environment" ? "back" : "front"),
      }),
      [facingMode, captureImage, switchCamera],
    );
    
    useEffect(() => {
      let mediaStream: MediaStream;

      const video = videoRef.current;

      const initCamera = async () => {
        try {
          // enumerate devices (helps iOS Safari + others)
          const allDevices = await navigator.mediaDevices.enumerateDevices();
          setDevices(allDevices.filter((d) => d.kind === "videoinput"));

          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: facingMode } },
          });

          if (video) {
            video.srcObject = mediaStream;
            video.onloadedmetadata = () => video?.play();
          }
          setStream(mediaStream);
        } catch (err) {
          onError?.(err as Error);
        }
      };

      initCamera();

      return () => {
        mediaStream?.getTracks().forEach((track) => track.stop());
        if (video) {
          video.srcObject = null;
        }
      };
    }, [facingMode, onError]);

    return (
      <div className={className} style={style}>
        <video
          ref={videoRef}
          className={videoClassName}
          autoPlay
          playsInline
          muted
          style={{
            ...videoStyle,
            display: "block",
            objectFit: "cover",
            height: "100%",
            width: "100%",
          }}
        >
          Video stream not available.
        </video>
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    );
  },
);
