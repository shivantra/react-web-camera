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
  stop: () => void;
};

const CAPTURE_MODES: Record<CaptureMode, FacingMode> = {
  back: "environment",
  front: "user",
};

function releaseStream(
  stream: MediaStream | null,
  video: HTMLVideoElement | null,
) {
  if (stream) {
    for (const track of stream.getTracks()) {
      track.stop();
    }
  }
  if (video) {
    video.srcObject = null;
  }
}

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
    // streamRef mirrors the live MediaStream synchronously so stop() and the
    // effect cleanup always see the current stream — even one that resolved
    // a moment ago and hasn't been committed to React state yet.
    const streamRef = useRef<MediaStream | null>(null);
    // Stable handle for onError so consumers passing inline `onError={(e) => ...}`
    // don't cause the init effect to tear down + reopen the camera every render.
    const onErrorRef = useRef(onError);
    const [facingMode, setFacingMode] = useState<FacingMode>(
      CAPTURE_MODES[captureMode],
    );
    const [stopped, setStopped] = useState(false);

    useEffect(() => {
      onErrorRef.current = onError;
    }, [onError]);

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

    const stopCamera = useCallback(() => {
      releaseStream(streamRef.current, videoRef.current);
      streamRef.current = null;
      // Persist the stopped state so the init effect doesn't immediately
      // reopen the camera on the next render. switch() / a remount clears it.
      setStopped(true);
    }, []);

    const switchCamera = useCallback(
      async (next?: FacingMode) => {
        const newFacingMode =
          next ?? (facingMode === "user" ? "environment" : "user");
        // Clearing `stopped` and updating `facingMode` are batched into a
        // single re-render; the init effect then runs once with the new
        // facing mode.
        setStopped(false);
        setFacingMode(newFacingMode);
      },
      [facingMode],
    );

    useImperativeHandle(
      ref,
      () => ({
        capture: captureImage,
        stop: stopCamera,
        switch: switchCamera,
        getMode: () => (facingMode === "environment" ? "back" : "front"),
      }),
      [facingMode, captureImage, stopCamera, switchCamera],
    );

    useEffect(() => {
      if (stopped) return;

      let cancelled = false;
      const video = videoRef.current;

      const initCamera = async () => {
        try {
          // enumerate devices (helps iOS Safari + others); use device IDs when
          // labels are available so switching is more reliable.
          const allDevices = await navigator.mediaDevices.enumerateDevices();
          if (cancelled) return;
          const videoInputs = allDevices.filter((d) => d.kind === "videoinput");

          let constraints: MediaStreamConstraints = {
            video: { facingMode: { ideal: facingMode } },
          };
          if (videoInputs.length >= 2) {
            const device = videoInputs.find((d) =>
              facingMode === "user"
                ? d.label.toLowerCase().includes("front")
                : d.label.toLowerCase().includes("back"),
            );
            if (device) {
              constraints = {
                video: { deviceId: { exact: device.deviceId } },
              };
            }
          }

          const mediaStream =
            await navigator.mediaDevices.getUserMedia(constraints);

          if (cancelled) {
            // The effect was torn down (unmount, dep change, or stop()) while
            // getUserMedia was pending. Release the orphan stream immediately
            // — otherwise the camera LED stays on with no one to stop it.
            releaseStream(mediaStream, null);
            return;
          }

          streamRef.current = mediaStream;
          if (video) {
            video.srcObject = mediaStream;
            video.onloadedmetadata = () => video?.play();
          }
        } catch (err) {
          if (!cancelled) onErrorRef.current?.(err as Error);
        }
      };

      initCamera();

      return () => {
        cancelled = true;
        releaseStream(streamRef.current, video);
        streamRef.current = null;
      };
    }, [facingMode, stopped]);

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
