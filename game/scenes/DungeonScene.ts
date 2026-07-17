import * as Phaser from "phaser";

export default class DungeonScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private walls!: Phaser.Physics.Arcade.StaticGroup;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  private readonly playerSpeed = 260;
  private readonly worldWidth = 2400;
  private readonly worldHeight = 1600;

  constructor() {
    super("DungeonScene");
  }

  create() {
    this.physics.world.setBounds(
      0,
      0,
      this.worldWidth,
      this.worldHeight
    );

    this.cameras.main.setBounds(
      0,
      0,
      this.worldWidth,
      this.worldHeight
    );

    this.createTextures();
    this.createDungeon();
    this.createPlayer();
    this.createControls();
    this.createCamera();
    this.createUI();
  }

  update() {
    this.handlePlayerMovement();
  }

  private createTextures() {
    /*
     * PLAYER TEXTURE
     */

    if (!this.textures.exists("player")) {
      const playerGraphics = this.add.graphics();

      playerGraphics.fillStyle(
        0xd9a84e,
        1
      );

      playerGraphics.fillCircle(
        18,
        18,
        15
      );

      playerGraphics.lineStyle(
        3,
        0xf5dfaa,
        1
      );

      playerGraphics.strokeCircle(
        18,
        18,
        15
      );

      playerGraphics.generateTexture(
        "player",
        36,
        36
      );

      playerGraphics.destroy();
    }

    /*
     * WALL TEXTURE
     */

    if (!this.textures.exists("wall")) {
      const wallGraphics = this.add.graphics();

      wallGraphics.fillStyle(
        0x242e34,
        1
      );

      wallGraphics.fillRect(
        0,
        0,
        64,
        64
      );

      wallGraphics.fillStyle(
        0x313d44,
        1
      );

      wallGraphics.fillRect(
        4,
        4,
        56,
        12
      );

      wallGraphics.lineStyle(
        2,
        0x11181c,
        1
      );

      wallGraphics.strokeRect(
        1,
        1,
        62,
        62
      );

      wallGraphics.generateTexture(
        "wall",
        64,
        64
      );

      wallGraphics.destroy();
    }
  }

  private createDungeon() {
    this.createFloor();

    this.walls =
      this.physics.add.staticGroup();

    /*
     * OUTER WALLS
     */

    for (
      let x = 32;
      x < this.worldWidth;
      x += 64
    ) {
      this.createWall(
        x,
        32
      );

      this.createWall(
        x,
        this.worldHeight - 32
      );
    }

    for (
      let y = 96;
      y < this.worldHeight - 64;
      y += 64
    ) {
      this.createWall(
        32,
        y
      );

      this.createWall(
        this.worldWidth - 32,
        y
      );
    }

    /*
     * INTERNAL WALLS
     */

    this.createHorizontalWall(
      350,
      450,
      9
    );

    this.createHorizontalWall(
      1150,
      450,
      10
    );

    this.createHorizontalWall(
      500,
      1050,
      8
    );

    this.createHorizontalWall(
      1400,
      1100,
      9
    );

    this.createVerticalWall(
      600,
      250,
      5
    );

    this.createVerticalWall(
      1100,
      650,
      7
    );

    this.createVerticalWall(
      1800,
      300,
      6
    );

    this.createVerticalWall(
      700,
      1150,
      5
    );

    /*
     * TORCHES
     */

    this.createTorch(
      420,
      350
    );

    this.createTorch(
      900,
      700
    );

    this.createTorch(
      1500,
      600
    );

    this.createTorch(
      2000,
      1000
    );

    this.createTorch(
      1250,
      1350
    );
  }

  private createFloor() {
    const graphics =
      this.add.graphics();

    graphics.fillStyle(
      0x0b1014,
      1
    );

    graphics.fillRect(
      0,
      0,
      this.worldWidth,
      this.worldHeight
    );

    const tileSize = 64;

    for (
      let y = 0;
      y < this.worldHeight;
      y += tileSize
    ) {
      for (
        let x = 0;
        x < this.worldWidth;
        x += tileSize
      ) {
        const column =
          Math.floor(
            x / tileSize
          );

        const row =
          Math.floor(
            y / tileSize
          );

        const alternateTile =
          (column + row) % 2 === 0;

        graphics.fillStyle(
          alternateTile
            ? 0x172127
            : 0x131c21,
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
  }

  private createWall(
    x: number,
    y: number
  ) {
    this.walls.create(
      x,
      y,
      "wall"
    );
  }

  private createHorizontalWall(
    startX: number,
    y: number,
    amount: number
  ) {
    for (
      let i = 0;
      i < amount;
      i++
    ) {
      this.createWall(
        startX + i * 64,
        y
      );
    }
  }

  private createVerticalWall(
    x: number,
    startY: number,
    amount: number
  ) {
    for (
      let i = 0;
      i < amount;
      i++
    ) {
      this.createWall(
        x,
        startY + i * 64
      );
    }
  }

  private createTorch(
    x: number,
    y: number
  ) {
    const glow =
      this.add.circle(
        x,
        y,
        80,
        0xd98432,
        0.08
      );

    const fire =
      this.add.circle(
        x,
        y,
        10,
        0xffa640,
        1
      );

    this.tweens.add({
      targets: glow,

      alpha: {
        from: 0.04,
        to: 0.18,
      },

      scale: {
        from: 0.8,
        to: 1.2,
      },

      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    this.tweens.add({
      targets: fire,

      scale: {
        from: 0.8,
        to: 1.15,
      },

      duration: 400,
      yoyo: true,
      repeat: -1,
    });
  }

  private createPlayer() {
    this.player =
      this.physics.add.sprite(
        250,
        250,
        "player"
      );

    this.player.setCollideWorldBounds(
      true
    );

    this.player.setDepth(
      10
    );

    this.player.body.setSize(
      28,
      28
    );

    this.physics.add.collider(
      this.player,
      this.walls
    );
  }

  private createControls() {
    if (!this.input.keyboard) {
      return;
    }

    this.cursors =
      this.input.keyboard
        .createCursorKeys();

    this.wasd =
      this.input.keyboard.addKeys({
        W:
          Phaser.Input.Keyboard
            .KeyCodes.W,

        A:
          Phaser.Input.Keyboard
            .KeyCodes.A,

        S:
          Phaser.Input.Keyboard
            .KeyCodes.S,

        D:
          Phaser.Input.Keyboard
            .KeyCodes.D,
      }) as typeof this.wasd;
  }

  private createCamera() {
    this.cameras.main.startFollow(
      this.player,
      true,
      0.08,
      0.08
    );

    this.cameras.main.setZoom(
      1
    );

    this.cameras.main.setBackgroundColor(
      "#080c0f"
    );
  }

  private createUI() {
    this.add
      .text(
        24,
        24,
        "REALM QUEST",
        {
          fontFamily: "Arial",
          fontSize: "24px",
          color: "#d9a84e",
          fontStyle: "bold",
        }
      )
      .setScrollFactor(0)
      .setDepth(100);

    this.add
      .text(
        24,
        58,
        "Explore the dungeon",
        {
          fontFamily: "Arial",
          fontSize: "14px",
          color: "#9aa6ad",
        }
      )
      .setScrollFactor(0)
      .setDepth(100);
  }

  private handlePlayerMovement() {
    if (
      !this.player ||
      !this.cursors ||
      !this.wasd
    ) {
      return;
    }

    let velocityX = 0;
    let velocityY = 0;

    if (
      this.cursors.left.isDown ||
      this.wasd.A.isDown
    ) {
      velocityX = -1;
    }

    if (
      this.cursors.right.isDown ||
      this.wasd.D.isDown
    ) {
      velocityX = 1;
    }

    if (
      this.cursors.up.isDown ||
      this.wasd.W.isDown
    ) {
      velocityY = -1;
    }

    if (
      this.cursors.down.isDown ||
      this.wasd.S.isDown
    ) {
      velocityY = 1;
    }

    const direction =
      new Phaser.Math.Vector2(
        velocityX,
        velocityY
      );

    if (
      direction.length() > 0
    ) {
      direction.normalize();

      this.player.setVelocity(
        direction.x *
          this.playerSpeed,

        direction.y *
          this.playerSpeed
      );
    } else {
      this.player.setVelocity(
        0,
        0
      );
    }
  }
}
