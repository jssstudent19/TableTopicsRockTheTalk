'use client';

import { useState, useEffect } from 'react';

type Planet = {
  name: string;
  color: string;
  size: number;
  position: { left: string; top: string };
  gradient: string;
};

type Topic = {
  fallacy: string;
  question: string;
};

type RocketState = {
  position: { left: string; top: string };
  status: 'idle' | 'launching' | 'flying' | 'landed';
  targetPlanet: number | null;
  rotation: number;
};

const planets: Planet[] = [
  {
    name: 'Mercury',
    color: '#8C7853',
    size: 35,
    position: { left: '12%', top: '25%' },
    gradient: 'radial-gradient(circle at 30% 30%, #b39979, #8C7853, #6b5d45)',
  },
  {
    name: 'Venus',
    color: '#FFC649',
    size: 45,
    position: { left: '25%', top: '65%' },
    gradient: 'radial-gradient(circle at 30% 30%, #ffd97d, #FFC649, #e6a726)',
  },
  {
    name: 'Earth',
    color: '#4B9CD3',
    size: 48,
    position: { left: '42%', top: '75%' },
    gradient: 'radial-gradient(circle at 30% 30%, #6bb5e8, #4B9CD3, #2e7ab5)',
  },
  {
    name: 'Mars',
    color: '#CD5C5C',
    size: 40,
    position: { left: '58%', top: '20%' },
    gradient: 'radial-gradient(circle at 30% 30%, #e67f7f, #CD5C5C, #a84848)',
  },
  {
    name: 'Jupiter',
    color: '#DAA520',
    size: 70,
    position: { left: '75%', top: '55%' },
    gradient: 'radial-gradient(circle at 30% 30%, #f0c040, #DAA520, #b8871a)',
  },
  {
    name: 'Saturn',
    color: '#E8D191',
    size: 65,
    position: { left: '85%', top: '28%' },
    gradient: 'radial-gradient(circle at 30% 30%, #f5e5b0, #E8D191, #d1b870)',
  },
  {
    name: 'Uranus',
    color: '#4FD0E0',
    size: 52,
    position: { left: '18%', top: '80%' },
    gradient: 'radial-gradient(circle at 30% 30%, #7de4f2, #4FD0E0, #2eb5c4)',
  },
  {
    name: 'Neptune',
    color: '#4169E1',
    size: 50,
    position: { left: '88%', top: '75%' },
    gradient: 'radial-gradient(circle at 30% 30%, #6a8fee, #4169E1, #2d4fb8)',
  },
];

const topics: Topic[] = [
  {
    fallacy: 'Ad Hominem Attack',
    question:
      "Someone says your favorite teacher's advice is wrong because they dress funny. Does their appearance affect the quality of their advice?",
  },
  {
    fallacy: 'Straw Man Fallacy',
    question:
      "Your friend wants a pet dog, but their parent says 'You want to turn our home into a zoo!' Is this a fair representation of wanting one dog?",
  },
  {
    fallacy: 'False Dilemma',
    question:
      "A classmate says 'Either you're with me or against me.' Are these really the only two options in a friendship?",
  },
  {
    fallacy: 'Slippery Slope',
    question:
      "Someone argues that if we allow smartphones in class, soon students will demand TVs and video games too. Is this progression inevitable?",
  },
  {
    fallacy: 'Appeal to Authority',
    question:
      "A celebrity endorses a study method. Should you follow it just because they're famous? What else would you want to know?",
  },
  {
    fallacy: 'Hasty Generalization',
    question:
      "You try a new restaurant and the first dish is terrible. Would you conclude that everything on the menu is bad?",
  },
  {
    fallacy: 'Circular Reasoning',
    question:
      "Someone says 'I'm trustworthy because I always tell the truth, and you should believe me because I'm trustworthy.' What's the problem here?",
  },
  {
    fallacy: 'Red Herring',
    question:
      "During a discussion about screen time limits, someone brings up 'Books can be harmful too!' Does this address the original topic?",
  },
];

