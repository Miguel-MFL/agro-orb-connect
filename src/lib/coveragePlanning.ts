/**
 * Sistema de Planejamento de Rota de Cobertura Total
 * 
 * Combina o Padrão Boustrophedon (vai-e-volta) para cobertura principal
 * com o algoritmo A* para manobras seguras e desvio de obstáculos.
 */

import { aStar, Position, CellType } from './astar';

export interface Ponto {
  row: number;
  col: number;
}

/**
 * Converte uma matriz numérica (0=vazio, 1=obstáculo) em grid de CellType
 */
function converterMapaParaGrid(mapa: number[][]): { type: CellType }[][] {
  return mapa.map(row => 
    row.map(cell => ({
      type: cell === 1 ? 'obstacle' as CellType : 'empty' as CellType
    }))
  );
}

/**
 * Verifica se uma posição está livre (não é obstáculo e está dentro dos limites)
 */
function isLivre(mapa: number[][], pos: Ponto): boolean {
  if (pos.row < 0 || pos.row >= mapa.length || 
      pos.col < 0 || pos.col >= mapa[0].length) {
    return false;
  }
  return mapa[pos.row][pos.col] === 0;
}

/**
 * Gera uma passada vertical (coluna) no padrão Boustrophedon
 */
function gerarPassadaVertical(
  mapa: number[][], 
  coluna: number, 
  direcao: 'baixo' | 'cima'
): Ponto[] {
  const passada: Ponto[] = [];
  const rows = mapa.length;
  
  if (direcao === 'baixo') {
    // De cima para baixo
    for (let row = 0; row < rows; row++) {
      if (mapa[row][coluna] === 0) {
        passada.push({ row, col: coluna });
      }
    }
  } else {
    // De baixo para cima
    for (let row = rows - 1; row >= 0; row--) {
      if (mapa[row][coluna] === 0) {
        passada.push({ row, col: coluna });
      }
    }
  }
  
  return passada;
}

/**
 * Conecta dois pontos usando A* para manobra segura
 */
function conectarPontosComAStar(
  grid: { type: CellType }[][],
  de: Ponto,
  para: Ponto
): Ponto[] | null {
  // Marca temporariamente os pontos de origem e destino como navegáveis
  const tipoOriginalDe = grid[de.row][de.col].type;
  const tipoOriginalPara = grid[para.row][para.col].type;
  
  grid[de.row][de.col].type = 'start';
  grid[para.row][para.col].type = 'end';
  
  const caminho = aStar(grid, de, para);
  
  // Restaura os tipos originais
  grid[de.row][de.col].type = tipoOriginalDe;
  grid[para.row][para.col].type = tipoOriginalPara;
  
  if (!caminho) return null;
  
  // Remove o primeiro ponto se for igual ao ponto de origem (evita duplicação)
  if (caminho.length > 0 && 
      caminho[0].row === de.row && 
      caminho[0].col === de.col) {
    caminho.shift();
  }
  
  return caminho;
}

/**
 * Encontra o ponto mais próximo em uma lista de pontos
 */
function encontrarPontoMaisProximo(origem: Ponto, pontos: Ponto[]): number {
  let menorDistancia = Infinity;
  let indice = 0;
  
  pontos.forEach((p, i) => {
    const dist = Math.abs(p.row - origem.row) + Math.abs(p.col - origem.col);
    if (dist < menorDistancia) {
      menorDistancia = dist;
      indice = i;
    }
  });
  
  return indice;
}

/**
 * Função Principal: Gera rota otimizada de cobertura total
 * 
 * @param mapa - Matriz 2D onde 0=vazio, 1=obstáculo
 * @param inicio - Posição inicial da máquina
 * @returns Lista ordenada de coordenadas ou null se impossível
 */
