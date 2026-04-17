import React, { useState, useRef } from 'react';

// SVG Icon for the Start Flag
const FlagIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
    <line x1="4" y1="22" x2="4" y2="15"></line>
  </svg>
);

export default function App() {
  const [sequence, setSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [level, setLevel] = useState(0);
  const [gameState, setGameState] = useState('idle'); // idle, get_ready, playing_sequence, player_turn, waiting_for_next_level, game_over
  const [activeLight, setActiveLight] = useState(null);
  const [activeButton, setActiveButton] = useState(null);
  
  // Use a ref to track the current sequence instance, preventing overlap if restarted quickly
  const sequenceIdRef = useRef(0);

  const playSequence = async (seq) => {
    setGameState('playing_sequence');
    setPlayerInput([]);
    const currentId = ++sequenceIdRef.current;

    // Small pause before sequence begins
    await new Promise(r => setTimeout(r, 800));
    if (currentId !== sequenceIdRef.current) return;

    // Constant speed for the lights
    const lightOnDuration = 500;
    const lightOffDuration = 250;

    for (let i = 0; i < seq.length; i++) {
      setActiveLight(seq[i]);
      await new Promise(r => setTimeout(r, lightOnDuration));
      if (currentId !== sequenceIdRef.current) return;

      setActiveLight(null);
      await new Promise(r => setTimeout(r, lightOffDuration));
      if (currentId !== sequenceIdRef.current) return;
    }

    setGameState('player_turn');
  };

  const nextLevel = (currentSeq) => {
    // Generate a random light index (0 to 3)
    const newLight = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, newLight];
    
    setSequence(newSeq);
    setLevel(prev => prev + 1);
    playSequence(newSeq);
  };

  const startGame = () => {
    setSequence([]);
    setLevel(0);
    setPlayerInput([]);
    setGameState('get_ready');
    
    // Start the first level after a 2-second delay
    setTimeout(() => {
      nextLevel([]);
    }, 2000);
  };

  const handleButtonPress = (index) => {
    if (gameState !== 'player_turn') return;

    // Visual feedback for pressing the button and the corresponding light
    setActiveButton(index);
    setActiveLight(index);
    setTimeout(() => {
      setActiveButton(null);
      setActiveLight(null);
    }, 200);

    const currentStep = playerInput.length;
    
    // Check if the pressed button matches the sequence
    if (sequence[currentStep] === index) {
      const newPlayerInput = [...playerInput, index];
      setPlayerInput(newPlayerInput);

      // Check if the player has completed the entire sequence for this level
      if (newPlayerInput.length === sequence.length) {
        setGameState('waiting_for_next_level');
        setTimeout(() => {
          nextLevel(sequence);
        }, 1000);
      }
    } else {
      // Wrong button pressed
      setGameState('game_over');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 selection:bg-red-500/30">
      
      {gameState === 'idle' ? (
        // --- HOME SCREEN ---
        <div className="flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="mb-12 text-center">
            <h1 className="text-5xl md:text-7xl font-black tracking-widest mb-4 text-white drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              <span className="text-red-600">NEURAL</span> LINK
            </h1>
            <p className="text-gray-400 font-medium text-lg md:text-xl">Memorize the light pattern. Repeat the sequence.</p>
          </div>
          <button 
            onClick={startGame} 
            className="px-10 py-4 bg-red-600 hover:bg-red-500 rounded-xl font-black text-2xl uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.6)] hover:-translate-y-1 active:translate-y-0"
          >
            Start Game
          </button>
        </div>
      ) : (
        // --- GAME SCREEN ---
        <div className="flex flex-col items-center w-full max-w-2xl animate-in fade-in duration-300">
          
          {/* Small Header for Game Screen */}
          <div className="mb-6 text-center">
            <h2 
              className="text-2xl font-black tracking-widest text-white drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => setGameState('idle')}
              title="Return to Menu"
            >
              <span className="text-red-600">NEURAL</span> LINK
            </h2>
          </div>

          {/* Level Indicator */}
          <div className="mb-6 px-6 py-2 bg-gray-900 rounded-full border border-gray-800">
            <span className="font-mono text-xl text-gray-300">
              LEVEL <span className="text-white font-bold">{level > 0 ? String(level).padStart(2, '0') : '--'}</span>
            </span>
          </div>

          {/* Game Hardware Board */}
          <div className="flex flex-col gap-8 bg-gray-800/40 p-8 md:p-12 rounded-[2.5rem] border-t-2 border-l-2 border-gray-700/50 shadow-2xl backdrop-blur-md relative overflow-hidden w-full">
            
            {/* Subtle decorative screws */}
            <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-gray-900 border border-gray-700 shadow-inner"></div>
            <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-gray-900 border border-gray-700 shadow-inner"></div>
            <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-gray-900 border border-gray-700 shadow-inner"></div>
            <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-gray-900 border border-gray-700 shadow-inner"></div>

            {/* Top Row: Lights */}
            <div className="flex justify-center gap-6 sm:gap-10">
              {[0, 1, 2, 3].map((i) => (
                <div key={`light-${i}`} className="flex flex-col items-center">
                  <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full transition-all duration-150 border-4 relative
                    ${activeLight === i
                      ? 'bg-yellow-200 border-yellow-100 shadow-[0_0_50px_20px_rgba(253,224,71,0.6)] scale-105 z-10'
                      : 'bg-gray-900 border-gray-950 shadow-inner opacity-80'
                    }`}
                  >
                    {/* Bulb specular highlight */}
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 w-4 h-4 sm:w-6 sm:h-6 bg-white rounded-full opacity-20 blur-[2px]"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Status Dashboard - Moved to Middle */}
            <div className="min-h-[5rem] flex items-center justify-center w-full max-w-md mx-auto bg-gray-900/80 rounded-2xl border border-gray-800 shadow-inner backdrop-blur-sm p-4 text-center z-10">
              
              {gameState === 'get_ready' && (
                <span className="text-white font-black tracking-widest text-xl animate-pulse drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                  GET READY...
                </span>
              )}
              
              {gameState === 'playing_sequence' && (
                <span className="text-blue-400 font-mono tracking-widest animate-pulse flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></span>
                  MEMORIZING PATTERN...
                </span>
              )}
              
              {gameState === 'player_turn' && (
                <span className="text-emerald-400 font-black tracking-widest text-xl flex items-center gap-3 animate-bounce drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
                  <FlagIcon /> YOUR TURN!
                </span>
              )}
              
              {gameState === 'waiting_for_next_level' && (
                <span className="text-yellow-400 font-bold tracking-widest text-lg flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  SEQUENCE MATCHED
                </span>
              )}
              
              {gameState === 'game_over' && (
                <div className="flex flex-col items-center gap-3">
                  <span className="text-red-500 font-black text-lg sm:text-xl tracking-wider drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                    Oops, Better Luck Next Time!!!
                  </span>
                  <div className="flex gap-4">
                    <button 
                      onClick={startGame} 
                      className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors text-sm font-bold uppercase tracking-wider"
                    >
                      Try Again
                    </button>
                    <button 
                      onClick={() => setGameState('idle')} 
                      className="px-5 py-2 bg-transparent border-2 border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 rounded-lg transition-colors text-sm font-bold uppercase tracking-wider"
                    >
                      Main Menu
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Row: Red Buttons */}
            <div className="flex justify-center gap-6 sm:gap-10">
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={`btn-${i}`}
                  onPointerDown={() => handleButtonPress(i)}
                  disabled={gameState !== 'player_turn'}
                  className={`w-16 h-16 sm:w-24 sm:h-24 rounded-xl transition-all duration-75 border-b-[8px] outline-none 
                    active:border-b-0 active:translate-y-[8px] focus:ring-4 focus:ring-red-500/50 relative overflow-hidden
                    ${activeButton === i 
                      ? 'bg-red-400 border-red-600'
                      : 'bg-red-600 border-red-900 hover:bg-red-500'
                    }
                    ${gameState !== 'player_turn' ? 'cursor-not-allowed grayscale-[0.3]' : 'cursor-pointer hover:shadow-[0_10px_20px_rgba(220,38,38,0.3)]'}
                  `}
                  aria-label={`Red memory button ${i + 1}`}
                >
                    {/* Button inner highlight */}
                    <div className="absolute top-0 left-0 w-full h-1/3 bg-white opacity-10 rounded-t-xl"></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
