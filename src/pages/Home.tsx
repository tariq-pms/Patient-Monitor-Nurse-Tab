import { useEffect, useState } from 'react';
import { keyframes } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

// Total splash sequence: petals orbit-converge -> pause -> bloom glow -> wordmark reveal -> hold -> handoff.
const SPLASH_HOLD_MS = 3700; // orbit + bloom + wordmark, before we start exiting
const SPLASH_EXIT_MS = 700; // crossfade out into Auth0

const EASE_IN_OUT = 'cubic-bezier(0.65, 0, 0.35, 1)';
const EASE_OUT = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

// Whole flower group rotates in as the petals converge on center.
const orbitSpin = keyframes`
  0% { transform: rotate(-170deg); }
  100% { transform: rotate(0deg); }
`;

// Each petal flies in from its resting compass point and settles into the flower shape.
const petalConverge = (x: number, y: number, rotate: number) => keyframes`
  0% { opacity: 0; transform: translate(${x}px, ${y}px) scale(0.3) rotate(${rotate}deg); }
  65% { opacity: 1; }
  100% { opacity: 1; transform: none; }
`;

// Soft light-blue aura that blooms behind the flower once it has fully formed.
const glowBloom = keyframes`
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.55); }
  60% { opacity: 0.85; transform: translate(-50%, -50%) scale(1.25); }
  100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
`;

// Wordmark reveals with a left-to-right wipe.
const wordWipe = keyframes`
  from { clip-path: inset(0 100% 0 0); opacity: 0; }
  to { clip-path: inset(0 0% 0 0); opacity: 1; }
`;

// [x, y, rotate] starting offsets for each of the 5 petals, in pinwheel order.
const PETAL_START: [number, number, number][] = [
  [0, -224, -40],
  [118, -38, 38],
  [73, 100, 48],
  [-73, 100, -48],
  [-118, -38, -38],
];

const PETAL_PATHS = [
  { d: 'M11.4253 22.8252C6.61996 16.8186 6.61996 6.00665 11.4253 0C16.2307 6.00665 16.2307 16.8186 11.4253 22.8252Z', opacity: 0.85 },
  { d: 'M1.14233 15.3558C5.37007 8.92949 15.6529 5.58841 22.8504 8.30238C18.6228 14.7287 8.33992 18.0698 1.14233 15.3558Z', opacity: 0.7 },
  { d: 'M5.07025 3.26758C12.4885 5.30257 18.8435 14.0496 18.4866 21.7335C11.0684 19.6987 4.71329 10.9516 5.07025 3.26758Z', opacity: 0.55 },
  { d: 'M17.7801 3.26758C18.137 10.9516 11.7819 19.6987 4.36371 21.7335C4.00675 14.0496 10.3619 5.30256 17.7801 3.26758Z', opacity: 0.55 },
  { d: 'M21.7081 15.3558C14.5105 18.0698 4.22773 14.7287 0 8.30238C7.19759 5.58841 17.4803 8.92949 21.7081 15.3558Z', opacity: 0.7 },
];

const PETAL_DELAY_MS = 150; // stagger between each petal's convergence start
const PETAL_DURATION_MS = 1900;
const ORBIT_DURATION_MS = 3000;
const GLOW_DELAY_MS = ORBIT_DURATION_MS;
const GLOW_DURATION_MS = 900;
const WORD_DELAY_MS = GLOW_DELAY_MS + 400;
const WORD_DURATION_MS = 900;

export const Home = (_currentRoom: any) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/patient-monitor');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated || isLoading) return;

    const exitTimer = setTimeout(() => setExiting(true), SPLASH_HOLD_MS);
    const redirectTimer = setTimeout(() => {
      loginWithRedirect();
    }, SPLASH_HOLD_MS + SPLASH_EXIT_MS);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(redirectTimer);
    };
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  if (isAuthenticated) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'scale(1.03)' : 'scale(1)',
        transition: `opacity ${SPLASH_EXIT_MS}ms ${EASE_IN_OUT}, transform ${SPLASH_EXIT_MS}ms ${EASE_IN_OUT}`,
      }}
    >
      <Box sx={{ position: 'relative', width: 96, height: 96 }}>
        {/* Aura glow, centered exactly on the flower */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 220,
            height: 220,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(91,155,224,0.55) 0%, rgba(140,187,238,0.28) 45%, rgba(180,212,245,0) 72%)',
            filter: 'blur(10px)',
            opacity: 0,
            transform: 'translate(-50%, -50%) scale(0.5)',
            animation: `${glowBloom} ${GLOW_DURATION_MS}ms ${EASE_OUT} forwards`,
            animationDelay: `${GLOW_DELAY_MS}ms`,
          }}
        />
        {/* Petals: orbit-rotate as a group while each converges from its own compass point */}
        <Box
          component="svg"
          viewBox="0 0 23 23"
          sx={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            height: '100%',
            overflow: 'visible',
            transformBox: 'view-box',
            transformOrigin: '11.4px 11.4px',
            animation: `${orbitSpin} ${ORBIT_DURATION_MS}ms ${EASE_IN_OUT} forwards`,
          }}
        >
          {PETAL_PATHS.map((petal, i) => {
            const [x, y, rotate] = PETAL_START[i];
            return (
              <Box
                key={i}
                component="path"
                d={petal.d}
                fill="#1C7CE5"
                fillOpacity={petal.opacity}
                sx={{
                  opacity: 0,
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  animation: `${petalConverge(x, y, rotate)} ${PETAL_DURATION_MS}ms ${EASE_IN_OUT} forwards`,
                  animationDelay: `${i * PETAL_DELAY_MS}ms`,
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Wordmark: "paarvai" in the brand blues, wiped in left-to-right after the flower has bloomed */}
      <Box
        sx={{
          overflow: 'hidden',
          clipPath: 'inset(0 100% 0 0)',
          opacity: 0,
          animation: `${wordWipe} ${WORD_DURATION_MS}ms ${EASE_IN_OUT} forwards`,
          animationDelay: `${WORD_DELAY_MS}ms`,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            letterSpacing: '0.02em',
            lineHeight: 1,
            background: 'linear-gradient(90deg, #0B2F82 0%, #1C7CE5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Paarvai
        </Typography>
      </Box>
    </Box>
  );
};
