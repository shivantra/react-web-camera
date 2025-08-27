import { useEffect, useState } from "react";

import ImageCaptureDialogDesktop from "./views/ImageCaptureDialogDesktop";
import ImageCaptureDialogMobile from "./views/ImageCaptureDialogMobile";
import { Button } from "./ui/components";
import { Camera } from "lucide-react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

function App() {
  const [open, setOpen] = useState(false);

  const isMobile = useIsMobile();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="container mx-auto flex flex-col items-center px-4 py-8 h-screen">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
            <Camera className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            React Web Camera
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Experience seamless image capture with our responsive camera
            component. Optimized for both desktop and mobile devices with
            intelligent UI adaptation.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl flex-1 w-full h-full">
          <div className="bg-white dark:bg-slate-800 h-full flex items-center justify-center rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 md:p-12">
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
          </div>
        </div>
      </div>

      {isMobile ? (
        <ImageCaptureDialogMobile open={open} onOpenChange={handleClose} />
      ) : (
        <ImageCaptureDialogDesktop open={open} onOpenChange={handleClose} />
      )}
    </div>
  );
}

export default App;
