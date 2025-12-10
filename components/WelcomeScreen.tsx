import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

// FIX: Implemented the WelcomeScreen component to provide an engaging entry point for the app.
const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-ogabassey text-white p-4 text-center overflow-hidden relative">
        <style>{`
            .snowflake {
                position: absolute;
                top: -10%;
                color: #fff;
                font-size: 1em;
                animation: fall linear infinite;
            }

            @keyframes fall {
                0% { transform: translateY(0); opacity: 1; }
                100% { transform: translateY(105vh); opacity: 0; }
            }
        `}</style>
        {Array.from({ length: 50 }).map((_, i) => (
            <div
                key={i}
                className="snowflake"
                style={{
                    left: `${Math.random() * 100}vw`,
                    fontSize: `${Math.random() * 1.5 + 0.5}em`,
                    animationDuration: `${Math.random() * 5 + 5}s`,
                    animationDelay: `-${Math.random() * 5}s`,
                }}
            >
                ❄
            </div>
        ))}
        
        <div className="relative z-10 flex flex-col items-center">
            <img 
                src="https://img.icons8.com/plasticine/200/santa.png"
                alt="Smiling Santa Claus"
                className="mx-auto mb-6 w-32 h-32 md:w-40 md:h-40 animate-bounce"
                style={{ animationDuration: '2s' }}
            />
            <h1 className="font-christmas text-4xl md:text-6xl mb-2 tracking-wide" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                Welcome to Santa's Workshop!
            </h1>
            <p className="max-w-md mx-auto mb-8 text-red-100" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                Have you been good this year? Santa is here to listen to your Christmas wishes. Come on in and share what you're dreaming of!
            </p>
            <button
                onClick={onStart}
                className="bg-white text-ogabassey font-bold py-3 px-8 rounded-full text-lg shadow-xl hover:bg-red-100 transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
                Chat with Santa
            </button>
        </div>
    </div>
  );
};

export default WelcomeScreen;