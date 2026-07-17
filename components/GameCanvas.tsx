"use client";

import { useEffect, useRef } from "react";
import * as Phaser from "phaser";

import { gameConfig } from "@/game/config";
import DungeonScene from "@/game/scenes/DungeonScene";

export default function GameCanvas() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameContainerRef.current || gameRef.current) {
      return;
    }

    gameRef.current = new Phaser.Game({
      ...gameConfig,
      parent: gameContainerRef.current,
      scene: [DungeonScene],
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={gameContainerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "400px",
        overflow: "hidden",
        background: "#0b1116",
      }}
    />
  );
}
