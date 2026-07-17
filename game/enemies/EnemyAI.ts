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

  private readonly worldToGrid: (
    x: number,
    y: number
  ) => GridPoint;

  private readonly gridToWorld: (
    point: GridPoint
  ) => {
    x: number;
    y: number;
  };

  private readonly speed: number;

  private readonly aggroRadius: number;

  private readonly leashRadius: number;

  private readonly returnDistance: number;

  private readonly pathUpdateInterval: number;

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

    this.aggroRadius =
      config.aggroRadius ??
      250;

    this.leashRadius =
      config.leashRadius ??
      420;

    /*
     * Kita bikin lebih longgar.
     * Jadi monster nggak perlu
     * tepat banget di titik spawn.
     */

    this.returnDistance =
      config.returnDistance ??
      48;

    this.pathUpdateInterval =
      config.pathUpdateInterval ??
      450;

    /*
     * Simpan titik rumah monster.
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

    if (
      state ===
      "idle"
    ) {
      this.updateIdle(
        time
      );

      return;
    }

    if (
      state ===
      "chasing"
    ) {
      this.updateChasing(
        time
      );

      return;
    }

    if (
      state ===
      "returning"
    ) {
      this.updateReturning(
        time
      );
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
     * Player belum cukup dekat.
     */

    if (
      distanceToPlayer >
      this.aggroRadius
    ) {
      return;
    }

    /*
     * Player masuk aggro radius.
     *
     * Monster boleh aktif lagi
     * walaupun sebelumnya sudah
     * pernah mengejar dan pulang.
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
     * Leash dihitung dari posisi
     * PLAYER terhadap rumah monster.
     */

    const playerDistanceFromSpawn =
      Phaser.Math.Distance.Between(
        spawnX,
        spawnY,
        this.player.x,
        this.player.y
      );

    /*
     * Player sudah terlalu jauh.
     * Monster pulang.
     */

    if (
      playerDistanceFromSpawn >
      this.leashRadius
    ) {
      this.startReturning(
        time
      );

      return;
    }

    /*
     * Update jalur menuju player.
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
     * FIX UTAMA:
     *
     * Kalau monster sudah cukup dekat
     * dengan rumah, langsung reset.
     */

    if (
      distanceToSpawn <=
      this.returnDistance
    ) {
      this.finishReturning();

      return;
    }

    /*
     * Update jalur pulang.
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

    /*
     * Kalau path kosong tetapi monster
     * sebenarnya sudah dekat rumah,
     * jangan biarkan state returning
     * nyangkut selamanya.
     */

    const path =
      this.enemy.pathData;

    const pathIndex =
      this.enemy.pathIndex ??
      0;

    if (
      (
        !path ||
        path.length === 0 ||
        pathIndex >=
          path.length
      ) &&
      distanceToSpawn <=
        this.returnDistance +
          64
    ) {
      this.finishReturning();

      return;
    }

    this.followPath();
  }

  /*
   * =====================================
   * RETURN HELPERS
   * =====================================
   */

  private startReturning(
    time: number
  ) {
    this.enemy.enemyState =
      "returning";

    this.enemy.nextPathUpdate =
      time;

    this.clearPath();
  }

  private finishReturning() {
    const spawnX =
      this.enemy.spawnX ??
      this.enemy.x;

    const spawnY =
      this.enemy.spawnY ??
      this.enemy.y;

    /*
     * Pastikan posisi monster benar-benar
     * kembali ke titik awal.
     */

    this.enemy.setPosition(
      spawnX,
      spawnY
    );

    /*
     * Reset velocity.
     */

    this.enemy.setVelocity(
      0,
      0
    );

    /*
     * Reset seluruh data path.
     */

    this.enemy.pathData =
      [];

    this.enemy.pathIndex =
      0;

    this.enemy.nextPathUpdate =
      0;

    /*
     * Yang paling penting:
     * monster kembali ke IDLE.
     *
     * Setelah ini kalau player mendekat
     * lagi, updateIdle() akan membuat
     * monster aggro lagi.
     */

    this.enemy.enemyState =
      "idle";
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

    const path =
      this.pathfinder.findPath(
        start,
        target
      );

    this.enemy.pathData =
      path;

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

    const distanceToWaypoint =
      Phaser.Math.Distance.Between(
        this.enemy.x,
        this.enemy.y,
        waypoint.x,
        waypoint.y
      );

    /*
     * Sudah sampai waypoint.
     */

    if (
      distanceToWaypoint <
      14
    ) {
      this.enemy.pathIndex =
        pathIndex +
        1;

      return;
    }

    /*
     * Jalan menuju waypoint.
     */

    this.scene.physics.moveTo(
      this.enemy,
      waypoint.x,
      waypoint.y,
      this.speed
    );
  }

  /*
   * =====================================
   * PATH RESET
   * =====================================
   */

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
   * =====================================
   * PUBLIC HELPERS
   * =====================================
   */

  public getState():
    EnemyState {
    return (
      this.enemy.enemyState ??
      "idle"
    );
  }

  public forceReturn() {
    this.enemy.enemyState =
      "returning";

    this.enemy.nextPathUpdate =
      0;

    this.clearPath();
  }
}
