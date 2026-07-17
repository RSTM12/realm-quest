export type GridPoint = {
  col: number;
  row: number;
};

type PathNode = {
  col: number;
  row: number;

  g: number;
  h: number;
  f: number;

  parent: PathNode | null;
};

export default class GridPathfinder {
  private readonly grid: boolean[][];
  private readonly columns: number;
  private readonly rows: number;

  constructor(grid: boolean[][]) {
    this.grid = grid;

    this.rows = grid.length;

    this.columns =
      grid.length > 0
        ? grid[0].length
        : 0;
  }

  public findPath(
    start: GridPoint,
    target: GridPoint
  ): GridPoint[] {
    if (
      !this.isInside(
        start.col,
        start.row
      ) ||
      !this.isInside(
        target.col,
        target.row
      )
    ) {
      return [];
    }

    if (
      !this.isWalkable(
        start.col,
        start.row
      ) ||
      !this.isWalkable(
        target.col,
        target.row
      )
    ) {
      return [];
    }

    const openList: PathNode[] = [];

    const closedSet =
      new Set<string>();

    const startNode: PathNode = {
      col: start.col,
      row: start.row,

      g: 0,

      h: this.getHeuristic(
        start,
        target
      ),

      f: 0,

      parent: null,
    };

    startNode.f =
      startNode.g +
      startNode.h;

    openList.push(
      startNode
    );

    while (
      openList.length > 0
    ) {
      /*
       * Cari node dengan nilai F terkecil.
       */

      let bestIndex = 0;

      for (
        let i = 1;
        i < openList.length;
        i++
      ) {
        if (
          openList[i].f <
          openList[bestIndex].f
        ) {
          bestIndex = i;
        }
      }

      const current =
        openList.splice(
          bestIndex,
          1
        )[0];

      /*
       * Sampai tujuan.
       */

      if (
        current.col ===
          target.col &&
        current.row ===
          target.row
      ) {
        return this.buildPath(
          current
        );
      }

      closedSet.add(
        this.getKey(
          current.col,
          current.row
        )
      );

      const neighbors =
        this.getNeighbors(
          current.col,
          current.row
        );

      for (
        const neighbor of neighbors
      ) {
        const key =
          this.getKey(
            neighbor.col,
            neighbor.row
          );

        if (
          closedSet.has(
            key
          )
        ) {
          continue;
        }

        const newG =
          current.g + 1;

        const existingNode =
          openList.find(
            (node) =>
              node.col ===
                neighbor.col &&
              node.row ===
                neighbor.row
          );

        if (
          existingNode
        ) {
          if (
            newG <
            existingNode.g
          ) {
            existingNode.g =
              newG;

            existingNode.f =
              existingNode.g +
              existingNode.h;

            existingNode.parent =
              current;
          }

          continue;
        }

        const h =
          this.getHeuristic(
            neighbor,
            target
          );

        const newNode: PathNode = {
          col:
            neighbor.col,

          row:
            neighbor.row,

          g:
            newG,

          h,

          f:
            newG + h,

          parent:
            current,
        };

        openList.push(
          newNode
        );
      }
    }

    /*
     * Tidak ada jalan.
     */

    return [];
  }

  private getNeighbors(
    col: number,
    row: number
  ): GridPoint[] {
    const directions = [
      {
        col: 0,
        row: -1,
      },

      {
        col: 1,
        row: 0,
      },

      {
        col: 0,
        row: 1,
      },

      {
        col: -1,
        row: 0,
      },
    ];

    const neighbors:
      GridPoint[] = [];

    for (
      const direction of directions
    ) {
      const nextCol =
        col +
        direction.col;

      const nextRow =
        row +
        direction.row;

      if (
        this.isWalkable(
          nextCol,
          nextRow
        )
      ) {
        neighbors.push({
          col:
            nextCol,

          row:
            nextRow,
        });
      }
    }

    return neighbors;
  }

  private getHeuristic(
    pointA: GridPoint,
    pointB: GridPoint
  ) {
    return (
      Math.abs(
        pointA.col -
          pointB.col
      ) +
      Math.abs(
        pointA.row -
          pointB.row
      )
    );
  }

  private buildPath(
    endNode: PathNode
  ): GridPoint[] {
    const path:
      GridPoint[] = [];

    let current:
      PathNode | null =
      endNode;

    while (
      current
    ) {
      path.push({
        col:
          current.col,

        row:
          current.row,
      });

      current =
        current.parent;
    }

    path.reverse();

    /*
     * Buang posisi awal.
     * Enemy tidak perlu berjalan
     * ke tile tempat dia berdiri.
     */

    if (
      path.length > 0
    ) {
      path.shift();
    }

    return path;
  }

  private isWalkable(
    col: number,
    row: number
  ) {
    if (
      !this.isInside(
        col,
        row
      )
    ) {
      return false;
    }

    return (
      this.grid[row][col] ===
      true
    );
  }

  private isInside(
    col: number,
    row: number
  ) {
    return (
      col >= 0 &&
      row >= 0 &&
      col <
        this.columns &&
      row <
        this.rows
    );
  }

  private getKey(
    col: number,
    row: number
  ) {
    return `${col}:${row}`;
  }
}
