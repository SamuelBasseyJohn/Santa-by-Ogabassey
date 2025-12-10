import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

const formatTime = (timeInSeconds: number) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const SimpleMarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  const renderText = () => {
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>');
    
    // Bold **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italics *text* (must be after bold)
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Unordered lists
    html = html.replace(/(^\s*\*[ \t].*)/gm, '<li>$1</li>');
    html = html.replace(/<\/li><li>/g, '</li>\n<li>'); 
    html = html.replace(/((<li>.*<\/li>\n?)+)/g, '<ul class="list-disc list-inside my-2 pl-2">$1</ul>');
    html = html.replace(/<li>\s*\*[ \t]/g, '<li>'); 

    // Remove newlines from within list blocks to prevent them from becoming <br> tags
    html = html.replace(/(<ul[^>]*>)([\s\S]*?)(<\/ul>)/g, (match, startTag, content, endTag) => {
      return startTag + content.replace(/\n/g, '') + endTag;
    });

    // Handle newlines for paragraphs
    return html.replace(/\n/g, '<br />');
  };

  return <div className="text-sm" dangerouslySetInnerHTML={{ __html: renderText() }} />;
};

const CustomAudioPlayer: React.FC<{ src: string }> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => setDuration(audio.duration);
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const handleAudioEnd = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleAudioEnd);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleAudioEnd);
    };
  }, []);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
        const newTime = Number(e.target.value);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 w-64">
      <audio ref={audioRef} src={src} preload="metadata"></audio>
      <button 
        onClick={togglePlayPause} 
        className="text-ogabassey flex-shrink-0"
        aria-label={isPlaying ? "Pause audio message" : "Play audio message"}
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0v-12a.75.75 0 0 1 .75-.75Zm9 0a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0v-12a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" /></svg>
        )}
      </button>
      <div className="flex-grow flex flex-col justify-center">
        <input
            type="range"
            value={currentTime}
            max={duration || 0}
            onChange={handleProgressChange}
            aria-label="Audio progress"
            className="w-full h-1.5 bg-red-200 rounded-lg appearance-none cursor-pointer accent-ogabassey"
        />
        <div className="text-xs text-right text-gray-500 mt-1 font-mono" aria-hidden="true">
            {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
};


const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === 'model';
  const messageAlignment = isModel ? 'justify-start' : 'justify-end';
  const messageBubbleColor = isModel
    ? 'bg-red-100 text-gray-800' // Santa's message - warm red tone
    : 'bg-gray-200 text-gray-800'; // User's message - clean neutral tone
  const bubbleStyles = isModel
    ? 'rounded-t-xl rounded-br-xl'
    : 'rounded-t-xl rounded-bl-xl';

  const avatar = isModel ? (
    <img
      src="https://img.icons8.com/plasticine/100/santa.png"
      alt="Santa Claus"
      className="w-10 h-10 rounded-full shadow-lg self-start object-cover animate-jolly-bobble"
    />
  ) : (
    <div className="w-10 h-10 rounded-full bg-ogabassey flex items-center justify-center text-white shadow-lg p-2 self-start">
       <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-full h-full"
        aria-hidden="true"
      >
        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
      </svg>
    </div>
  );

  return (
    <div className={`flex gap-2 my-2 ${messageAlignment}`}>
      {isModel && avatar}
      <div
        className={`max-w-[80%] p-3 shadow-md ${messageBubbleColor} ${bubbleStyles}`}
      >
        {message.audioUrl ? (
          <CustomAudioPlayer src={message.audioUrl} />
        ) : message.imageUrl ? (
          <img src={message.imageUrl} alt="User upload" className="max-w-xs max-h-64 rounded-lg" />
        ) : (
          <SimpleMarkdownRenderer text={message.parts} />
        )}
      </div>
      {!isModel && avatar}
    </div>
  );
};

export default ChatMessage;