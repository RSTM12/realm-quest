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
     * Spawn di posisi monster mati.
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

    /*
     * Belum boleh diambil.
     */

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
     * Pilih posisi jatuh.
     *
     * Dibuat cukup jauh dari player
     * yang kemungkinan sedang berdiri
     * dekat monster.
     */

    const angle =
      Phaser.Math.FloatBetween(
        0,
        Math.PI * 2
      );

    const distance =
      Phaser.Math.Between(
        55,
        90
      );

    const targetX =
      x +
      Math.cos(
        angle
      ) *
        distance;

    const targetY =
      y +
      Math.sin(
        angle
      ) *
        distance;

    /*
     * Mulai kecil.
     */

    loot.setScale(
      0.4
    );

    /*
     * Animasi item terpental keluar.
     */

    this.scene.tweens.add({
      targets:
        loot,

      x:
        targetX,

      y:
        targetY,

      scale:
        1,

      duration:
        350,

      ease:
        "Back.Out",

      onComplete:
        () => {
          /*
           * Pastikan body physics
           * mengikuti posisi terbaru.
           */

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

          /*
           * Mulai animasi floating
           * setelah item selesai jatuh.
           */

          this.startFloatingAnimation(
            loot
          );
        },
    });

    /*
     * Pickup baru aktif setelah 800ms.
     */

    this.scene.time.delayedCall(
      800,
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
        loot.y - 5,

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
