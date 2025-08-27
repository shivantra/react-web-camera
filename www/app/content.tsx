"use client";

import { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/ui/components";
import {
  ImageCaptureDialogDesktop,
  ImageCaptureDialogMobile,
} from "@/app/components";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
}

function Content() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div className="min-h-[100dvh] h-[100dvh] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      <header className="flex justify-end p-2 px-4 shrink-0">
        <a
          href="https://github.com/shivantra/react-web-camera"
          aria-label="GitHub repository"
        >
          <img
            src="/react-web-camera/github.svg"
            alt="Github logo"
            className="h-[30px] w-auto"
          />
        </a>
      </header>

      <main className="container mx-auto px-4 pb-4 flex-1 min-h-0 flex flex-col items-center overflow-hidden">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <Camera className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            React Web Camera
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Default camera inputs only allow one photo, making multi-image
            capture frustrating.&nbsp;
            <strong>React web camera</strong> is a lightweight, headless React
            component for capturing multiple images in one session. It’s
            flexible, PWA-friendly, and gives you full control over UI and
            styling.
          </p>
        </div>

        <div className="w-full max-w-4xl flex-1 min-h-0 flex flex-col gap-2">
          <section className="flex-1 min-h-0 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 md:p-10 flex items-center justify-center overflow-hidden">
            <div className="text-center">
              <div className="space-y-4">
                <Button
                  onClick={handleOpen}
                  className="h-12 bg-blue-600 hover:bg-blue-700 text-white !px-8 !py-3 text-lg font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Launch Camera
                </Button>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isMobile
                    ? "Mobile-optimized interface"
                    : "Desktop-enhanced experience"}
                </p>
              </div>
            </div>
          </section>

          <footer className="flex justify-center items-center p-2 text-slate-600 dark:text-slate-300 shrink-0">
            <span>Made with ❤️ by&nbsp;</span>
            <a
              href="https://shivantra.com"
              className="text-[#01014f] underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              <strong>Shivantra</strong>
            </a>
          </footer>
        </div>
      </main>

      {isMobile ? (
        <ImageCaptureDialogMobile open={open} onOpenChange={handleClose} />
      ) : (
        <ImageCaptureDialogDesktop open={open} onOpenChange={handleClose} />
      )}
    </div>
  );
}

export default Content;
