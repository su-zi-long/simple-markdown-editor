/**
 * 计算光标点击元素的位置
 */

import { INode } from "../interface/INode";
import { IRow } from "../interface/IRow";

export function getRowIndexByY(rows: IRow[], y: number) {
  if (rows.length === 0) {
    return -1;
  }

  let startY = rows[0].nodes[0].coordinate.y;
  if (y < startY) {
    return 0;
  }

  const lastRow = rows[rows.length - 1];
  const endY = lastRow.nodes[lastRow.nodes.length - 1].coordinate.y;
  if (y < startY) {
    return rows.length - 1;
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (y >= startY && y <= row.height + startY) {
      return i;
    }
    startY += row.height;
  }

  return rows.length - 1;
}

export function getNodeByX(nodes: INode[], x: number) {
  if (nodes.length === 0) {
    return null;
  }

  if (x < nodes[0].coordinate.x) {
    return nodes[0];
  }

  if (x > nodes[nodes.length - 1].coordinate.x) {
    return nodes[nodes.length - 1];
  }

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const {
      metrics: { width },
      coordinate,
    } = node;
    if (coordinate.x <= x && x <= coordinate.x + width) {
      let index = x < coordinate.x + width / 2 ? node.index - 1 : node.index;
      return node;
    }
  }

  return nodes[nodes.length - 1];
}

export function getCursorIndexesByXY(
  rows: IRow[],
  x: number,
  y: number,
  indexes = []
) {
  if (rows.length === 0) {
    return indexes;
  }
  const rowIndex = getRowIndexByY(rows, y);
  const row = rows[rowIndex];
  let nodes = row.nodes;

  const node = getNodeByX(nodes, x);
  indexes.push(node.index);

  if (node.rows) getCursorIndexesByXY(node.rows, x, y, indexes);

  return indexes;
}
