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
    this.scene = scene;

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
     * 70% kemungkinan monster
     * menjatuhkan item.
     */

    const dropChance =
      Phaser.Math.Between(
        1,
        100
      );

    if (
      dropChance >
      70
    ) {
      return null;
    }

    const item =
      this.rollLoot();

    const textureKey =
      this.getTextureKey(
        item.rarity
      );

    const loot =
      this.lootGroup.create(
        x,
        y,
        textureKey
      ) as LootSprite;

    loot.lootData = {
      ...item,
    };

    loot.setDepth(
      8
    );

    loot.setBodySize(
      20,
      20
    );

    /*
     * Sedikit random supaya kalau
     * nanti satu monster drop banyak item,
     * item tidak menumpuk persis.
     */

    loot.setPosition(
      x +
        Phaser.Math.Between(
          -12,
          12
        ),

      y +
        Phaser.Math.Between(
          -12,
          12
        )
    );

    /*
     * Animasi spawn.
     */

    loot.setScale(
      0
    );

    this.scene.tweens.add({
      targets: loot,

      scale: 1,

      duration: 180,

      ease: "Back.Out",
    });

    /*
     * Animasi floating.
     */

    this.scene.tweens.add({
      targets: loot,

      y:
        loot.y -
        6,

      duration: 700,

      yoyo: true,

      repeat: -1,

      ease: "Sine.InOut",
    });

    return loot;
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

    /*
     * Fallback.
     */

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
     * Glow luar.
     */

    graphics.fillStyle(
      color,
      0.25
    );

    graphics.fillCircle(
      16,
      16,
      15
    );

    /*
     * Diamond item.
     */

    graphics.fillStyle(
      color,
      1
    );

    graphics.beginPath();

    graphics.moveTo(
      16,
      3
    );

    graphics.lineTo(
      29,
      16
    );

    graphics.lineTo(
      16,
      29
    );

    graphics.lineTo(
      3,
      16
    );

    graphics.closePath();

    graphics.fillPath();

    /*
     * Highlight.
     */

    graphics.lineStyle(
      2,
      0xffffff,
      0.7
    );

    graphics.strokePath();

    graphics.generateTexture(
      key,
      32,
      32
    );

    graphics.destroy();
  }

  private getTextureKey(
    rarity: LootRarity
  ) {
    return `loot_${rarity}`;
  }
}
