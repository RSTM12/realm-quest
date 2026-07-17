import * as Phaser from "phaser";

export default class DungeonScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  private attackKey!: Phaser.Input.Keyboard.Key;

  private hpText!: Phaser.GameObjects.Text;
  private enemyText!: Phaser.GameObjects.Text;

  private playerHP = 100;

  private readonly maxPlayerHP = 100;
  private readonly playerSpeed = 260;
  private readonly enemySpeed = 100;

  private readonly worldWidth = 2400;
  private readonly worldHeight = 1600;

  private lastDamageTime = 0;
  private readonly damageCooldown = 800;

  private lastAttackTime = 0;
  private readonly attackCooldown = 400;

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
    this.createEnemies();
    this.createControls();
    this.createCamera();
    this.createUI();

    this.physics.add.collider(
      this.enemies,
      this.walls
    );

    this.physics.add.collider(
      this.enemies,
      this.enemies
    );

    /*
     * Pakai callback langsung supaya TypeScript
     * mengikuti tipe callback bawaan Phaser.
     */

    this.physics.add.overlap(
      this.player,
      this.enemies,
      (_playerObject, enemyObject) => {
        const enemy =
          enemyObject as Phaser.Physics.Arcade.Sprite;

        this.damagePlayer(enemy);
      }
    );
  }

  update(time: number) {
    this.handlePlayerMovement();
    this.updateEnemies();

    if (
      this.attackKey &&
      Phaser.Input.Keyboard.JustDown(
        this.attackKey
      )
    ) {
      this.playerAttack(time);
    }
  }

  private createTextures() {
    /*
     * PLAYER
     */

    if (!this.textures.exists("player")) {
      const graphics =
        this.add.graphics();

      graphics.fillStyle(
        0xd9a84e,
        1
      );

      graphics.fillCircle(
        18,
        18,
        15
      );

      graphics.lineStyle(
        3,
        0xf5dfaa,
        1
      );

      graphics.strokeCircle(
        18,
        18,
        15
      );

      graphics.generateTexture(
        "player",
        36,
        36
      );

      graphics.destroy();
    }

    /*
     * WALL
     */

    if (!this.textures.exists("wall")) {
      const graphics =
        this.add.graphics();

      graphics.fillStyle(
        0x242e34,
        1
      );

      graphics.fillRect(
        0,
        0,
        64,
        64
      );

      graphics.fillStyle(
        0x313d44,
        1
      );

      graphics.fillRect(
        4,
        4,
        56,
        12
      );

      graphics.lineStyle(
        2,
        0x11181c,
        1
      );

      graphics.strokeRect(
        1,
        1,
        62,
        62
      );

      graphics.generateTexture(
        "wall",
        64,
        64
      );

      graphics.destroy();
    }

    /*
     * ENEMY
     */

    if (!this.textures.exists("enemy")) {
      const graphics =
        this.add.graphics();

      graphics.fillStyle(
        0x8f263d,
        1
      );

      graphics.fillCircle(
        18,
        18,
        16
      );

      graphics.lineStyle(
        3,
        0xe85d75,
        1
      );

      graphics.strokeCircle(
        18,
        18,
        16
      );

      /*
       * EYES
       */

      graphics.fillStyle(
        0xffffff,
        1
      );

      graphics.fillCircle(
        12,
        15,
        3
      );

      graphics.fillCircle(
        24,
        15,
        3
      );

      graphics.fillStyle(
        0x111111,
        1
      );

      graphics.fillCircle(
        12,
        15,
        1
      );

      graphics.fillCircle(
        24,
        15,
        1
      );

      graphics.generateTexture(
        "enemy",
        36,
        36
      );

      graphics.destroy();
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

    this.player.setBodySize(
      28,
      28
    );

    this.physics.add.collider(
      this.player,
      this.walls
    );
  }

  private createEnemies() {
    this.enemies =
      this.physics.add.group();

    const enemyPositions = [
      {
        x: 800,
        y: 250,
      },

      {
        x: 950,
        y: 800,
      },

      {
        x: 1450,
        y: 700,
      },

      {
        x: 2000,
        y: 400,
      },

      {
        x: 1900,
        y: 1300,
      },

      {
        x: 1000,
        y: 1350,
      },
    ];

    enemyPositions.forEach(
      (position) => {
        const enemy =
          this.enemies.create(
            position.x,
            position.y,
            "enemy"
          ) as Phaser.Physics.Arcade.Sprite;

        enemy.setCollideWorldBounds(
          true
        );

        enemy.setBodySize(
          30,
          30
        );

        enemy.setData(
          "hp",
          3
        );

        enemy.setDepth(
          9
        );
      }
    );
  }

  private createControls() {
    const keyboard =
      this.input.keyboard;

    if (!keyboard) {
      return;
    }

    this.cursors =
      keyboard.createCursorKeys();

    this.wasd =
      keyboard.addKeys({
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

    this.attackKey =
      keyboard.addKey(
        Phaser.Input.Keyboard
          .KeyCodes.SPACE
      );
  }

  private createCamera() {
    this.cameras.main.startFollow(
      this.player,
      true,
      0.08,
      0.08
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
          fontFamily:
            "Arial",

          fontSize:
            "24px",

          color:
            "#d9a84e",

          fontStyle:
            "bold",
        }
      )
      .setScrollFactor(0)
      .setDepth(100);

    this.hpText =
      this.add
        .text(
          24,
          60,
          "",
          {
            fontFamily:
              "Arial",

            fontSize:
              "18px",

            color:
              "#ff6677",

            fontStyle:
              "bold",
          }
        )
        .setScrollFactor(0)
        .setDepth(100);

    this.enemyText =
      this.add
        .text(
          24,
          88,
          "",
          {
            fontFamily:
              "Arial",

            fontSize:
              "14px",

            color:
              "#d0d6da",
          }
        )
        .setScrollFactor(0)
        .setDepth(100);

    this.add
      .text(
        24,
        116,
        "WASD: Move | SPACE: Attack",
        {
          fontFamily:
            "Arial",

          fontSize:
            "13px",

          color:
            "#89959c",
        }
      )
      .setScrollFactor(0)
      .setDepth(100);

    this.updateUI();
  }

  private updateUI() {
    if (
      this.hpText
    ) {
      this.hpText.setText(
        `HP: ${this.playerHP} / ${this.maxPlayerHP}`
      );
    }

    if (
      this.enemyText &&
      this.enemies
    ) {
      this.enemyText.setText(
        `Enemies: ${this.enemies.countActive(
          true
        )}`
      );
    }
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

  private updateEnemies() {
    if (
      !this.enemies ||
      !this.player
    ) {
      return;
    }

    this.enemies.children.each(
      (child) => {
        const enemy =
          child as Phaser.Physics.Arcade.Sprite;

        if (
          !enemy.active
        ) {
          return true;
        }

        const distance =
          Phaser.Math.Distance.Between(
            enemy.x,
            enemy.y,
            this.player.x,
            this.player.y
          );

        if (
          distance < 500
        ) {
          this.physics.moveToObject(
            enemy,
            this.player,
            this.enemySpeed
          );
        } else {
          enemy.setVelocity(
            0,
            0
          );
        }

        return true;
      }
    );
  }

  private damagePlayer(
    enemy:
      Phaser.Physics.Arcade.Sprite
  ) {
    const currentTime =
      this.time.now;

    if (
      currentTime -
        this.lastDamageTime <
      this.damageCooldown
    ) {
      return;
    }

    this.lastDamageTime =
      currentTime;

    this.playerHP -= 10;

    if (
      this.playerHP < 0
    ) {
      this.playerHP = 0;
    }

    this.player.setTint(
      0xff0000
    );

    this.time.delayedCall(
      150,
      () => {
        if (
          this.player.active
        ) {
          this.player.clearTint();
        }
      }
    );

    const knockback =
      new Phaser.Math.Vector2(
        this.player.x -
          enemy.x,

        this.player.y -
          enemy.y
      );

    if (
      knockback.length() > 0
    ) {
      knockback
        .normalize()
        .scale(220);

      this.player.setVelocity(
        knockback.x,
        knockback.y
      );
    }

    this.updateUI();

    if (
      this.playerHP <= 0
    ) {
      this.gameOver();
    }
  }

  private playerAttack(
    time: number
  ) {
    if (
      time -
        this.lastAttackTime <
      this.attackCooldown
    ) {
      return;
    }

    this.lastAttackTime =
      time;

    const attackEffect =
      this.add.circle(
        this.player.x,
        this.player.y,
        70,
        0xd9a84e,
        0.18
      );

    attackEffect.setDepth(
      8
    );

    attackEffect.setStrokeStyle(
      4,
      0xf5dfaa,
      0.8
    );

    this.tweens.add({
      targets:
        attackEffect,

      scale:
        1.35,

      alpha:
        0,

      duration:
        180,

      onComplete:
        () => {
          attackEffect.destroy();
        },
    });

    this.enemies.children.each(
      (child) => {
        const enemy =
          child as Phaser.Physics.Arcade.Sprite;

        if (
          !enemy.active
        ) {
          return true;
        }

        const distance =
          Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            enemy.x,
            enemy.y
          );

        if (
          distance <= 85
        ) {
          this.damageEnemy(
            enemy
          );
        }

        return true;
      }
    );
  }

  private damageEnemy(
    enemy:
      Phaser.Physics.Arcade.Sprite
  ) {
    const currentHP =
      enemy.getData(
        "hp"
      ) as number;

    const newHP =
      currentHP - 1;

    enemy.setData(
      "hp",
      newHP
    );

    enemy.setTint(
      0xffffff
    );

    this.time.delayedCall(
      100,
      () => {
        if (
          enemy.active
        ) {
          enemy.clearTint();
        }
      }
    );

    const knockback =
      new Phaser.Math.Vector2(
        enemy.x -
          this.player.x,

        enemy.y -
          this.player.y
      );

    if (
      knockback.length() > 0
    ) {
      knockback
        .normalize()
        .scale(250);

      enemy.setVelocity(
        knockback.x,
        knockback.y
      );
    }

    if (
      newHP <= 0
    ) {
      this.killEnemy(
        enemy
      );
    }
  }

  private killEnemy(
    enemy:
      Phaser.Physics.Arcade.Sprite
  ) {
    const deathEffect =
      this.add.circle(
        enemy.x,
        enemy.y,
        20,
        0xe85d75,
        0.8
      );

    deathEffect.setDepth(
      20
    );

    this.tweens.add({
      targets:
        deathEffect,

      scale:
        2,

      alpha:
        0,

      duration:
        300,

      onComplete:
        () => {
          deathEffect.destroy();
        },
    });

    enemy.destroy();

    this.updateUI();
  }

  private gameOver() {
    this.physics.pause();

    this.player.setTint(
      0x555555
    );

    const camera =
      this.cameras.main;

    this.add
      .text(
        camera.width / 2,
        camera.height / 2,
        "YOU DIED",
        {
          fontFamily:
            "Arial",

          fontSize:
            "64px",

          color:
            "#e85d75",

          fontStyle:
            "bold",

          stroke:
            "#000000",

          strokeThickness:
            8,
        }
      )
      .setOrigin(
        0.5
      )
      .setScrollFactor(
        0
      )
      .setDepth(
        1000
      );
  }
}
