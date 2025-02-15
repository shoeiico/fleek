"use client";

import React, { useState, useEffect, useCallback } from "react";

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 10;
const BULLET_WIDTH = 5;
const BULLET_HEIGHT = 10;
const ALIEN_WIDTH = 40;
const ALIEN_HEIGHT = 20;
const ALIEN_ROWS = 4;
const ALIEN_COLUMNS = 8;

type Position = { x: number; y: number };

const createAliens = () => {
  const aliens: Position[] = [];
  for (let row = 0; row < ALIEN_ROWS; row++) {
    for (let col = 0; col < ALIEN_COLUMNS; col++) {
      aliens.push({ x: col * ALIEN_WIDTH + 20, y: row * ALIEN_HEIGHT + 20 });
    }
  }
  return aliens;
};

const SpaceInvaders: React.FC = () => {
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
  const [bullets, setBullets] = useState<Position[]>([]);
  const [aliens, setAliens] = useState(createAliens());
  const [alienDirection, setAlienDirection] = useState(1); // 1 for right, -1 for left
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const movePlayer = (direction: "left" | "right") => {
    setPlayerX((prev) =>
      direction === "left"
        ? Math.max(0, prev - 20)
        : Math.min(GAME_WIDTH - PLAYER_WIDTH, prev + 20)
    );
  };

  const shootBullet = useCallback(() => {
    setBullets((prev) => [
      ...prev,
      { x: playerX + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2, y: GAME_HEIGHT - PLAYER_HEIGHT - BULLET_HEIGHT },
    ]);
  }, [playerX]);

  const updateBullets = () => {
    setBullets((prevBullets) =>
      prevBullets
        .map((bullet) => ({ ...bullet, y: bullet.y - 10 }))
        .filter((bullet) => bullet.y > 0)
    );
  };

  const updateAliens = useCallback(() => {
    setAliens((prevAliens) => {
      const edgeReached = prevAliens.some(
        (alien) =>
          (alienDirection === 1 && alien.x + ALIEN_WIDTH >= GAME_WIDTH) ||
          (alienDirection === -1 && alien.x <= 0)
      );

      const newDirection = edgeReached ? -alienDirection : alienDirection;
      setAlienDirection(newDirection);

      const newAliens = prevAliens.map((alien) => ({
        ...alien,
        x: alien.x + newDirection * 10,
        y: edgeReached ? alien.y + 10 : alien.y,
      }));

      const filteredAliens = newAliens.filter((alien) => {
        const wasHit = bullets.some(
          (bullet) =>
            bullet.x > alien.x &&
            bullet.x < alien.x + ALIEN_WIDTH &&
            bullet.y > alien.y &&
            bullet.y < alien.y + ALIEN_HEIGHT
        );
        if (wasHit) setScore((prevScore) => prevScore + 10);
        return !wasHit;
      });

      if (filteredAliens.some((alien) => alien.y + ALIEN_HEIGHT >= GAME_HEIGHT)) {
        setGameOver(true);
      }

      return filteredAliens;
    });
  }, [bullets, alienDirection]);

  const restartGame = () => {
    setPlayerX(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
    setBullets([]);
    setAliens(createAliens());
    setAlienDirection(1);
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") movePlayer("left");
      if (e.key === "ArrowRight") movePlayer("right");
      if (e.key === " ") shootBullet();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shootBullet]);

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      updateBullets();
      updateAliens();
    }, 20);

    return () => clearInterval(interval);
  }, [updateAliens, bullets, gameOver]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#000",
        color: "#fff",
        textAlign: "center",
      }}
    >
      <h1>- Space Invaders -</h1>
      <div style={{ marginBottom: "20px" }}>
        <p>
          <strong>Controls:</strong>
        </p>
        <p>Arrow Left: Move Left | Arrow Right: Move Right | Space: Shoot</p>
      </div>
      <h2>Score: {score}</h2>
      {gameOver && <h3>Game Over! Press &quot;Restart&quot; to play again.</h3>}
      <div
        style={{
          position: "relative",
          width: `${GAME_WIDTH}px`,
          height: `${GAME_HEIGHT}px`,
          backgroundColor: "#222",
          border: "2px solid #fff",
        }}
      >
        {/* Player */}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: playerX,
            width: `${PLAYER_WIDTH}px`,
            height: `${PLAYER_HEIGHT}px`,
            backgroundColor: "#fff",
          }}
        />
        {/* Bullets */}
        {bullets.map((bullet, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              top: bullet.y,
              left: bullet.x,
              width: `${BULLET_WIDTH}px`,
              height: `${BULLET_HEIGHT}px`,
              backgroundColor: "#f00",
            }}
          />
        ))}
        {/* Aliens */}
        {aliens.map((alien, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              top: alien.y,
              left: alien.x,
              width: `${ALIEN_WIDTH}px`,
              height: `${ALIEN_HEIGHT}px`,
              backgroundColor: "#0f0",
              border: "1px solid #fff",
            }}
          />
        ))}
      </div>
      <button
        onClick={restartGame}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Restart
      </button>
    </div>
  );
};

export default SpaceInvaders;