export function gerarRotaOtimizada(
  mapa: number[][], 
  inicio: Ponto
): Ponto[] | null {
  if (!mapa || mapa.length === 0 || mapa[0].length === 0) {
    return null;
  }
  
  // Verifica se o ponto inicial é válido
  if (!isLivre(mapa, inicio)) {
    console.error('Ponto inicial está em um obstáculo');
    return null;
  }
  
  const rows = mapa.length;
  const cols = mapa[0].length;
  const grid = converterMapaParaGrid(mapa);
  
  // Rota final
  const rotaCompleta: Ponto[] = [inicio];
  let posicaoAtual = inicio;
  
  // Gera todas as passadas verticais (Boustrophedon)
  const passadas: Ponto[][] = [];
  for (let col = 0; col < cols; col++) {
    const direcao = col % 2 === 0 ? 'baixo' : 'cima';
    const passada = gerarPassadaVertical(mapa, col, direcao);
    if (passada.length > 0) {
      passadas.push(passada);
    }
  }
  
  if (passadas.length === 0) {
    return [inicio]; // Campo sem células vazias
  }
  
  // Marca células visitadas
  const visitado = Array(rows).fill(null).map(() => Array(cols).fill(false));
  visitado[inicio.row][inicio.col] = true;
  
  // Processa cada passada
  let passadasProcessadas = 0;
  const passadasRestantes = [...passadas];
  
  while (passadasRestantes.length > 0 && passadasProcessadas < passadas.length * 2) {
    // Encontra a passada mais próxima
    const indicePassadaMaisProxima = passadasRestantes.findIndex(passada => {
      return passada.some(p => !visitado[p.row][p.col]);
    });
    
    if (indicePassadaMaisProxima === -1) break;
    
    const passadaAtual = passadasRestantes[indicePassadaMaisProxima];
    
    // Encontra o ponto de entrada mais próximo nesta passada
    const pontosNaoVisitados = passadaAtual.filter(p => !visitado[p.row][p.col]);
    if (pontosNaoVisitados.length === 0) {
      passadasRestantes.splice(indicePassadaMaisProxima, 1);
      continue;
    }
    
    const indicePontoEntrada = encontrarPontoMaisProximo(posicaoAtual, pontosNaoVisitados);
    const pontoEntrada = pontosNaoVisitados[indicePontoEntrada];
    
    // Conecta posição atual ao ponto de entrada usando A*
    if (posicaoAtual.row !== pontoEntrada.row || posicaoAtual.col !== pontoEntrada.col) {
      const caminhoConexao = conectarPontosComAStar(grid, posicaoAtual, pontoEntrada);
      
      if (!caminhoConexao) {
        // Se não conseguir conectar, tenta próxima passada
        passadasRestantes.splice(indicePassadaMaisProxima, 1);
        passadasProcessadas++;
        continue;
      }
      
      // Adiciona caminho de conexão
      caminhoConexao.forEach(p => {
        rotaCompleta.push(p);
        if (isLivre(mapa, p)) {
          visitado[p.row][p.col] = true;
        }
      });
      
      posicaoAtual = pontoEntrada;
    }
    
    // Percorre a passada a partir do ponto de entrada
    const indiceInicioPassada = passadaAtual.findIndex(
      p => p.row === pontoEntrada.row && p.col === pontoEntrada.col
    );
    
    for (let i = indiceInicioPassada; i < passadaAtual.length; i++) {
      const ponto = passadaAtual[i];
      if (!visitado[ponto.row][ponto.col]) {
        rotaCompleta.push(ponto);
        visitado[ponto.row][ponto.col] = true;
        posicaoAtual = ponto;
      }
    }
    
    // Remove passada processada
    passadasRestantes.splice(indicePassadaMaisProxima, 1);
    passadasProcessadas++;
  }
  
  return rotaCompleta;
}

/**
 * Calcula estatísticas da rota gerada
 */
export function calcularEstatisticasRota(rota: Ponto[]): {
  distanciaTotal: number;
  celulasCobertas: number;
  percentualCobertura: number;
} {
  let distanciaTotal = 0;
  
  for (let i = 1; i < rota.length; i++) {
    const anterior = rota[i - 1];
    const atual = rota[i];
    distanciaTotal += Math.abs(atual.row - anterior.row) + Math.abs(atual.col - anterior.col);
  }
  
  // Células únicas cobertas
  const celulasUnicas = new Set(rota.map(p => `${p.row},${p.col}`));
  
  return {
    distanciaTotal,
    celulasCobertas: celulasUnicas.size,
    percentualCobertura: 0, // Será calculado na UI com base no total de células vazias
  };
}
