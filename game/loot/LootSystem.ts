import * as Phaser from "phaser";

export type LootRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary";

export type LootItem = {
  id: string;
  name: string;
  rarity: LootRarity;
  type: "material" | "weapon" | "armor";
  value: number;
};

export type LootSprite =
  Phaser.Physics.Arcade.Sprite & {
    lootData?: LootItem;
    canPickup?: boolean;
  };

type LootTableEntry = {
  item: LootItem;
  weight: number;
};

export default class LootSystem {
  private readonly scene: Phaser.Scene;

  public readonly lootGroup:
    Phaser.Physics.Arcade.Group;

  private readonly lootTable:
    LootTableEntry[] = [
      {
        item: {
          id: "scrap_iron",
          name: "Scrap Iron",
          rarity: "common",
          type: "material",
          value: 5,
        },
        weight: 45,
      },
      {
        item: {
          id: "monster_core",
          name: "Monster Core",
          rarity: "uncommon",
          type: "material",
          value: 15,
        },
        weight: 28,
      },
      {
        item: {
          id: "rusted_blade",
          name: "Rusted Blade",
          rarity: "rare",
          type: "weapon",
          value: 40,
        },
        weight: 15,
      },
      {
        item: {
          id: "shadow_armor",
          name: "Shadow Armor",
          rarity: "epic",
          type: "armor",
          value: 100,
        },
        weight: 9,
      },
      {
        item: {
          id: "ancient_relic",
          name: "Ancient Relic",
          rarity: "legendary",
          type: "material",
          value: 300,
        },
        weight: 3,
      },
    ];

  constructor(
    scene: Phaser.Scene
  ) {
    this.scene =
      scene;

    this.createLootTextures();

    this.lootGroup =
      this.scene.physics.add.group({
        allowGravity: false,
        immovable: true,
      });
  }

  /*
   * =========================================
   * DROP LOOT
   * =========================================
   */

  public dropLoot(
    x: number,
    y: number
  ): LootSprite | null {
    /*
     * 70% drop chance.
     */

    if (
      Phaser.Math.Between(
        1,
        100
      ) > 70
    ) {
      return null;
    }

    const item =
      this.rollLoot();

    const textureKey =
      this.getTextureKey(
        item.rarity
      );

    /*
     * Cari posisi jatuh yang aman.
     */

    const safePosition =
      this.findSafeDropPosition(
        x,
        y
      );

    /*
     * Loot tetap mulai dari
     * posisi monster mati.
     */

    const loot =
      this.lootGroup.create(
        x,
        y,
        textureKey
      ) as LootSprite;

    loot.lootData = {
      ...item,
    };

    loot.canPickup =
      false;

    loot.setDepth(
      15
    );

    loot.setBodySize(
      24,
      24
    );

    /*
     * Mulai kecil.
     */

    loot.setScale(
      0.4
    );

    /*
     * Animasi terpental menuju
     * posisi lantai yang aman.
     */

    this.scene.tweens.add({
      targets:
        loot,

      x:
        safePosition.x,

      y:
        safePosition.y,

      scale:
        1,

      duration:
        350,

      ease:
        "Back.Out",

      onComplete:
        () => {
          if (
            !loot.active
          ) {
            return;
          }

          const body =
            loot.body as
              Phaser.Physics.Arcade.Body;

          if (
            body
          ) {
            body.reset(
              loot.x,
              loot.y
            );
          }

          this.startFloatingAnimation(
            loot
          );
        },
    });

    /*
     * Pickup aktif setelah animasi.
     */

    this.scene.time.delayedCall(
      600,
      () => {
        if (
          loot.active
        ) {
          loot.canPickup =
            true;
        }
      }
    );

    return loot;
  }

  /*
   * =========================================
   * FIND SAFE DROP POSITION
   * =========================================
   */

  private findSafeDropPosition(
    originX: number,
    originY: number
  ): {
    x: number;
    y: number;
  } {
    /*
     * Kita coba beberapa lingkaran
     * di sekitar monster.
     *
     * Jarak minimum dibuat 48px supaya
     * item tidak terlalu dekat tembok
     * maupun posisi monster.
     */

    const distances = [
      55,
      70,
      85,
      100,
      120,
    ];

    /*
     * Mulai dari arah random supaya
     * loot tidak selalu terbang ke
     * arah yang sama.
     */

    const randomStartAngle =
      Phaser.Math.FloatBetween(
        0,
        Math.PI * 2
      );

    /*
     * Coba 16 arah pada setiap jarak.
     */

    for (
      const distance
      of distances
    ) {
      for (
        let i = 0;
        i < 16;
        i++
      ) {
        const angle =
          randomStartAngle +
          (
            Math.PI *
            2 *
            i
          ) /
            16;

        const candidateX =
          originX +
          Math.cos(
            angle
          ) *
            distance;

        const candidateY =
          originY +
          Math.sin(
            angle
          ) *
            distance;

        if (
          this.isSafePosition(
            candidateX,
            candidateY
          )
        ) {
          return {
            x:
              candidateX,

            y:
              candidateY,
          };
        }
      }
    }

    /*
     * Kalau monster mati di lokasi
     * yang sangat sempit, scan area
     * lebih luas berbentuk grid.
     */

    const scanDistances = [
      32,
      64,
      96,
      128,
      160,
    ];

    for (
      const distance
      of scanDistances
    ) {
      const positions = [
        {
          x:
            originX +
            distance,

          y:
            originY,
        },

        {
          x:
            originX -
            distance,

          y:
            originY,
        },

        {
          x:
            originX,

          y:
            originY +
            distance,
        },

        {
          x:
            originX,

          y:
            originY -
            distance,
        },

        {
          x:
            originX +
            distance,

          y:
            originY +
            distance,
        },

        {
          x:
            originX -
            distance,

          y:
            originY +
            distance,
        },

        {
          x:
            originX +
            distance,

          y:
            originY -
            distance,
        },

        {
          x:
            originX -
            distance,

          y:
            originY -
            distance,
        },
      ];

      for (
        const position
        of positions
      ) {
        if (
          this.isSafePosition(
            position.x,
            position.y
          )
        ) {
          return position;
        }
      }
    }

    /*
     * Fallback terakhir.
     *
     * Kalau tidak ditemukan posisi,
     * pakai posisi awal.
     */

    return {
      x:
        originX,

      y:
        originY,
    };
  }

