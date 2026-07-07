import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HIGH_SCORE_KEY = '@neon_cyber_dash_high_score';

const SCREEN_WIDTH  = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// -- Physics constants (unchanged) -------------------------------------------
const SHIP_WIDTH         = 50;
const SHIP_HEIGHT        = 53;
const SHIP_BOTTOM_OFFSET = 140;
const MOVE_STEP          = 8;
const MOVE_INTERVAL      = 16;

const OBSTACLE_SIZE       = 40;
const OBSTACLE_FALL_SPEED = 5;

// -- Grid layout ---------------------------------------------------------------
const H_LINES = 11;
const V_LINES = 8;

// -- Collision Engine (AABB - unchanged) ---------------------------------------
function isColliding(shipX, obstacleX, obstacleY) {
  const shipLeft   = shipX;
  const shipRight  = shipX + SHIP_WIDTH;
  const shipTop    = SCREEN_HEIGHT - SHIP_BOTTOM_OFFSET - SHIP_HEIGHT;
  const shipBottom = SCREEN_HEIGHT - SHIP_BOTTOM_OFFSET;

  const obstacleLeft   = obstacleX;
  const obstacleRight  = obstacleX + OBSTACLE_SIZE;
  const obstacleTop    = obstacleY;
  const obstacleBottom = obstacleY + OBSTACLE_SIZE;

  const overlapX = obstacleLeft < shipRight && obstacleRight > shipLeft;
  const overlapY = obstacleTop  < shipBottom && obstacleBottom > shipTop;

  return overlapX && overlapY;
}

// -- CyberGrid: futuristic deep-space background -------------------------------
function CyberGrid() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: H_LINES }).map((_, i) => (
        <View key={`h${i}`} style={[styles.gridLine, { top: (SCREEN_HEIGHT / H_LINES) * i, width: '100%', height: 1 }]} />
      ))}
      {Array.from({ length: V_LINES }).map((_, i) => (
        <View key={`v${i}`} style={[styles.gridLine, { left: (SCREEN_WIDTH / V_LINES) * i, width: 1, height: '100%' }]} />
      ))}
      <View style={styles.edgeTop} />
      <View style={styles.edgeBottom} />
      <View style={styles.edgeLeft} />
      <View style={styles.edgeRight} />
      <View style={[styles.bracketH, styles.bracketCyan, { top: 0, left: 0 }]} />
      <View style={[styles.bracketV, styles.bracketCyan, { top: 0, left: 0 }]} />
      <View style={[styles.bracketH, styles.bracketCyan, { top: 0, right: 0 }]} />
      <View style={[styles.bracketV, styles.bracketCyan, { top: 0, right: 0 }]} />
      <View style={[styles.bracketH, styles.bracketPink, { bottom: 0, left: 0 }]} />
      <View style={[styles.bracketV, styles.bracketPink, { bottom: 0, left: 0 }]} />
      <View style={[styles.bracketH, styles.bracketPink, { bottom: 0, right: 0 }]} />
      <View style={[styles.bracketV, styles.bracketPink, { bottom: 0, right: 0 }]} />
      <View style={[styles.glowOrb, { width: 200, height: 200, borderRadius: 100, top: SCREEN_HEIGHT * 0.1, left: -80, backgroundColor: 'rgba(0,255,247,0.045)' }]} />
      <View style={[styles.glowOrb, { width: 180, height: 180, borderRadius: 90, top: SCREEN_HEIGHT * 0.55, right: -70, backgroundColor: 'rgba(255,46,154,0.045)' }]} />
      <View style={[styles.glowOrb, { width: 120, height: 120, borderRadius: 60, top: SCREEN_HEIGHT * 0.38, left: SCREEN_WIDTH * 0.5 - 60, backgroundColor: 'rgba(60,80,255,0.035)' }]} />
      <View style={{ position: 'absolute', top: SCREEN_HEIGHT * 0.5, left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,255,247,0.12)' }} />
    </View>
  );
}

// -- SpaceShip: multi-panel neon ship with wings -------------------------------
function SpaceShip({ shipX }) {
  return (
    <View style={[styles.shipContainer, { left: shipX }]}>
      <View style={styles.wingLeft} />
      <View style={styles.wingRight} />
      <View style={styles.wingAccentLeft} />
      <View style={styles.wingAccentRight} />
      <View style={styles.shipBodyTriangle} />
      <View style={styles.cockpit} />
      <View style={styles.engineBar} />
      <View style={styles.thrusterL} />
      <View style={styles.thrusterR} />
    </View>
  );
}

