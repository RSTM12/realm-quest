import * as Phaser from "phaser";
import GridPathfinder, {
  GridPoint,
} from "@/game/pathfinding/GridPathfinder";

type EnemySprite =
  Phaser.Physics.Arcade.Sprite & {
    pathData?: GridPoint[];
    pathIndex?: number;
    nextPathUpdate?: number;
  };

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
  private readonly enemySpeed = 110;

  private readonly tileSize = 64;

  private readonly worldWidth = 2432;
  private readonly worldHeight = 1600;

  private readonly columns =
    this.worldWidth / this.tileSize;

  private readonly rows =
    this.worldHeight / this.tileSize;

  private navigationGrid: boolean[][] = [];

  private pathfinder!: GridPathfinder;

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

    this.createNavigationGrid();

    this.createTextures();

    this.createDungeon();

    this.pathfinder =
      new GridPathfinder(
        this.navigationGrid
      );

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

    this.physics.add.overlap(
      this.player,
      this.enemies,
      (
        _playerObject,
        enemyObject
      ) => {
        const enemy =
          enemyObject as Phaser.Physics.Arcade.Sprite;

        this.damagePlayer(
          enemy
        );
      }
    );
  }

  update(time: number) {
    this.handlePlayerMovement();

    this.updateEnemies(
      time
    );

    if (
      this.attackKey &&
      Phaser.Input.Keyboard.JustDown(
        this.attackKey
      )
    ) {
      this.playerAttack(
        time
      );
    }
  }

  /*
   * =========================================
   * NAVIGATION GRID
   * =========================================
   */

  private createNavigationGrid() {
    this.navigationGrid =
      Array.from(
        {
          length:
            this.rows,
        },
        () =>
          Array.from(
            {
              length:
                this.columns,
            },
            () => true
          )
      );

    /*
     * Batas map.
     */

    for (
      let col = 0;
      col < this.columns;
      col++
    ) {
      this.blockTile(
        col,
        0
      );

      this.blockTile(
        col,
        this.rows - 1
      );
    }

    for (
      let row = 0;
      row < this.rows;
      row++
    ) {
      this.blockTile(
        0,
        row
      );

      this.blockTile(
        this.columns - 1,
        row
      );
    }
  }

  private blockTile(
    col: number,
    row: number
  ) {
    if (
      row < 0 ||
      row >= this.rows ||
      col < 0 ||
      col >= this.columns
    ) {
      return;
    }

    this.navigationGrid[
      row
    ][col] = false;
  }

  private worldToGrid(
    x: number,
    y: number
  ): GridPoint {
    return {
      col:
        Phaser.Math.Clamp(
          Math.floor(
            x /
              this.tileSize
          ),
          0,
          this.columns - 1
        ),

      row:
        Phaser.Math.Clamp(
          Math.floor(
            y /
              this.tileSize
          ),
          0,
          this.rows - 1
        ),
    };
  }

  private gridToWorld(
    point: GridPoint
  ) {
    return {
      x:
        point.col *
          this.tileSize +
        this.tileSize /
          2,

      y:
        point.row *
          this.tileSize +
        this.tileSize /
          2,
    };
  }

  /*
   * =========================================
   * TEXTURES
   * =========================================
   */

  private createTextures() {
    if (
      !this.textures.exists(
        "player"
      )
    ) {
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

    if (
      !this.textures.exists(
        "wall"
      )
    ) {
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

    if (
      !this.textures.exists(
        "enemy"
      )
    ) {
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

  /*
   * =========================================
   * DUNGEON
   * =========================================
   */

  private createDungeon() {
    this.createFloor();

    this.walls =
      this.physics.add.staticGroup();

    /*
     * OUTER WALLS
     */

    for (
      let col = 0;
      col < this.columns;
      col++
    ) {
      this.createWallTile(
        col,
        0
      );

      this.createWallTile(
        col,
        this.rows - 1
      );
    }

    for (
      let row = 1;
      row <
      this.rows - 1;
      row++
    ) {
      this.createWallTile(
        0,
        row
      );

      this.createWallTile(
        this.columns - 1,
        row
      );
    }

    /*
     * INTERNAL WALLS
     *
     * Sekarang semua tembok dibuat
     * berdasarkan grid supaya visual,
     * collision, dan pathfinding sinkron.
     */

    this.createHorizontalWall(
      6,
      7,
      8
    );

    this.createHorizontalWall(
      18,
      7,
      10
    );

    this.createHorizontalWall(
      8,
      16,
      8
    );

    this.createHorizontalWall(
      22,
      17,
      9
    );

    this.createVerticalWall(
      9,
      4,
      5
    );

    this.createVerticalWall(
      17,
      10,
      7
    );

    this.createVerticalWall(
      28,
      4,
      6
    );

    this.createVerticalWall(
      11,
      18,
      5
    );

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

    for (
      let row = 0;
      row < this.rows;
      row++
    ) {
      for (
        let col = 0;
        col <
        this.columns;
        col++
      ) {
        const alternate =
          (
            col +
            row
          ) %
            2 ===
          0;

        graphics.fillStyle(
          alternate
            ? 0x172127
            : 0x131c21,
          1
        );

        graphics.fillRect(
          col *
            this.tileSize +
            2,

          row *
            this.tileSize +
            2,

          this.tileSize -
            4,

          this.tileSize -
            4
        );
      }
    }
  }

  private createWallTile(
    col: number,
    row: number
  ) {
    const x =
      col *
        this.tileSize +
      this.tileSize /
        2;

    const y =
      row *
        this.tileSize +
      this.tileSize /
        2;

    this.walls.create(
      x,
      y,
      "wall"
    );

    this.blockTile(
      col,
      row
    );
  }

  private createHorizontalWall(
    startCol: number,
    row: number,
    amount: number
  ) {
    for (
      let i = 0;
      i < amount;
      i++
    ) {
      this.createWallTile(
        startCol +
          i,
        row
      );
    }
  }

  private createVerticalWall(
    col: number,
    startRow: number,
    amount: number
  ) {
    for (
      let i = 0;
      i < amount;
      i++
    ) {
      this.createWallTile(
        col,
        startRow +
          i
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
      targets:
        glow,

      alpha: {
        from:
          0.04,

        to:
          0.18,
      },

      scale: {
        from:
          0.8,

        to:
          1.2,
      },

      duration:
        800,

      yoyo:
        true,

      repeat:
        -1,
    });

    this.tweens.add({
      targets:
        fire,

      scale: {
        from:
          0.8,

        to:
          1.15,
      },

      duration:
        400,

      yoyo:
        true,

      repeat:
        -1,
    });
  }

  /*
   * =========================================
   * PLAYER
   * =========================================
   */

  private createPlayer() {
    this.player =
      this.physics.add.sprite(
        224,
        224,
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

  /*
   * =========================================
   * ENEMIES
   * =========================================
   */

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
      (
        position,
        index
      ) => {
        const enemy =
          this.enemies.create(
            position.x,
            position.y,
            "enemy"
          ) as EnemySprite;

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

        enemy.pathData =
          [];

        enemy.pathIndex =
          0;

        /*
         * Bikin waktu update path berbeda
         * supaya semua monster tidak
         * menghitung A* di frame yang sama.
         */

        enemy.nextPathUpdate =
          index * 80;
      }
    );
  }

  private updateEnemies(
    time: number
  ) {
    if (
      !this.enemies ||
      !this.player ||
      !this.pathfinder
    ) {
      return;
    }

    this.enemies.children.each(
      (child) => {
        const enemy =
          child as EnemySprite;

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

        /*
         * Di luar aggro range:
         * monster diam.
         */

        if (
          distance >
          700
        ) {
          enemy.setVelocity(
            0,
            0
          );

          enemy.pathData =
            [];

          enemy.pathIndex =
            0;

          return true;
        }

        /*
         * Hitung ulang path setiap
         * kurang lebih 500ms.
         */

        if (
          time >=
          (
            enemy.nextPathUpdate ??
            0
          )
        ) {
          this.calculateEnemyPath(
            enemy
          );

          enemy.nextPathUpdate =
            time +
            450 +
            Phaser.Math.Between(
              0,
              120
            );
        }

        this.followEnemyPath(
          enemy
        );

        return true;
      }
    );
  }

  private calculateEnemyPath(
    enemy: EnemySprite
  ) {
    const start =
      this.worldToGrid(
        enemy.x,
        enemy.y
      );

    const target =
      this.worldToGrid(
        this.player.x,
        this.player.y
      );

    const path =
      this.pathfinder.findPath(
        start,
        target
      );

    enemy.pathData =
      path;

    enemy.pathIndex =
      0;
  }

  private followEnemyPath(
    enemy: EnemySprite
  ) {
    const path =
      enemy.pathData;

    if (
      !path ||
      path.length === 0
    ) {
      enemy.setVelocity(
        0,
        0
      );

      return;
    }

    const index =
      enemy.pathIndex ??
      0;

    if (
      index >=
      path.length
    ) {
      /*
       * Kalau waypoint terakhir sudah
       * tercapai dan player dekat,
       * kejar langsung.
       */

      const distance =
        Phaser.Math.Distance.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        );

      if (
        distance <
        100
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

      return;
    }

    const waypoint =
      this.gridToWorld(
        path[index]
      );

    const distanceToWaypoint =
      Phaser.Math.Distance.Between(
        enemy.x,
        enemy.y,
        waypoint.x,
        waypoint.y
      );

    /*
     * Sudah dekat pusat tile,
     * lanjut waypoint berikutnya.
     */

    if (
      distanceToWaypoint <
      12
    ) {
      enemy.pathIndex =
        index + 1;

      return;
    }

    this.physics.moveTo(
      enemy,
      waypoint.x,
      waypoint.y,
      this.enemySpeed
    );
  }

  /*
   * =========================================
   * CONTROLS
   * =========================================
   */

  private createControls() {
    const keyboard =
      this.input.keyboard;

    if (
      !keyboard
    ) {
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

  /*
   * =========================================
   * CAMERA + UI
   * =========================================
   */

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
      .setScrollFactor(
        0
      )
      .setDepth(
        100
      );

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
        .setScrollFactor(
          0
        )
        .setDepth(
          100
        );

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
        .setScrollFactor(
          0
        )
        .setDepth(
          100
        );

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
      .setScrollFactor(
        0
      )
      .setDepth(
        100
      );

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

  /*
   * =========================================
   * PLAYER MOVEMENT
   * =========================================
   */

  private handlePlayerMovement() {
    if (
      !this.player ||
      !this.cursors ||
      !this.wasd
    ) {
      return;
    }

    let velocityX =
      0;

    let velocityY =
      0;

    if (
      this.cursors.left.isDown ||
      this.wasd.A.isDown
    ) {
      velocityX =
        -1;
    }

    if (
      this.cursors.right.isDown ||
      this.wasd.D.isDown
    ) {
      velocityX =
        1;
    }

    if (
      this.cursors.up.isDown ||
      this.wasd.W.isDown
    ) {
      velocityY =
        -1;
    }

    if (
      this.cursors.down.isDown ||
      this.wasd.S.isDown
    ) {
      velocityY =
        1;
    }

    const direction =
      new Phaser.Math.Vector2(
        velocityX,
        velocityY
      );

    if (
      direction.length() >
      0
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

  /*
   * =========================================
   * DAMAGE
   * =========================================
   */

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

    this.playerHP -=
      10;

    if (
      this.playerHP <
      0
    ) {
      this.playerHP =
        0;
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
      knockback.length() >
      0
    ) {
      knockback
        .normalize()
        .scale(
          220
        );

      this.player.setVelocity(
        knockback.x,
        knockback.y
      );
    }

    this.updateUI();

    if (
      this.playerHP <=
      0
    ) {
      this.gameOver();
    }
  }

  /*
   * =========================================
   * ATTACK
   * =========================================
   */

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
          child as EnemySprite;

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
          distance <=
          85
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
    enemy: EnemySprite
  ) {
    const currentHP =
      enemy.getData(
        "hp"
      ) as number;

    const newHP =
      currentHP -
      1;

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

    if (
      newHP <=
      0
    ) {
      this.killEnemy(
        enemy
      );
    }
  }

  private killEnemy(
    enemy: EnemySprite
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

  /*
   * =========================================
   * GAME OVER
   * =========================================
   */

  private gameOver() {
    this.physics.pause();

    this.player.setTint(
      0x555555
    );

    const camera =
      this.cameras.main;

    this.add
      .text(
        camera.width /
          2,

        camera.height /
          2,

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
