import React, { useEffect } from 'react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // The toast will disappear after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) {
    return null;
  }

  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-ogabassey text-white py-2 px-6 rounded-full shadow-lg text-sm z-50 animate-fade-in"
      role="status"
      aria-live="assertive"
    >
        <style>{`
            @keyframes fadeIn {
                from { opacity: 0; transform: translate(-50%, 10px); }
                to { opacity: 1; transform: translate(-50%, 0); }
            }
            .animate-fade-in {
                animation: fadeIn 0.3s ease-out forwards;
            }
        `}</style>
      <span aria-hidden="true">🎁</span> {message}
    </div>
  );
};

export default Toast;