// -- EnergyCore: unstable energy obstacle with layered geometry ----------------
function EnergyCore({ obstacleX, obstacleY }) {
  return (
    <View style={[styles.coreWrapper, { left: obstacleX, top: obstacleY }]}>
      <View style={styles.coreOuter} />
      <View style={styles.coreInner} />
      <View style={styles.coreNucleus} />
    </View>
  );
}

// -- App -----------------------------------------------------------------------
export default function App() {
  const [isPlaying,  setIsPlaying]  = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [shipX,      setShipX]      = useState(SCREEN_WIDTH / 2 - SHIP_WIDTH / 2);
  const [score,      setScore]      = useState(0);
  const [highScore,  setHighScore]  = useState(0);
  const [obstacleX,  setObstacleX]  = useState(Math.random() * (SCREEN_WIDTH - OBSTACLE_SIZE));
  const [obstacleY,  setObstacleY]  = useState(0);

  const moveTimer    = useRef(null);
  const shipXRef     = useRef(shipX);
  const obstacleXRef = useRef(obstacleX);
  const obstacleYRef = useRef(obstacleY);
  const scoreRef     = useRef(score);
  const highScoreRef = useRef(highScore);

  useEffect(() => { shipXRef.current     = shipX;     }, [shipX]);
  useEffect(() => { obstacleXRef.current = obstacleX; }, [obstacleX]);
  useEffect(() => { obstacleYRef.current = obstacleY; }, [obstacleY]);
  useEffect(() => { scoreRef.current     = score;     }, [score]);
  useEffect(() => { highScoreRef.current = highScore; }, [highScore]);

  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const savedValue = await AsyncStorage.getItem(HIGH_SCORE_KEY);
        if (savedValue !== null) setHighScore(parseInt(savedValue, 10));
      } catch (e) {
        console.warn('Failed to load high score:', e);
      }
    };
    loadHighScore();
  }, []);

  const saveHighScoreIfBeaten = async (finalScore) => {
    if (finalScore > highScoreRef.current) {
      try {
        await AsyncStorage.setItem(HIGH_SCORE_KEY, String(finalScore));
        setHighScore(finalScore);
      } catch (e) {
        console.warn('Failed to save high score:', e);
      }
    }
  };

  const startMoving = (direction) => {
    stopMoving();
    moveTimer.current = setInterval(() => {
      setShipX((prevX) => {
        const delta = direction === 'left' ? -MOVE_STEP : MOVE_STEP;
        const newX  = prevX + delta;
        const minX  = 0;
        const maxX  = SCREEN_WIDTH - SHIP_WIDTH;
        if (newX < minX) return minX;
        if (newX > maxX) return maxX;
        return newX;
      });
    }, MOVE_INTERVAL);
  };

  const stopMoving = () => {
    if (moveTimer.current) {
      clearInterval(moveTimer.current);
      moveTimer.current = null;
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    const gameLoop = setInterval(() => {
      const newY = obstacleYRef.current + OBSTACLE_FALL_SPEED;
      obstacleYRef.current = newY;

      if (isColliding(shipXRef.current, obstacleXRef.current, newY)) {
        clearInterval(gameLoop);
        stopMoving();
        setIsPlaying(false);
        setIsGameOver(true);
        saveHighScoreIfBeaten(scoreRef.current);
        return;
      }

      if (newY > SCREEN_HEIGHT) {
        scoreRef.current = scoreRef.current + 1;
        setScore(scoreRef.current);

        const newX = Math.random() * (SCREEN_WIDTH - OBSTACLE_SIZE);
        obstacleXRef.current = newX;
        setObstacleX(newX);

        obstacleYRef.current = 0;
        setObstacleY(0);
        return;
      }

      setObstacleY(newY);
    }, 16);

    return () => clearInterval(gameLoop);
  }, [isPlaying]);

  const handleStart = () => {
    stopMoving();
    scoreRef.current     = 0;
    obstacleYRef.current = 0;
    setScore(0);
    setShipX(SCREEN_WIDTH / 2 - SHIP_WIDTH / 2);
    setObstacleX(Math.random() * (SCREEN_WIDTH - OBSTACLE_SIZE));
    setObstacleY(0);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  return (
    <View style={styles.container}>

      <CyberGrid />

      <View style={styles.hud}>
        <Text style={styles.title}>NEON CYBER DASH</Text>
        <View style={styles.scorePanel}>
          <View style={styles.scoreStat}>
            <Text style={styles.statLabel}>SCORE</Text>
            <Text style={styles.statValue}>{score}</Text>
          </View>
          <View style={styles.scoreDivider} />
          <View style={styles.scoreStat}>
            <Text style={styles.statLabel}>BEST</Text>
            <Text style={[styles.statValue, styles.statValuePink]}>{highScore}</Text>
          </View>
        </View>
      </View>

      {!isPlaying && !isGameOver && (
        <View style={styles.menuOverlay}>
          <Text style={styles.menuTagline}>PILOT YOUR SHIP  ·  DODGE THE CORES</Text>
          <Pressable style={styles.primaryButton} onPress={handleStart}>
            <Text style={styles.primaryButtonText}>▶  START GAME</Text>
          </Pressable>
          <Text style={styles.menuHint}>Hold LEFT or RIGHT to manoeuvre</Text>
        </View>
      )}

      {(isPlaying || isGameOver) && (
        <EnergyCore obstacleX={obstacleX} obstacleY={obstacleY} />
      )}
      {(isPlaying || isGameOver) && (
        <SpaceShip shipX={shipX} />
      )}

      {isPlaying && (
        <View style={styles.controlsRow}>
          <Pressable style={styles.controlBtn} onPressIn={() => startMoving('left')} onPressOut={stopMoving}>
            <Text style={styles.controlBtnText}>◀  LEFT</Text>
          </Pressable>
          <Pressable style={styles.controlBtn} onPressIn={() => startMoving('right')} onPressOut={stopMoving}>
            <Text style={styles.controlBtnText}>RIGHT  ▶</Text>
          </Pressable>
        </View>
      )}

      {isGameOver && (
        <View style={styles.gameOverOverlay}>
          <View style={styles.gameOverCard}>
            <Text style={styles.gameOverEyebrow}>— SYSTEM FAILURE —</Text>
            <Text style={styles.gameOverTitle}>GAME OVER</Text>
            <View style={styles.gameOverRule} />
            <Text style={styles.gameOverScoreLabel}>FINAL SCORE</Text>
            <Text style={styles.gameOverScoreValue}>{score}</Text>
            <Text style={styles.gameOverBest}>BEST  {highScore}</Text>
            <Pressable style={styles.primaryButton} onPress={handleStart}>
              <Text style={styles.primaryButtonText}>↺  PLAY AGAIN</Text>
            </Pressable>
          </View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A12',
  },

  // Grid
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(0,255,247,0.052)',
  },
  edgeTop: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 2, backgroundColor: 'rgba(0,255,247,0.4)',
  },
  edgeBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 2, backgroundColor: 'rgba(255,46,154,0.4)',
  },
  edgeLeft: {
    position: 'absolute', top: 0, bottom: 0, left: 0,
    width: 2, backgroundColor: 'rgba(0,255,247,0.15)',
  },
  edgeRight: {
    position: 'absolute', top: 0, bottom: 0, right: 0,
    width: 2, backgroundColor: 'rgba(0,255,247,0.15)',
  },
  bracketH: { position: 'absolute', width: 36, height: 3 },
  bracketV: { position: 'absolute', width: 3,  height: 36 },
  bracketCyan: { backgroundColor: '#00FFF7' },
  bracketPink: { backgroundColor: '#FF2E9A' },
  glowOrb: { position: 'absolute' },

  // HUD
  hud: {
    paddingTop: 56,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 29,
    fontWeight: '900',
    color: '#00FFF7',
    letterSpacing: 5,
    textAlign: 'center',
    textShadowColor: '#00FFF7',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 18,
  },
  scorePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,255,247,0.22)',
    borderRadius: 14,
    backgroundColor: 'rgba(0,255,247,0.04)',
    paddingHorizontal: 28,
    paddingVertical: 13,
  },
  scoreStat: {
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  scoreDivider: {
    width: 1,
    height: 38,
    backgroundColor: 'rgba(0,255,247,0.22)',
  },
  statLabel: {
    fontSize: 10,
    letterSpacing: 2.5,
    color: 'rgba(0,255,247,0.5)',
    fontWeight: '700',
    marginBottom: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  statValuePink: { color: '#FF2E9A' },

  // Start menu
  menuOverlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTagline: {
    fontSize: 11,
    letterSpacing: 2,
    color: 'rgba(0,255,247,0.45)',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 28,
  },
  menuHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.28)',
    letterSpacing: 1,
    marginTop: 18,
  },

  // Primary Button
  primaryButton: {
    borderWidth: 2,
    borderColor: '#FF2E9A',
    paddingVertical: 16,
    paddingHorizontal: 52,
    borderRadius: 32,
    backgroundColor: 'rgba(255,46,154,0.1)',
    shadowColor: '#FF2E9A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#FF2E9A',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 2.5,
  },

  // SpaceShip
  shipContainer: {
    position: 'absolute',
    bottom: SHIP_BOTTOM_OFFSET,
    width: SHIP_WIDTH,
    height: SHIP_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  wingLeft: {
    position: 'absolute',
    bottom: 16, left: -8,
    width: 26, height: 7,
    backgroundColor: '#FF2E9A',
    borderRadius: 3,
    transform: [{ rotate: '-22deg' }],
    shadowColor: '#FF2E9A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  wingRight: {
    position: 'absolute',
    bottom: 16, right: -8,
    width: 26, height: 7,
    backgroundColor: '#FF2E9A',
    borderRadius: 3,
    transform: [{ rotate: '22deg' }],
    shadowColor: '#FF2E9A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  wingAccentLeft: {
    position: 'absolute',
    bottom: 20, left: 1,
    width: 14, height: 2,
    backgroundColor: 'rgba(0,255,247,0.6)',
    borderRadius: 1,
    transform: [{ rotate: '-22deg' }],
  },
  wingAccentRight: {
    position: 'absolute',
    bottom: 20, right: 1,
    width: 14, height: 2,
    backgroundColor: 'rgba(0,255,247,0.6)',
    borderRadius: 1,
    transform: [{ rotate: '22deg' }],
  },
  shipBodyTriangle: {
    position: 'absolute',
    bottom: 11,
    width: 0, height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 15, borderRightWidth: 15, borderBottomWidth: 46,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderBottomColor: '#00FFF7',
    shadowColor: '#00FFF7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  cockpit: {
    position: 'absolute',
    bottom: 48,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  engineBar: {
    position: 'absolute',
    bottom: 3,
    width: 26, height: 6,
    backgroundColor: '#FF2E9A',
    borderRadius: 3,
    shadowColor: '#FF2E9A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  thrusterL: {
    position: 'absolute',
    bottom: 0, left: 11,
    width: 7, height: 4,
    backgroundColor: 'rgba(255,160,20,0.95)',
    borderRadius: 2,
  },
  thrusterR: {
    position: 'absolute',
    bottom: 0, right: 11,
    width: 7, height: 4,
    backgroundColor: 'rgba(255,160,20,0.95)',
    borderRadius: 2,
  },

  // EnergyCore
  coreWrapper: {
    position: 'absolute',
    width: OBSTACLE_SIZE, height: OBSTACLE_SIZE,
    alignItems: 'center', justifyContent: 'center',
  },
  coreOuter: {
    position: 'absolute',
    width: OBSTACLE_SIZE, height: OBSTACLE_SIZE,
    borderWidth: 2, borderColor: '#FF2E9A',
    borderRadius: 7,
    backgroundColor: 'rgba(255,46,154,0.09)',
    transform: [{ rotate: '45deg' }],
    shadowColor: '#FF2E9A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 12,
  },
  coreInner: {
    position: 'absolute',
    width: 20, height: 20,
    borderRadius: 4,
    backgroundColor: 'rgba(255,46,154,0.65)',
    transform: [{ rotate: '45deg' }],
    shadowColor: '#FF2E9A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  coreNucleus: {
    position: 'absolute',
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },

  // Controls
  controlsRow: {
    position: 'absolute',
    bottom: 30, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  controlBtn: {
    borderWidth: 2,
    borderColor: '#00FFF7',
    paddingVertical: 16,
    paddingHorizontal: 26,
    borderRadius: 16,
    backgroundColor: 'rgba(0,255,247,0.07)',
    shadowColor: '#00FFF7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  controlBtnText: {
    color: '#00FFF7',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  // Game Over
  gameOverOverlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(7,10,18,0.93)',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24,
  },
  gameOverCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,46,154,0.35)',
    borderRadius: 22,
    backgroundColor: 'rgba(255,46,154,0.04)',
    alignItems: 'center',
    paddingVertical: 46,
    paddingHorizontal: 24,
    shadowColor: '#FF2E9A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
  },
  gameOverEyebrow: {
    fontSize: 10,
    letterSpacing: 3.5,
    color: 'rgba(255,46,154,0.55)',
    fontWeight: '700',
    marginBottom: 14,
  },
  gameOverTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FF2E9A',
    letterSpacing: 5,
    textShadowColor: '#FF2E9A',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 26,
    marginBottom: 22,
  },
  gameOverRule: {
    width: 56, height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(0,255,247,0.45)',
    marginBottom: 26,
  },
  gameOverScoreLabel: {
    fontSize: 10,
    letterSpacing: 3,
    color: 'rgba(0,255,247,0.5)',
    fontWeight: '700',
    marginBottom: 6,
  },
  gameOverScoreValue: {
    fontSize: 62,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    lineHeight: 70,
    marginBottom: 6,
  },
  gameOverBest: {
    fontSize: 13,
    color: 'rgba(255,46,154,0.65)',
    fontWeight: '700',
    letterSpacing: 2.5,
    marginBottom: 34,
  },
});
