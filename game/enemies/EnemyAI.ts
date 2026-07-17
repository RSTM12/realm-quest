import * as Phaser from "phaser";
import GridPathfinder, {
  GridPoint,
} from "@/game/pathfinding/GridPathfinder";

export type EnemyState =
  | "idle"
  | "chasing"
  | "returning";

export type EnemySprite =
  Phaser.Physics.Arcade.Sprite & {
    pathData?: GridPoint[];
    pathIndex?: number;
    nextPathUpdate?: number;

    spawnX?: number;
    spawnY?: number;

    enemyState?: EnemyState;
  };

type EnemyAIConfig = {
  scene: Phaser.Scene;

  enemy: EnemySprite;

  player: Phaser.Physics.Arcade.Sprite;

  pathfinder: GridPathfinder;

  worldToGrid: (
    x: number,
    y: number
  ) => GridPoint;

  gridToWorld: (
    point: GridPoint
  ) => {
    x: number;
    y: number;
  };

  speed?: number;

  aggroRadius?: number;

  leashRadius?: number;

  returnDistance?: number;

  pathUpdateInterval?: number;
};

export default class EnemyAI {
  private readonly scene: Phaser.Scene;

  private readonly enemy: EnemySprite;

  private readonly player:
    Phaser.Physics.Arcade.Sprite;

  private readonly pathfinder:
    GridPathfinder;

  private readonly worldToGrid:
    (
      x: number,
      y: number
    ) => GridPoint;

  private readonly gridToWorld:
    (
      point: GridPoint
    ) => {
      x: number;
      y: number;
    };

  private readonly speed: number;

  /*
   * Player harus sedekat ini
   * supaya monster mulai mengejar.
   */

  private readonly aggroRadius:
    number;

  /*
   * Kalau monster sudah mengejar,
   * player tidak boleh menarik monster
   * lebih jauh dari jarak ini
   * terhadap titik spawn monster.
   */

  private readonly leashRadius:
    number;

  /*
   * Monster dianggap sudah sampai rumah
   * kalau jaraknya dari spawn
   * sudah lebih kecil dari nilai ini.
   */

  private readonly returnDistance:
    number;

  private readonly pathUpdateInterval:
    number;

  constructor(
    config: EnemyAIConfig
  ) {
    this.scene =
      config.scene;

    this.enemy =
      config.enemy;

    this.player =
      config.player;

    this.pathfinder =
      config.pathfinder;

    this.worldToGrid =
      config.worldToGrid;

    this.gridToWorld =
      config.gridToWorld;

    this.speed =
      config.speed ??
      105;

    /*
     * Default:
     *
     * 280 px = baru aggro kalau dekat.
     */

    this.aggroRadius =
      config.aggroRadius ??
      280;

    /*
     * Maksimal monster boleh ditarik
     * 450 px dari tempat spawn.
     */

    this.leashRadius =
      config.leashRadius ??
      450;

    this.returnDistance =
      config.returnDistance ??
      20;

    this.pathUpdateInterval =
      config.pathUpdateInterval ??
      500;

    /*
     * Simpan posisi awal monster.
     */

    this.enemy.spawnX =
      this.enemy.x;

    this.enemy.spawnY =
      this.enemy.y;

    this.enemy.enemyState =
      "idle";

    this.enemy.pathData =
      [];

    this.enemy.pathIndex =
      0;

    this.enemy.nextPathUpdate =
      0;
  }

  public update(
    time: number
  ) {
    if (
      !this.enemy.active ||
      !this.player.active
    ) {
      return;
    }

    const state =
      this.enemy.enemyState ??
      "idle";

    switch (
      state
    ) {
      case "idle":
        this.updateIdle(
          time
        );

        break;

      case "chasing":
        this.updateChasing(
          time
        );

        break;

      case "returning":
        this.updateReturning(
          time
        );

        break;
    }
  }

  /*
   * =====================================
   * IDLE
   * =====================================
   */

  private updateIdle(
    time: number
  ) {
    this.enemy.setVelocity(
      0,
      0
    );

    const distanceToPlayer =
      Phaser.Math.Distance.Between(
        this.enemy.x,
        this.enemy.y,
        this.player.x,
        this.player.y
      );

    /*
     * Player masih jauh.
     * Monster santai.
     */

    if (
      distanceToPlayer >
      this.aggroRadius
    ) {
      return;
    }

    /*
     * Player masuk radius.
     * Mulai ngejar.
     */

    this.enemy.enemyState =
      "chasing";

    this.enemy.nextPathUpdate =
      time;

    this.clearPath();
  }

  /*
   * =====================================
   * CHASING
   * =====================================
   */