export default function Home() {
  const [rockets, setRockets] = useState<RocketState[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<{
    topic: Topic;
    planet: Planet;
  } | null>(null);
  const [usedPlanets, setUsedPlanets] = useState<Set<number>>(new Set());

  // Hardcoded 1:1 rocket-to-planet mapping
  const rocketPlanetMapping = [4, 2, 6, 0, 7, 5, 1, 3]; // Each rocket index maps to a planet index

  useEffect(() => {
    // Initialize rockets in a circular pattern at the center
    const centerX = 50;
    const centerY = 50;
    const radius = 15;
    const initialRockets: RocketState[] = Array.from({ length: 8 }, (_, i) => {
      const angle = (i * Math.PI * 2) / 8 - Math.PI / 2;
      const left = centerX + radius * Math.cos(angle);
      const top = centerY + radius * Math.sin(angle);
      return {
        position: { left: `${left}%`, top: `${top}%` },
        status: 'idle',
        targetPlanet: null,
        rotation: 0,
      };
    });
    setRockets(initialRockets);
  }, []);

  const handleRocketClick = (rocketIndex: number) => {
    if (rockets[rocketIndex].status !== 'idle') return;

    const targetPlanetIndex = rocketPlanetMapping[rocketIndex];
    
    if (usedPlanets.has(targetPlanetIndex)) return;

    const currentRocket = rockets[rocketIndex];
    const targetPlanet = planets[targetPlanetIndex];
    
    // Calculate angle for rotation
    const currentLeft = parseFloat(currentRocket.position.left);
    const currentTop = parseFloat(currentRocket.position.top);
    const targetLeft = parseFloat(targetPlanet.position.left);
    const targetTop = parseFloat(targetPlanet.position.top);
    
    const deltaX = targetLeft - currentLeft;
    const deltaY = targetTop - currentTop;
    const angleRad = Math.atan2(deltaY, deltaX);
    const angleDeg = angleRad * (180 / Math.PI) + 90; // +90 to point rocket upward

    // Launch sequence
    setRockets((prev) => {
      const newRockets = [...prev];
      newRockets[rocketIndex] = {
        ...newRockets[rocketIndex],
        status: 'launching',
        targetPlanet: targetPlanetIndex,
      };
      return newRockets;
    });

    // After shake animation, start flying
    setTimeout(() => {
      setRockets((prev) => {
        const newRockets = [...prev];
        newRockets[rocketIndex] = {
          ...newRockets[rocketIndex],
          status: 'flying',
          position: targetPlanet.position,
          rotation: angleDeg,
        };
        return newRockets;
      });

      // Land on planet
      setTimeout(() => {
        setRockets((prev) => {
          const newRockets = [...prev];
          newRockets[rocketIndex] = {
            ...newRockets[rocketIndex],
            status: 'landed',
            rotation: 0,
          };
          return newRockets;
        });

        setUsedPlanets((prev) => new Set(prev).add(targetPlanetIndex));

        // Show popup
        setTimeout(() => {
          setSelectedTopic({
            topic: topics[rocketIndex],
            planet: planets[targetPlanetIndex],
          });
        }, 300);
      }, 2200);
    }, 600);
  };

  const handleReset = () => {
    setUsedPlanets(new Set());
    setSelectedTopic(null);
    
    // Reset rockets to initial positions
    const centerX = 50;
    const centerY = 50;
    const radius = 15;
    const resetRockets: RocketState[] = Array.from({ length: 8 }, (_, i) => {
      const angle = (i * Math.PI * 2) / 8 - Math.PI / 2;
      const left = centerX + radius * Math.cos(angle);
      const top = centerY + radius * Math.sin(angle);
      return {
        position: { left: `${left}%`, top: `${top}%` },
        status: 'idle',
        targetPlanet: null,
        rotation: 0,
      };
    });
    setRockets(resetRockets);
  };

  return (
    <div className="space-scene">
      {/* Stars */}
      {Array.from({ length: 200 }).map((_, i) => (
        <div
          key={`star-${i}`}
          className="star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
            '--duration': `${Math.random() * 3 + 1}s`,
            '--delay': `${Math.random() * 3}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* Shooting Stars */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={`shooting-${i}`}
          className="shooting-star"
          style={{
            left: `${Math.random() * 50}%`,
            top: `${Math.random() * 50}%`,
            '--shoot-duration': `${Math.random() * 2 + 2}s`,
            '--shoot-delay': `${Math.random() * 5}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* Title */}
      <div className="title-container">
        <h1 className="title">Critical Thinking 101</h1>
        <p className="subtitle">Rock The Talk</p>
        <p className="instructions">Click a rocket to discover a logical fallacy!</p>
      </div>

      {/* Planets */}
      {planets.map((planet, index) => (
        <div key={`planet-${index}`}>
          {/* Orbit rings */}
          <div
            className="planet-orbit"
            style={{
              left: '50%',
              top: '50%',
              width: `${
                Math.sqrt(
                  Math.pow(parseFloat(planet.position.left) - 50, 2) +
                    Math.pow(parseFloat(planet.position.top) - 50, 2)
                ) * 2
              }%`,
              height: `${
                Math.sqrt(
                  Math.pow(parseFloat(planet.position.left) - 50, 2) +
                    Math.pow(parseFloat(planet.position.top) - 50, 2)
                ) * 2
              }%`,
            }}
          />
          
          {/* Planet */}
          <div
            className={`planet ${usedPlanets.has(index) ? 'planet-glow' : ''}`}
            style={{
              left: planet.position.left,
              top: planet.position.top,
              width: `${planet.size}px`,
              height: `${planet.size}px`,
              background: planet.gradient,
              boxShadow: usedPlanets.has(index)
                ? `0 0 30px ${planet.color}, inset 0 0 20px rgba(255,255,255,0.2)`
                : `0 0 20px ${planet.color}80, inset 0 0 15px rgba(255,255,255,0.1)`,
            }}
          >
            <span className="planet-label">{planet.name}</span>
            {planet.name === 'Saturn' && <div className="saturn-ring" />}
          </div>
        </div>
      ))}

      {/* Rockets */}
      {rockets.map((rocket, index) => (
        <div
          key={`rocket-${index}`}
          className={`rocket-container rocket-${rocket.status}`}
          style={{
            left: rocket.position.left,
            top: rocket.position.top,
            transform: `translate(-50%, -50%) rotate(${rocket.rotation}deg)`,
          }}
          onClick={() => handleRocketClick(index)}
        >
          <div className="rocket-body" style={{
            '--hover-delay': `${index * 0.15}s`,
          } as React.CSSProperties}>
            <div className="rocket-number">{index + 1}</div>
            
            {/* Rocket SVG */}
            <svg
              className="rocket-svg"
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Rocket body */}
              <path
                d="M20 5 L25 15 L25 30 L20 35 L15 30 L15 15 Z"
                fill="#E74C3C"
                stroke="#C0392B"
                strokeWidth="1.5"
              />
              {/* Window */}
              <circle cx="20" cy="18" r="3" fill="#4FD0E0" opacity="0.8" />
              {/* Fins */}
              <path d="M15 20 L10 30 L15 28 Z" fill="#C0392B" />
              <path d="M25 20 L30 30 L25 28 Z" fill="#C0392B" />
              {/* Nose cone */}
              <path d="M20 5 L25 15 L15 15 Z" fill="#F39C12" />
            </svg>

            {/* Flame effects (only show when launching or flying) */}
            {(rocket.status === 'launching' || rocket.status === 'flying') && (
              <div className="flame-container">
                <div className="flame-outer" />
                <div className="flame-inner" />
                {/* Smoke trail */}
                <div className="smoke-trail">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={`smoke-${i}`}
                      className="smoke-particle"
                      style={{
                        '--smoke-size': `${4 + i}px`,
                        '--smoke-opacity': 0.3 - i * 0.05,
                        '--smoke-delay': `${i * 0.1}s`,
                        '--smoke-speed': `${0.6 + i * 0.1}s`,
                      } as React.CSSProperties}
                    />
                  ))}
                </div>
              </div>
            )}

            <span className="rocket-label">Rocket {index + 1}</span>
            
            {/* Checkmark for landed rockets */}
            {rocket.status === 'landed' && (
              <span className="landed-check">✓</span>
            )}
          </div>
        </div>
      ))}

      {/* Topic Popup */}
      {selectedTopic && (
        <div className="popup-overlay" onClick={() => setSelectedTopic(null)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <div
                className="popup-planet-icon"
                style={{
                  background: selectedTopic.planet.gradient,
                  boxShadow: `0 0 20px ${selectedTopic.planet.color}`,
                }}
              />
              <div className="popup-planet-name">
                {selectedTopic.planet.name}
              </div>
            </div>
            
            <div className="popup-fallacy">{selectedTopic.topic.fallacy}</div>
            
            <div className="popup-question">{selectedTopic.topic.question}</div>
            
            <button className="popup-close" onClick={() => setSelectedTopic(null)}>
              Continue Exploring
            </button>
          </div>
        </div>
      )}

      {/* Reset Button */}
      <button className="reset-btn" onClick={handleReset}>
        ↻ Reset All
      </button>

      {/* Rocket Status */}
      <div className="rocket-status-indicator">
        Rockets Launched: {usedPlanets.size} / 8
      </div>
    </div>
  );
}
