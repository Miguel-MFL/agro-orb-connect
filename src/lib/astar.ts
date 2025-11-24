/**
 * Implementação do Algoritmo A* (A-Star) para otimização de rotas
 * 
 * O A* é um algoritmo de busca que encontra o caminho mais curto entre dois pontos,
 * usando uma heurística para priorizar caminhos promissores.
 */

export interface Position {
  row: number;
  col: number;
}

export interface Node {
  position: Position;
  g: number; // Custo do início até este nó
  h: number; // Heurística (estimativa do custo deste nó até o destino)
  f: number; // f = g + h (custo total estimado)
  parent: Node | null;
}

export type CellType = "empty" | "obstacle" | "start" | "end" | "machine" | "path";

/**
 * Calcula a distância de Manhattan entre dois pontos
 * (soma das diferenças absolutas das coordenadas)
 */
function heuristic(pos1: Position, pos2: Position): number {
  return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
}

/**
 * Verifica se uma posição é válida e navegável
 */
function isWalkable(grid: { type: CellType }[][], pos: Position): boolean {
  const rows = grid.length;
  const cols = grid[0].length;
  
  // Verifica se está dentro dos limites
  if (pos.row < 0 || pos.row >= rows || pos.col < 0 || pos.col >= cols) {
    return false;
  }
  
  // Verifica se não é um obstáculo
  const cellType = grid[pos.row][pos.col].type;
  return cellType !== "obstacle";
}

/**
 * Obtém os vizinhos válidos de uma posição
 * (cima, baixo, esquerda, direita)
 */
function getNeighbors(grid: { type: CellType }[][], pos: Position): Position[] {
  const neighbors: Position[] = [];
  const directions = [
    { row: -1, col: 0 },  // Cima
    { row: 1, col: 0 },   // Baixo
    { row: 0, col: -1 },  // Esquerda
    { row: 0, col: 1 },   // Direita
  ];
  
  for (const dir of directions) {
    const newPos: Position = {
      row: pos.row + dir.row,
      col: pos.col + dir.col,
    };
    
    if (isWalkable(grid, newPos)) {
      neighbors.push(newPos);
    }
  }
  
  return neighbors;
}

/**
 * Verifica se duas posições são iguais
 */
function positionsEqual(pos1: Position, pos2: Position): boolean {
  return pos1.row === pos2.row && pos1.col === pos2.col;
}

/**
 * Encontra um nó na lista de nós
 */
function findNodeInList(list: Node[], pos: Position): Node | null {
  return list.find(node => positionsEqual(node.position, pos)) || null;
}

/**
 * Remove um nó da lista
 */
function removeNodeFromList(list: Node[], node: Node): void {
  const index = list.indexOf(node);
  if (index > -1) {
    list.splice(index, 1);
  }
}

/**
 * Reconstrói o caminho do fim até o início seguindo os parents
 */
function reconstructPath(endNode: Node): Position[] {
  const path: Position[] = [];
  let current: Node | null = endNode;
  
  while (current !== null) {
    path.unshift(current.position);
    current = current.parent;
  }
  
  return path;
}

/**
 * Implementação do algoritmo A*
 * 
 * @param grid - Grid com tipos de células
 * @param start - Posição inicial
 * @param end - Posição final
 * @returns Array de posições representando o caminho, ou null se não houver caminho
 */
export function aStar(
  grid: { type: CellType }[][],
  start: Position,
  end: Position
): Position[] | null {
  // Listas de nós a serem explorados (openList) e já explorados (closedList)
  const openList: Node[] = [];
  const closedList: Node[] = [];
  
  // Cria o nó inicial
  const startNode: Node = {
    position: start,
    g: 0,
    h: heuristic(start, end),
    f: heuristic(start, end),
    parent: null,
  };
  
  openList.push(startNode);
  
  // Loop principal do A*
  while (openList.length > 0) {
    // Encontra o nó com menor f na openList
    let currentNode = openList[0];
    let currentIndex = 0;
    
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < currentNode.f) {
        currentNode = openList[i];
        currentIndex = i;
      }
    }
    
    // Remove o nó atual da openList e adiciona à closedList
    openList.splice(currentIndex, 1);
    closedList.push(currentNode);
    
    // Se chegamos ao destino, reconstrói e retorna o caminho
    if (positionsEqual(currentNode.position, end)) {
      return reconstructPath(currentNode);
    }
    
    // Explora os vizinhos
    const neighbors = getNeighbors(grid, currentNode.position);
    
    for (const neighborPos of neighbors) {
      // Se o vizinho já foi explorado, pula
      if (findNodeInList(closedList, neighborPos)) {
        continue;
      }
      
      // Calcula o custo g para este vizinho
      const gScore = currentNode.g + 1;
      
      // Verifica se o vizinho já está na openList
      let neighborNode = findNodeInList(openList, neighborPos);
      
      if (!neighborNode) {
        // Se não está na openList, cria um novo nó
        neighborNode = {
          position: neighborPos,
          g: gScore,
          h: heuristic(neighborPos, end),
          f: gScore + heuristic(neighborPos, end),
          parent: currentNode,
        };
        openList.push(neighborNode);
      } else if (gScore < neighborNode.g) {
        // Se encontramos um caminho melhor para este nó, atualiza
        neighborNode.g = gScore;
        neighborNode.f = gScore + neighborNode.h;
        neighborNode.parent = currentNode;
      }
    }
  }
  
  // Se chegamos aqui, não há caminho
  return null;
}

/**
 * Encontra uma posição específica no grid
 */
export function findPosition(
  grid: { type: CellType }[][],
  cellType: CellType
): Position | null {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col].type === cellType) {
        return { row, col };
      }
    }
  }
  return null;
}
