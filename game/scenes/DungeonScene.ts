import Phaser from "phaser";

export default class DungeonScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  private readonly playerSpeed = 240;

  constructor() {
    super("DungeonScene");
  }

  create() {
    this.createDungeon();

    const playerTexture = this.add.graphics();

    playerTexture.fillStyle(0xd9a84e, 1);
    playerTexture.fillCircle(16, 16, 14);

    playerTexture.lineStyle(3, 0xf5dfaa, 1);
    playerTexture.strokeCircle(16, 16, 14);

    playerTexture.generateTexture("player", 32, 32);
    playerTexture.destroy();

    this.player = this.physics.add.sprite(640, 360, "player");

    this.player.setCollideWorldBounds(true);

    this.player.body?.setSize(28, 28);

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.wasd = this.input.keyboard!.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
    }) as typeof this.wasd;

    this.add
      .text(24, 24, "REALM QUEST", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#d9a84e",
        fontStyle: "bold",
      })
      .setScrollFactor(0);

    this.add
      .text(24, 58, "Move: WASD / Arrow Keys", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#9aa6ad",
      })
      .setScrollFactor(0);
  }

  update() {
    if (!this.player) {
      return;
    }

    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      velocityX = -1;
    }

    if (this.cursors.right.isDown || this.wasd.D.isDown) {
      velocityX = 1;
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      velocityY = -1;
    }

    if (this.cursors.down.isDown || this.wasd.S.isDown) {
      velocityY = 1;
    }

    const direction = new Phaser.Math.Vector2(velocityX, velocityY);

    if (direction.length() > 0) {
      direction.normalize();

      this.player.setVelocity(
        direction.x * this.playerSpeed,
        direction.y * this.playerSpeed
      );
    } else {
      this.player.setVelocity(0, 0);
    }
  }

  private createDungeon() {
    const graphics = this.add.graphics();

    graphics.fillStyle(0x0b1014, 1);
    graphics.fillRect(0, 0, 1280, 720);

    const tileSize = 64;

    for (let y = 0; y < 720; y += tileSize) {
      for (let x = 0; x < 1280; x += tileSize) {
        const alternateTile =
          (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0;

        graphics.fillStyle(
          alternateTile ? 0x172127 : 0x131c21,
          1
        );

        graphics.fillRect(
          x + 2,
          y + 2,
          tileSize - 4,
          tileSize - 4
        );
      }
    }

    graphics.lineStyle(8, 0x394249, 1);

    graphics.strokeRect(
      4,
      4,
      1272,
      712
    );

    this.createDecoration();
  }

  private createDecoration() {
    const decorations = [
      { x: 220, y: 180 },
      { x: 1000, y: 160 },
      { x: 300, y: 560 },
      { x: 960, y: 520 },
    ];

    decorations.forEach(({ x, y }) => {
      const glow = this.add.circle(
        x,
        y,
        45,
        0xd98432,
        0.08
      );

      this.add.circle(
        x,
        y,
        8,
        0xffa640,
        1
      );

      this.tweens.add({
        targets: glow,
        alpha: {
          from: 0.04,
          to: 0.16,
        },
        scale: {
          from: 0.8,
          to: 1.2,
        },
        duration: 900,
        yoyo: true,
        repeat: -1,
      });
    });
  }
}
