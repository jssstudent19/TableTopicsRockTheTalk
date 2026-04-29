'use client';

import { useState, useEffect, useMemo } from 'react';

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

// Solar system center — pushed down to clear the header title
const SUN_CX = 50; // % from left
const SUN_CY = 54; // % from top

// Orbit radii in % of viewport width (larger = bigger system)
// Inner radii bumped up so planets clear the sun's glow effect (~120px shadow)
const ORBIT_RADII = [16, 20, 25, 30, 36, 42, 48, 54];

// Evenly spread planets every 45° around the full 360°
const PLANET_ANGLES_DEG = [0, 45, 90, 135, 180, 225, 270, 315];

// Ellipse ratio: vertical radius = horizontal radius * ELLIPSE_RATIO
const ELLIPSE_RATIO = 0.5;

function orbitPos(orbitIndex: number) {
  const r = ORBIT_RADII[orbitIndex];
  const angleDeg = PLANET_ANGLES_DEG[orbitIndex];
  const angleRad = (angleDeg * Math.PI) / 180;
  const x = SUN_CX + r * Math.cos(angleRad);
  const y = SUN_CY + r * ELLIPSE_RATIO * Math.sin(angleRad);
  return { left: `${x}%`, top: `${y}%` };
}

const planets: Planet[] = [
  {
    name: 'Mercury',
    color: '#9E8E7A',
    size: 26,
    position: orbitPos(0),
    gradient:
      'radial-gradient(circle at 32% 28%, #c9b8a8 0%, #9E8E7A 40%, #6e5f50 75%, #4a3d30 100%)',
  },
  {
    name: 'Venus',
    color: '#E8C56B',
    size: 38,
    position: orbitPos(1),
    gradient:
      'radial-gradient(circle at 34% 26%, #fff0c0 0%, #f5d580 25%, #E8C56B 55%, #b89030 80%, #8a6a10 100%)',
  },
  {
    name: 'Earth',
    color: '#2E86C1',
    size: 40,
    position: orbitPos(2),
    gradient:
      'radial-gradient(circle at 36% 30%, #7fd8f7 0%, #3fa8e0 20%, #2E86C1 50%, #1a5c8a 75%, #1a4060 100%)',
  },
  {
    name: 'Mars',
    color: '#C1440E',
    size: 32,
    position: orbitPos(3),
    gradient:
      'radial-gradient(circle at 33% 28%, #f0a090 0%, #d9604a 30%, #C1440E 60%, #8a2a05 85%, #5a1800 100%)',
  },
  {
    name: 'Jupiter',
    color: '#C88B3A',
    size: 72,
    position: orbitPos(4),
    gradient:
      'radial-gradient(circle at 38% 33%, #f5d89a 0%, #e0aa55 25%, #C88B3A 55%, #9a6018 80%, #6a4008 100%)',
  },
  {
    name: 'Saturn',
    color: '#D4B862',
    size: 60,
    position: orbitPos(5),
    gradient:
      'radial-gradient(circle at 36% 30%, #f8ebc0 0%, #e8d088 30%, #D4B862 60%, #a88a30 85%, #7a6010 100%)',
  },
  {
    name: 'Uranus',
    color: '#4EC5D0',
    size: 50,
    position: orbitPos(6),
    gradient:
      'radial-gradient(circle at 34% 28%, #b8f4fa 0%, #70dde8 30%, #4EC5D0 60%, #258898 85%, #145868 100%)',
  },
  {
    name: 'Neptune',
    color: '#3458C8',
    size: 48,
    position: orbitPos(7),
    gradient:
      'radial-gradient(circle at 34% 28%, #90aaf8 0%, #5078e8 30%, #3458C8 60%, #1e3898 85%, #0e2068 100%)',
  },
];

const topics: Topic[] = [
  {
    fallacy: '⚖️ Ad Hominem',
    question:
      "Has someone ever dismissed your idea just because of who you are — not what you said? Tell us about it, and how you handled it.",
  },
  {
    fallacy: '🚪 False Dilemma',
    question:
      "Have you ever been told 'it's either this or nothing'? Share a time someone gave you a black-and-white choice that wasn't really that simple.",
  },
  {
    fallacy: '🎿 Slippery Slope',
    question:
      "Has anyone ever warned you that one small decision would lead to a disaster? Talk about a time someone assumed the worst from a small change.",
  },
  {
    fallacy: '🪆 Straw Man',
    question:
      "Has someone ever twisted your words to make your point sound extreme or silly? How did you feel, and what did you actually mean to say?",
  },
  {
    fallacy: '🏆 Appeal to Authority',
    question:
      "Have you ever done something — bought a product, followed advice, changed your mind — just because a celebrity or expert said so? Was it worth it?",
  },
  {
    fallacy: '🔍 Hasty Generalization',
    question:
      "Have you ever judged a place, a food, or a group of people after just one bad experience — and later turned out to be wrong? What changed your mind?",
  },
  {
    fallacy: '🐑 Bandwagon',
    question:
      "Tell us about a time you did something just because everyone around you was doing it. Looking back, was it the right call — or did you just go with the crowd?",
  },
  {
    fallacy: '🔄 Circular Reasoning',
    question:
      "Tell us about a rule or belief you grew up with that was never explained — it was just 'the way things are.' Do you still accept it today, and why?",
  },
];