  /*
   * =========================================
   * CHECK SAFE POSITION
   * =========================================
   */

  private isSafePosition(
    x: number,
    y: number
  ): boolean {
    /*
     * Jangan spawn terlalu dekat
     * batas dunia.
     */

    const worldBounds =
      this.scene.physics.world.bounds;

    const margin =
      32;

    if (
      x <
        worldBounds.left +
          margin ||
      x >
        worldBounds.right -
          margin ||
      y <
        worldBounds.top +
          margin ||
      y >
        worldBounds.bottom -
          margin
    ) {
      return false;
    }

    /*
     * Area yang harus kosong.
     *
     * Lebih besar dari body loot
     * supaya loot tidak menempel
     * di pinggir tembok.
     */

    const safeRadius =
      28;

    const checkArea =
      new Phaser.Geom.Rectangle(
        x -
          safeRadius,

        y -
          safeRadius,

        safeRadius *
          2,

        safeRadius *
          2
      );

    /*
     * Cek semua body physics statis.
     *
     * Dungeon wall kita adalah
     * StaticGroup, jadi tembok akan
     * ditemukan lewat staticBodies.
     */

    const staticBodies =
      this.scene.physics.world
        .staticBodies;

    for (
      let i = 0;
      i <
      staticBodies.entries.length;
      i++
    ) {
      const body =
        staticBodies.entries[
          i
        ];

      if (
        !body ||
        !body.enable
      ) {
        continue;
      }

      const bodyRect =
        new Phaser.Geom.Rectangle(
          body.x,
          body.y,
          body.width,
          body.height
        );

      if (
        Phaser.Geom.Intersects.RectangleToRectangle(
          checkArea,
          bodyRect
        )
      ) {
        return false;
      }
    }

    return true;
  }

  /*
   * =========================================
   * FLOATING ANIMATION
   * =========================================
   */

  private startFloatingAnimation(
    loot: LootSprite
  ) {
    if (
      !loot.active
    ) {
      return;
    }

    this.scene.tweens.add({
      targets:
        loot,

      y:
        loot.y -
        5,

      duration:
        700,

      yoyo:
        true,

      repeat:
        -1,

      ease:
        "Sine.InOut",
    });
  }

  /*
   * =========================================
   * LOOT ROLL
   * =========================================
   */

  private rollLoot():
    LootItem {
    const totalWeight =
      this.lootTable.reduce(
        (
          total,
          entry
        ) =>
          total +
          entry.weight,

        0
      );

    let random =
      Phaser.Math.Between(
        1,
        totalWeight
      );

    for (
      const entry
      of this.lootTable
    ) {
      random -=
        entry.weight;

      if (
        random <=
        0
      ) {
        return {
          ...entry.item,
        };
      }
    }

    return {
      ...this.lootTable[
        0
      ].item,
    };
  }

  /*
   * =========================================
   * TEXTURES
   * =========================================
   */

  private createLootTextures() {
    this.createLootTexture(
      "loot_common",
      0xb7c0c7
    );

    this.createLootTexture(
      "loot_uncommon",
      0x62c370
    );

    this.createLootTexture(
      "loot_rare",
      0x4d8dff
    );

    this.createLootTexture(
      "loot_epic",
      0xa855f7
    );

    this.createLootTexture(
      "loot_legendary",
      0xffa928
    );
  }

  private createLootTexture(
    key: string,
    color: number
  ) {
    if (
      this.scene.textures.exists(
        key
      )
    ) {
      return;
    }

    const graphics =
      this.scene.add.graphics();

    /*
     * Glow.
     */

    graphics.fillStyle(
      color,
      0.25
    );

    graphics.fillCircle(
      20,
      20,
      19
    );

    /*
     * Diamond.
     */

    graphics.fillStyle(
      color,
      1
    );

    graphics.beginPath();

    graphics.moveTo(
      20,
      4
    );

    graphics.lineTo(
      36,
      20
    );

    graphics.lineTo(
      20,
      36
    );

    graphics.lineTo(
      4,
      20
    );

    graphics.closePath();

    graphics.fillPath();

    /*
     * Outline.
     */

    graphics.lineStyle(
      3,
      0xffffff,
      0.8
    );

    graphics.strokePath();

    /*
     * Titik terang tengah.
     */

    graphics.fillStyle(
      0xffffff,
      0.8
    );

    graphics.fillCircle(
      20,
      20,
      4
    );

    graphics.generateTexture(
      key,
      40,
      40
    );

    graphics.destroy();
  }

  private getTextureKey(
    rarity: LootRarity
  ) {
    return `loot_${rarity}`;
  }
}