  private updateChasing(
    time: number
  ) {
    const spawnX =
      this.enemy.spawnX ??
      this.enemy.x;

    const spawnY =
      this.enemy.spawnY ??
      this.enemy.y;

    /*
     * Ukur posisi player terhadap
     * tempat spawn monster.
     *
     * Jadi player tidak bisa menarik
     * monster keliling seluruh dungeon.
     */

    const playerDistanceFromSpawn =
      Phaser.Math.Distance.Between(
        spawnX,
        spawnY,
        this.player.x,
        this.player.y
      );

    /*
     * Player sudah kabur terlalu jauh.
     *
     * Monster berhenti ngejar
     * dan langsung pulang.
     */

    if (
      playerDistanceFromSpawn >
      this.leashRadius
    ) {
      this.enemy.enemyState =
        "returning";

      this.enemy.nextPathUpdate =
        time;

      this.clearPath();

      return;
    }

    /*
     * Update path ke player.
     */

    if (
      time >=
      (
        this.enemy
          .nextPathUpdate ??
        0
      )
    ) {
      this.calculatePath(
        this.player.x,
        this.player.y
      );

      this.enemy.nextPathUpdate =
        time +
        this.pathUpdateInterval +
        Phaser.Math.Between(
          0,
          100
        );
    }

    this.followPath();
  }

  /*
   * =====================================
   * RETURNING
   * =====================================
   */

  private updateReturning(
    time: number
  ) {
    const spawnX =
      this.enemy.spawnX ??
      this.enemy.x;

    const spawnY =
      this.enemy.spawnY ??
      this.enemy.y;

    const distanceToSpawn =
      Phaser.Math.Distance.Between(
        this.enemy.x,
        this.enemy.y,
        spawnX,
        spawnY
      );

    /*
     * Sudah sampai rumah.
     */

    if (
      distanceToSpawn <=
      this.returnDistance
    ) {
      this.enemy.setPosition(
        spawnX,
        spawnY
      );

      this.enemy.setVelocity(
        0,
        0
      );

      this.enemy.enemyState =
        "idle";

      this.clearPath();

      return;
    }

    /*
     * Saat pulang monster tidak peduli
     * player meskipun player mendekat.
     *
     * Harus pulang dulu sebelum
     * bisa aggro lagi.
     */

    if (
      time >=
      (
        this.enemy
          .nextPathUpdate ??
        0
      )
    ) {
      this.calculatePath(
        spawnX,
        spawnY
      );

      this.enemy.nextPathUpdate =
        time +
        this.pathUpdateInterval;
    }

    this.followPath();
  }

  /*
   * =====================================
   * PATHFINDING
   * =====================================
   */

  private calculatePath(
    targetX: number,
    targetY: number
  ) {
    const start =
      this.worldToGrid(
        this.enemy.x,
        this.enemy.y
      );

    const target =
      this.worldToGrid(
        targetX,
        targetY
      );

    this.enemy.pathData =
      this.pathfinder.findPath(
        start,
        target
      );

    this.enemy.pathIndex =
      0;
  }

  private followPath() {
    const path =
      this.enemy.pathData;

    if (
      !path ||
      path.length === 0
    ) {
      this.enemy.setVelocity(
        0,
        0
      );

      return;
    }

    const pathIndex =
      this.enemy.pathIndex ??
      0;

    if (
      pathIndex >=
      path.length
    ) {
      this.enemy.setVelocity(
        0,
        0
      );

      return;
    }

    const gridPoint =
      path[
        pathIndex
      ];

    const waypoint =
      this.gridToWorld(
        gridPoint
      );

    const distance =
      Phaser.Math.Distance.Between(
        this.enemy.x,
        this.enemy.y,
        waypoint.x,
        waypoint.y
      );

    /*
     * Sampai waypoint.
     * Lanjut tile berikutnya.
     */

    if (
      distance <
      12
    ) {
      this.enemy.pathIndex =
        pathIndex +
        1;

      return;
    }

    this.scene.physics.moveTo(
      this.enemy,
      waypoint.x,
      waypoint.y,
      this.speed
    );
  }

  private clearPath() {
    this.enemy.pathData =
      [];

    this.enemy.pathIndex =
      0;

    this.enemy.setVelocity(
      0,
      0
    );
  }

  /*
   * Bisa dipakai nanti untuk debug UI.
   */

  public getState():
    EnemyState {
    return (
      this.enemy.enemyState ??
      "idle"
    );
  }

  /*
   * Bisa dipakai kalau nanti ada skill
   * yang memaksa monster berhenti mengejar.
   */

  public forceReturn() {
    this.enemy.enemyState =
      "returning";

    this.enemy.nextPathUpdate =
      0;

    this.clearPath();
  }
}