export default function Home() {
  const [rockets, setRockets] = useState<RocketState[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<{
    topic: Topic;
    planet: Planet;
  } | null>(null);
  const [usedPlanets, setUsedPlanets] = useState<Set<number>>(new Set());

  // Generate stable star positions using a seeded sequence (avoids hydration mismatch)
  const stars = useMemo(() => {
    // Simple deterministic pseudo-random using index-based math
    return Array.from({ length: 200 }, (_, i) => {
      const s1 = ((i * 9301 + 49297) % 233280) / 233280;
      const s2 = (((i + 50) * 9301 + 49297) % 233280) / 233280;
      const s3 = (((i + 100) * 9301 + 49297) % 233280) / 233280;
      const s4 = (((i + 150) * 9301 + 49297) % 233280) / 233280;
      const s5 = (((i + 200) * 9301 + 49297) % 233280) / 233280;
      const s6 = (((i + 250) * 9301 + 49297) % 233280) / 233280;
      return {
        left: `${s1 * 100}%`,
        top: `${s2 * 100}%`,
        width: `${s3 * 2 + 1}px`,
        height: `${s4 * 2 + 1}px`,
        duration: `${s5 * 3 + 1}s`,
        delay: `${s6 * 3}s`,
      };
    });
  }, []);

  // Hardcoded 1:1 rocket-to-planet mapping
  const rocketPlanetMapping = [4, 2, 6, 0, 7, 5, 1, 3]; // Each rocket index maps to a planet index

  useEffect(() => {
    // Initialize rockets in a horizontal line at the bottom, well below the solar system
    const startX = 9;
    const spacing = 11.5;
    const bottomY = 93; // pushed well below the solar system
    
    const initialRockets: RocketState[] = Array.from({ length: 8 }, (_, i) => {
      return {
        position: { left: `${startX + i * spacing}%`, top: `${bottomY}%` },
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

    // Launch sequence — rotate to face target during shake, then fly
    setRockets((prev) => {
      const newRockets = [...prev];
      newRockets[rocketIndex] = {
        ...newRockets[rocketIndex],
        status: 'launching',
        targetPlanet: targetPlanetIndex,
        rotation: angleDeg, // rotate to face planet during shake
      };
      return newRockets;
    });

    // After shake, fly straight toward planet keeping the same heading
    setTimeout(() => {
      setRockets((prev) => {
        const newRockets = [...prev];
        newRockets[rocketIndex] = {
          ...newRockets[rocketIndex],
          status: 'flying',
          position: targetPlanet.position,
          rotation: angleDeg, // maintain heading during flight
        };
        return newRockets;
      });

      // Land after flight completes (match CSS transition duration 5000ms)
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

        // Show popup shortly after landing
        setTimeout(() => {
          setSelectedTopic({
            topic: topics[rocketIndex],
            planet: planets[targetPlanetIndex],
          });
        }, 400);
      }, 5000);
    }, 600);
  };

  const handleReset = () => {
    setUsedPlanets(new Set());
    setSelectedTopic(null);
    
    // Reset rockets to initial positions at bottom
    const startX = 9;
    const spacing = 11.5;
    const bottomY = 93;
    
    const resetRockets: RocketState[] = Array.from({ length: 8 }, (_, i) => {
      return {
        position: { left: `${startX + i * spacing}%`, top: `${bottomY}%` },
        status: 'idle',
        targetPlanet: null,
        rotation: 0,
      };
    });
    setRockets(resetRockets);
  };

  return (
    <div className="space-scene">
      {/* Stars — positions are stable/deterministic to avoid hydration mismatch */}
      {stars.map((star, i) => (
        <div
          key={`star-${i}`}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            width: star.width,
            height: star.height,
            '--duration': star.duration,
            '--delay': star.delay,
          } as React.CSSProperties}
        />
      ))}



      {/* Title */}
      <div className="title-container">
        <h1 className="title">Critical Thinking 101</h1>
        <p className="subtitle">Rock The Talk</p>
        <p className="instructions">Click a rocket to discover a logical fallacy!</p>
      </div>

      {/* Sun */}
      <div className="sun" />

      {/* Orbital Rings - elliptical matching planet positions */}
      {ORBIT_RADII.map((radius, i) => (
        <div
          key={`orbit-${i}`}
          className="planet-orbit"
          style={{
            width: `${radius * 2}%`,
            height: `${radius * 2 * ELLIPSE_RATIO}%`,
          }}
        />
      ))}

      {/* Planets */}
      {planets.map((planet, index) => (
        <div
          key={`planet-${index}`}
          className={`planet ${usedPlanets.has(index) ? 'planet-glow' : ''}`}
          style={{
            left: planet.position.left,
            top: planet.position.top,
            width: `${planet.size}px`,
            height: `${planet.size}px`,
            background: planet.gradient,
            boxShadow: usedPlanets.has(index)
              ? `0 0 40px ${planet.color}, 0 0 18px ${planet.color}, inset -10px -10px 22px rgba(0, 0, 0, 0.55), inset 5px 5px 14px rgba(255, 255, 255, 0.3)`
              : `0 0 14px ${planet.color}50, inset -10px -10px 22px rgba(0, 0, 0, 0.55), inset 5px 5px 14px rgba(255, 255, 255, 0.25)`,
          }}
        >
          {planet.name === 'Earth' && <div className="earth-clouds" />}
          {planet.name === 'Jupiter' && <div className="jupiter-bands" />}
          {planet.name === 'Mars' && <div className="mars-texture" />}
          {planet.name === 'Saturn' && <div className="saturn-ring" />}
          {planet.name === 'Uranus' && <div className="uranus-bands" />}
          {planet.name === 'Neptune' && <div className="neptune-storms" />}
          <span className="planet-label">{planet.name}</span>
        </div>
      ))}

      {/* Launch Pad Zone separator */}
      <div className="launch-pad" />

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
