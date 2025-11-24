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
 * Divide a passada em segmentos quando encontra obstáculos
 */
function gerarPassadaVertical(
  mapa: number[][], 
  coluna: number, 
  direcao: 'baixo' | 'cima'
): Ponto[][] {
  const segmentos: Ponto[][] = [];
  let segmentoAtual: Ponto[] = [];
  const rows = mapa.length;
  
  if (direcao === 'baixo') {
    // De cima para baixo
    for (let row = 0; row < rows; row++) {
      if (mapa[row][coluna] === 0) {
        segmentoAtual.push({ row, col: coluna });
      } else {
        // Encontrou obstáculo, salva o segmento atual se não estiver vazio
        if (segmentoAtual.length > 0) {
          segmentos.push([...segmentoAtual]);
          segmentoAtual = [];
        }
      }
    }
  } else {
    // De baixo para cima
    for (let row = rows - 1; row >= 0; row--) {
      if (mapa[row][coluna] === 0) {
        segmentoAtual.push({ row, col: coluna });
      } else {
        // Encontrou obstáculo, salva o segmento atual se não estiver vazio
        if (segmentoAtual.length > 0) {
          segmentos.push([...segmentoAtual]);
          segmentoAtual = [];
        }
      }
    }
  }
  
  // Adiciona o último segmento se não estiver vazio
  if (segmentoAtual.length > 0) {
    segmentos.push(segmentoAtual);
  }
  
  return segmentos;
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
  
  // Gera todos os segmentos de passadas verticais (Boustrophedon com divisão por obstáculos)
  const todosSegmentos: Ponto[][] = [];
  for (let col = 0; col < cols; col++) {
    const direcao = col % 2 === 0 ? 'baixo' : 'cima';
    const segmentos = gerarPassadaVertical(mapa, col, direcao);
    todosSegmentos.push(...segmentos);
  }
  
  if (todosSegmentos.length === 0) {
    return [inicio]; // Campo sem células vazias
  }
  
  // Marca células visitadas
  const visitado = Array(rows).fill(null).map(() => Array(cols).fill(false));
  visitado[inicio.row][inicio.col] = true;
  
  // Processa cada segmento
  const segmentosRestantes = [...todosSegmentos];
  let iteracoes = 0;
  const maxIteracoes = todosSegmentos.length * 3;
  
  while (segmentosRestantes.length > 0 && iteracoes < maxIteracoes) {
    iteracoes++;
    
    // Encontra o segmento mais próximo que ainda tem células não visitadas
    let melhorSegmento: Ponto[] | null = null;
    let melhorIndice = -1;
    let melhorPontoEntrada: Ponto | null = null;
    let menorDistancia = Infinity;
    
    for (let i = 0; i < segmentosRestantes.length; i++) {
      const segmento = segmentosRestantes[i];
      const pontosNaoVisitados = segmento.filter(p => !visitado[p.row][p.col]);
      
      if (pontosNaoVisitados.length === 0) continue;
      
      // Encontra o ponto de entrada mais próximo neste segmento
      for (const ponto of pontosNaoVisitados) {
        const distancia = Math.abs(ponto.row - posicaoAtual.row) + Math.abs(ponto.col - posicaoAtual.col);
        if (distancia < menorDistancia) {
          menorDistancia = distancia;
          melhorSegmento = segmento;
          melhorIndice = i;
          melhorPontoEntrada = ponto;
        }
      }
    }
    
    if (!melhorSegmento || !melhorPontoEntrada) {
      // Não há mais segmentos acessíveis
      break;
    }
    
    // Conecta posição atual ao ponto de entrada usando A*
    if (posicaoAtual.row !== melhorPontoEntrada.row || posicaoAtual.col !== melhorPontoEntrada.col) {
      const caminhoConexao = conectarPontosComAStar(grid, posicaoAtual, melhorPontoEntrada);
      
      if (!caminhoConexao) {
        // Se não conseguir conectar, remove este segmento e tenta o próximo
        segmentosRestantes.splice(melhorIndice, 1);
        continue;
      }
      
      // VALIDAÇÃO CRÍTICA: Verifica se o caminho passa por obstáculos
      let caminhoSeguro = true;
      for (const p of caminhoConexao) {
        if (mapa[p.row][p.col] === 1) {
          console.warn('Caminho A* tentou passar por obstáculo!');
          caminhoSeguro = false;
          break;
        }
      }
      
      if (!caminhoSeguro) {
        // Caminho não é seguro, remove este segmento
        segmentosRestantes.splice(melhorIndice, 1);
        continue;
      }
      
      // Adiciona caminho de conexão
      caminhoConexao.forEach(p => {
        rotaCompleta.push(p);
        if (isLivre(mapa, p)) {
          visitado[p.row][p.col] = true;
        }
      });
      
      posicaoAtual = melhorPontoEntrada;
    }
    
    // Percorre o segmento a partir do ponto de entrada
    const indiceInicioSegmento = melhorSegmento.findIndex(
      p => p.row === melhorPontoEntrada!.row && p.col === melhorPontoEntrada!.col
    );
    
    let celulasAdicionadas = 0;
    for (let i = indiceInicioSegmento; i < melhorSegmento.length; i++) {
      const ponto = melhorSegmento[i];
      
      // VALIDAÇÃO: Garante que não está em obstáculo
      if (mapa[ponto.row][ponto.col] === 1) {
        console.warn('Tentou adicionar obstáculo à rota!');
        break;
      }
      
      if (!visitado[ponto.row][ponto.col]) {
        rotaCompleta.push(ponto);
        visitado[ponto.row][ponto.col] = true;
        posicaoAtual = ponto;
        celulasAdicionadas++;
      }
    }
    
    // Remove segmento processado
    if (celulasAdicionadas > 0) {
      segmentosRestantes.splice(melhorIndice, 1);
    } else {
      // Se não adicionou nenhuma célula, remove e tenta próximo
      segmentosRestantes.splice(melhorIndice, 1);
    }
  }
  
  // VALIDAÇÃO FINAL: Remove qualquer obstáculo que possa ter entrado na rota
  const rotaSegura = rotaCompleta.filter(p => mapa[p.row][p.col] === 0);
  
  return rotaSegura;
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
