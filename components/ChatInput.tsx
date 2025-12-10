
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatInputProps {
  onSendMessage: (message: Omit<ChatMessage, 'role'>) => void;
  isLoading: boolean;
}

const placeholders = [
  "Share your Christmas wish...",
  "Dear Santa...",
  "What are you dreaming of?",
  "Type your letter to Santa...",
];

const AudioPreview: React.FC<{
  audioUrl: string;
  onSend: () => void;
  onDelete: () => void;
}> = ({ audioUrl, onSend, onDelete }) => (
  <div className="flex items-center justify-between w-full p-2 rounded-full bg-gray-100 border border-gray-200">
    <audio controls src={audioUrl} className="flex-grow mx-2"></audio>
    <button
      type="button"
      onClick={onDelete}
      className="text-gray-500 hover:text-red-600 p-2 rounded-full transition-colors"
      aria-label="Delete recording"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.006a.75.75 0 0 1-.749.657H3.649a.75.75 0 0 1-.749-.656l-1.005-13.007-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.347-9Zm5.234 0a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.498.058l.347-9Z" clipRule="evenodd" />
      </svg>
    </button>
    <button
      type="button"
      onClick={onSend}
      className="bg-ogabassey text-white p-2.5 rounded-full hover:bg-red-700 transition-all duration-200"
      aria-label="Send voice message"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
      </svg>
    </button>
  </div>
);

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const [placeholder] = useState(() => placeholders[Math.floor(Math.random() * placeholders.length)]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleStartRecording = async () => {
    if (isLoading || audioUrl) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Check for supported MIME types to ensure cross-browser compatibility (fixes Safari issues)
      let options: MediaRecorderOptions | undefined = undefined;
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        // Use the actual mime type resolved by the recorder
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const newAudioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(newAudioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const handleSendAudio = async () => {
    if (audioUrl) {
      try {
        const response = await fetch(audioUrl);
        const audioBlob = await response.blob();
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64AudioUrl = reader.result as string;
          onSendMessage({ parts: '', audioUrl: base64AudioUrl });
          URL.revokeObjectURL(audioUrl);
          setAudioUrl(null);
        };
        reader.onerror = () => {
          console.error("Failed to convert blob to base64");
          URL.revokeObjectURL(audioUrl);
          setAudioUrl(null);
        }
      } catch (error) {
        console.error("Failed to fetch audio blob for sending:", error);
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
    }
  };

  const handleDeleteAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage({ parts: input });
      setInput('');
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    e.target.setSelectionRange(val.length, val.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onSendMessage({ parts: '', imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  if (audioUrl) {
    return <AudioPreview audioUrl={audioUrl} onSend={handleSendAudio} onDelete={handleDeleteAudio} />;
  }

  const showSendIcon = input.trim().length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center space-x-2 bg-white border rounded-2xl px-3 py-2 shadow-sm transition-all duration-200 ${
        showSendIcon ? 'border-ogabassey ring-1 ring-ogabassey/50' : 'border-gray-200'
      }`}
    >
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
      <button
        type="button"
        onClick={() => imageInputRef.current?.click()}
        className="p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Upload an image"
        disabled={isLoading}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>

      <div className="flex-1 relative">
        {!input && (
            <div 
                className="absolute inset-0 flex items-center px-2 text-gray-400 pointer-events-none"
                aria-hidden="true"
            >
                {placeholder.split('').map((char, index) => (
                    <span
                        key={index}
                        style={{ 
                            animation: `magical-reveal 0.7s ease-out forwards`,
                            animationDelay: `${index * 0.04}s`,
                            opacity: 0,
                        }}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                ))}
            </div>
        )}
        <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder=""
            className="w-full outline-none text-gray-800 bg-transparent px-2 resize-none overflow-y-auto caret-ogabassey"
            style={{ maxHeight: '8rem' }}
            disabled={isLoading}
            aria-label="Type your message to Santa"
        />
      </div>
      
      {showSendIcon ? (
        <button
          type="submit"
          disabled={isLoading}
          aria-label="Send message"
          className="p-2 rounded-full bg-ogabassey text-white hover:bg-red-700 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg>
        </button>
      ) : (
        <div className="relative w-10 h-10 flex items-center justify-center">
            <button
            type="button"
            onMouseDown={handleStartRecording}
            onMouseUp={stopRecording}
            onMouseLeave={isRecording ? stopRecording : undefined}
            onTouchStart={handleStartRecording}
            onTouchEnd={stopRecording}
            disabled={isLoading}
            aria-label="Record voice note"
            className={`relative z-10 p-2 rounded-full transition-all duration-200 ${
                isRecording
                ? 'bg-ogabassey text-white scale-110'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
                </svg>
            </button>
            {isRecording && (
            <div className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                <span className="block absolute w-full h-full rounded-full bg-red-200 animate-ripple" style={{ animationDelay: '0s' }}></span>
                <span className="block absolute w-full h-full rounded-full bg-red-200 animate-ripple" style={{ animationDelay: '0.5s' }}></span>
                <span className="block absolute w-full h-full rounded-full bg-red-200 animate-ripple" style={{ animationDelay: '1s' }}></span>
            </div>
            )}
        </div>
      )}
    </form>
  );
};

export default ChatInput;
