import * as Phaser from "phaser";

import BaseScene from "@/game/scenes/BaseScene";
import DungeonScene from "@/game/scenes/DungeonScene";

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,

  width: 1600,
  height: 900,

  backgroundColor: "#080c0f",

  parent: "game-container",

  physics: {
    default: "arcade",

    arcade: {
      gravity: {
        x: 0,
        y: 0,
      },

      debug: false,
    },
  },

  scale: {
    mode: Phaser.Scale.FIT,

    autoCenter:
      Phaser.Scale.CENTER_BOTH,

    width: 1600,
    height: 900,
  },

  scene: [
    DungeonScene,
    BaseScene,
  ],
};

export default gameConfig;
