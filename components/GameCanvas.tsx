"use client";

import { useEffect, useRef } from "react";
import * as Phaser from "phaser";

import { gameConfig } from "@/game/config";

export default function GameCanvas() {
  const gameContainerRef =
    useRef<HTMLDivElement>(null);

  const gameRef =
    useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (
      !gameContainerRef.current ||
      gameRef.current
    ) {
      return;
    }

    /*
     * Scene sudah didaftarkan
     * langsung dari game/config.ts:
     *
     * DungeonScene
     * BaseScene
     *
     * Jadi jangan override "scene"
     * lagi di sini.
     */

    gameRef.current =
      new Phaser.Game({
        ...gameConfig,

        parent:
          gameContainerRef.current,
      });

    return () => {
      if (
        gameRef.current
      ) {
        gameRef.current.destroy(
          true
        );

        gameRef.current =
          null;
      }
    };
  }, []);

  return (
    <div
      ref={
        gameContainerRef
      }
      style={{
        width:
          "100%",

        height:
          "100%",

        minHeight:
          "400px",

        overflow:
          "hidden",

        background:
          "#0b1116",
      }}
    />
  );
}
