import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Tractor, ArrowLeft, Circle, Square, ZoomIn, ZoomOut, MapPin, Flag, Sun, Moon, Calculator, Play, Pause, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { aStar, findPosition, Position } from "@/lib/astar";
import { gerarRotaOtimizada, calcularEstatisticasRota, Ponto } from "@/lib/coveragePlanning";
import ormaLogo from "@/assets/orma-logo.png";

type CellType = "empty" | "obstacle" | "start" | "end" | "machine" | "path";
type DrawMode = CellType;

interface Cell {
  type: CellType;
}

const RouteOptimization = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const FIXED_ROWS = 16;
  const FIXED_COLS = 20;
  
  const [useBackground, setUseBackground] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [zoom, setZoom] = useState(100);
  const [drawMode, setDrawMode] = useState<DrawMode>("empty");
  const [machineType, setMachineType] = useState("preparo-solo");
  const [numMachines, setNumMachines] = useState("1");
  const [areaSize, setAreaSize] = useState("5000");
  const [soilType, setSoilType] = useState("arenoso");
  const [soilMoisture, setSoilMoisture] = useState("seco");
  const [terrainSlope, setTerrainSlope] = useState([5]);
  const [fuelConsumption, setFuelConsumption] = useState("12");
  const [maxOperationTime, setMaxOperationTime] = useState("8");
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [estimatedFuel, setEstimatedFuel] = useState<number | null>(null);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [calculatedPath, setCalculatedPath] = useState<Position[]>([]);
  const [coverageStats, setCoverageStats] = useState<{
    distanciaTotal: number;
    celulasCobertas: number;
    percentualCobertura: number;
  } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState([5]); // Agora é um multiplicador de velocidade (1-10)
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [machinePosition, setMachinePosition] = useState<Position | null>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const initializeGrid = () => {
    const newGrid: Cell[][] = [];
    for (let i = 0; i < FIXED_ROWS; i++) {
      newGrid[i] = [];
      for (let j = 0; j < FIXED_COLS; j++) {
        newGrid[i][j] = { type: "empty" };
      }
    }
    setGrid(newGrid);
    toast.success("Grid inicializado!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBackgroundUrl(url);
      setUseBackground(true);
      toast.success("Imagem carregada!");
    }
  };

  const handleCellClick = (rowIdx: number, colIdx: number) => {
    if (grid.length === 0) return;
    
    const newGrid = [...grid];
    newGrid[rowIdx][colIdx] = { type: drawMode };
    setGrid(newGrid);
  };

  const handleCellMouseEnter = (rowIdx: number, colIdx: number) => {
    if (isDrawing && grid.length > 0) {
      const newGrid = [...grid];
      newGrid[rowIdx][colIdx] = { type: drawMode };
      setGrid(newGrid);
    }
  };

  const handleClearGrid = () => {
    stopAnimation();
    initializeGrid();
    setCalculatedPath([]);
    setCoverageStats(null);
    setMachinePosition(null);
    setCurrentPathIndex(0);
    toast.success("Grid limpo!");
  };

  const stopAnimation = () => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }
    setIsAnimating(false);
  };

  const resetAnimation = () => {
    stopAnimation();
    setCurrentPathIndex(0);
    
    // Define a posição inicial da máquina
    if (calculatedPath.length > 0) {
      setMachinePosition(calculatedPath[0]);
    } else {
      setMachinePosition(null);
    }
    
    // Limpa a visualização do caminho, mas mantém os marcadores
    const newGrid: Cell[][] = grid.map(row => row.map(cell => {
      if (cell.type === "path") {
        return { type: "empty" as CellType };
      }
      return { ...cell };
    }));
    setGrid(newGrid);
  };

  const startAnimation = () => {
    if (calculatedPath.length === 0) {
      toast.error("Calcule uma rota primeiro!");
      return;
    }

    // Se já terminou, reseta
    if (currentPathIndex >= calculatedPath.length) {
      resetAnimation();
    }
    
    // Garante que a máquina comece no primeiro ponto da rota
    if (currentPathIndex === 0 && calculatedPath.length > 0) {
      setMachinePosition(calculatedPath[0]);
    }

    setIsAnimating(true);
  };

  const pauseAnimation = () => {
    stopAnimation();
  };

  // Effect para controlar a animação
  useEffect(() => {
    if (!isAnimating || calculatedPath.length === 0) return;

    // Calcula o intervalo baseado na velocidade (inverte para que valores maiores = mais rápido)
    // Velocidade vai de 1 (lento = 500ms) a 10 (rápido = 50ms)
    const interval = Math.max(50, 550 - (animationSpeed[0] * 50));

    animationIntervalRef.current = setInterval(() => {
      setCurrentPathIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;

        if (nextIndex >= calculatedPath.length) {
          stopAnimation();
          toast.success("Animação completa!");
          return prevIndex;
        }

        const currentPos = calculatedPath[nextIndex];
        setMachinePosition(currentPos);

        // Atualiza o grid para mostrar o caminho percorrido
        setGrid((prevGrid) => {
          const newGrid: Cell[][] = prevGrid.map(row => row.map(cell => ({ ...cell })));
          
          // Marca o caminho percorrido
          if (newGrid[currentPos.row][currentPos.col].type === "empty") {
            newGrid[currentPos.row][currentPos.col].type = "path";
          }

          return newGrid;
        });

        return nextIndex;
      });
    }, interval);

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [isAnimating, animationSpeed, calculatedPath]);

  const handleStartRoute = () => {
    if (grid.length === 0) {
      toast.error("Inicialize o grid primeiro!");
      return;
    }

    // Encontra posições de início e fim no grid
    const startPos = findPosition(grid, "start");
    const endPos = findPosition(grid, "end");

    if (!startPos) {
      toast.error("Marque um ponto de início no grid!");
      return;
    }

    if (!endPos) {
      toast.error("Marque um ponto de fim no grid!");
      return;
    }

    // Executa o algoritmo A*
    const path = aStar(grid, startPos, endPos);

    if (!path) {
      toast.error("Não foi possível encontrar uma rota! Verifique se há obstáculos bloqueando o caminho.");
      return;
    }

    // Atualiza o grid com o caminho calculado
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    
    for (const pos of path) {
      // Não sobrescreve início e fim
      if (newGrid[pos.row][pos.col].type !== "start" && 
          newGrid[pos.row][pos.col].type !== "end") {
        newGrid[pos.row][pos.col].type = "path";
      }
    }

    setGrid(newGrid);
    setCalculatedPath(path);
    
    const pathLength = path.length;
    toast.success(`Rota calculada! ${pathLength} células no caminho.`);
  };

  const getCellColor = (type: CellType, rowIdx: number, colIdx: number) => {
    const baseOpacity = "bg-opacity-60";
    
    // Destaca a posição atual da máquina durante a animação
    if (machinePosition && machinePosition.row === rowIdx && machinePosition.col === colIdx) {
      return "bg-green-500 animate-pulse";
    }
    
    switch (type) {
      case "empty": return `${isDarkTheme ? "bg-gray-700" : "bg-gray-300"} ${baseOpacity}`;
      case "obstacle": return `bg-red-600 ${baseOpacity}`;
      case "start": return `bg-yellow-500 ${baseOpacity}`;
      case "end": return `bg-purple-600 ${baseOpacity}`;
      case "machine": return `bg-green-500 ${baseOpacity}`;
      case "path": return `bg-blue-500 ${baseOpacity} animate-fade-in`;
      default: return `${isDarkTheme ? "bg-gray-700" : "bg-gray-300"} ${baseOpacity}`;
    }
  };

  const getCellIcon = (type: CellType, rowIdx: number, colIdx: number) => {
    // Mostra o trator na posição atual durante a animação
    if (machinePosition && machinePosition.row === rowIdx && machinePosition.col === colIdx) {
      return <Tractor className="w-4 h-4 text-white animate-scale-in" />;
    }
    
    switch (type) {
      case "empty": return <Circle className="w-3 h-3" />;
      case "obstacle": return <Square className="w-3 h-3" />;
      case "start": return <MapPin className="w-3 h-3" />;
      case "end": return <Flag className="w-3 h-3" />;
      case "machine": return <Tractor className="w-3 h-3" />;
      default: return <Circle className="w-3 h-3" />;
    }
  };

  const handleFullCoverage = () => {
    if (grid.length === 0) {
      toast.error("Inicialize o grid primeiro!");
      return;
    }

    // Converte o grid para matriz numérica (0=vazio, 1=obstáculo)
    const mapa: number[][] = grid.map(row =>
      row.map(cell => (cell.type === "obstacle" ? 1 : 0))
    );

    // Encontra o ponto de início (DEVE estar marcado como "start")
    const startPos = findPosition(grid, "start");
    
    if (!startPos) {
      toast.error("Marque um ponto de INÍCIO no grid antes de calcular a cobertura!");
      return;
    }

    const pontoInicial: Ponto = { row: startPos.row, col: startPos.col };

    // Verifica se há um ponto final marcado
    const endPos = findPosition(grid, "end");
    const pontoFinal: Ponto | undefined = endPos 
      ? { row: endPos.row, col: endPos.col }
      : undefined;

    if (pontoFinal) {
      toast.info("Calculando rota do ponto inicial até o ponto final...");
    } else {
      toast.info("Calculando rota de cobertura total a partir do ponto inicial...");
    }

    // Gera a rota otimizada começando do ponto inicial e indo até o ponto final (se existir)
    const rota = gerarRotaOtimizada(mapa, pontoInicial, pontoFinal);

    if (!rota || rota.length === 0) {
      toast.error("Não foi possível gerar uma rota de cobertura!");
      return;
    }

    // Atualiza o grid com a rota calculada
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    
    for (const pos of rota) {
      // Não sobrescreve início, fim ou máquina
      if (newGrid[pos.row][pos.col].type !== "start" && 
          newGrid[pos.row][pos.col].type !== "end" &&
          newGrid[pos.row][pos.col].type !== "machine") {
        newGrid[pos.row][pos.col].type = "path";
      }
    }

    setGrid(newGrid);
    setCalculatedPath(rota);
    
    // Inicializa a posição da máquina no ponto inicial
    setMachinePosition(rota[0]);
    setCurrentPathIndex(0);

    // Calcula estatísticas
    const stats = calcularEstatisticasRota(rota);
    
    // Calcula o percentual de cobertura
    const totalCelulasVazias = grid.flat().filter(cell => 
      cell.type === "empty" || cell.type === "start" || cell.type === "end" || cell.type === "machine"
    ).length;
    stats.percentualCobertura = totalCelulasVazias > 0 
      ? (stats.celulasCobertas / totalCelulasVazias) * 100 
      : 0;

    setCoverageStats(stats);

    toast.success(`Rota de cobertura calculada! ${rota.length} células, ${stats.percentualCobertura.toFixed(1)}% de cobertura.`);
  };

  const handleCalculateEstimates = () => {
    const area = parseFloat(areaSize);
    const fuel = parseFloat(fuelConsumption);
    const maxTime = parseFloat(maxOperationTime);
    const machines = parseInt(numMachines);
    const slope = terrainSlope[0];

    if (isNaN(area) || isNaN(fuel) || isNaN(maxTime) || area <= 0 || fuel <= 0 || maxTime <= 0) {
      toast.error("Por favor, preencha todos os campos corretamente!");
      return;
    }

    // Fórmula simplificada de estimativa
    // Considera tipo de solo, umidade, inclinação
    let efficiencyFactor = 1.0;
    
    // Ajuste por tipo de solo
    if (soilType === "argiloso") efficiencyFactor *= 0.85;
    else if (soilType === "arenoso") efficiencyFactor *= 1.1;
    
    // Ajuste por umidade
    if (soilMoisture === "úmido") efficiencyFactor *= 0.9;
    else if (soilMoisture === "encharcado") efficiencyFactor *= 0.75;
    
    // Ajuste por inclinação
    if (slope > 10) efficiencyFactor *= 0.8;
    else if (slope > 5) efficiencyFactor *= 0.9;

    // Rendimento base: 1000 m²/h por máquina
    const baseRate = 1000 * efficiencyFactor;
    const totalRate = baseRate * machines;
    
    const calculatedTime = area / totalRate;
    const calculatedFuel = calculatedTime * fuel * machines;

    setEstimatedTime(parseFloat(calculatedTime.toFixed(2)));
    setEstimatedFuel(parseFloat(calculatedFuel.toFixed(2)));

    toast.success("Estimativas calculadas!");
  };

  return (
    <div className={`min-h-screen w-full ${isDarkTheme ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Header */}
      <header className={`${isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} border-b py-4 px-6`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={ormaLogo} alt="Orma Logo" className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Simulador de Rotas de Máquinas Agrícolas</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className={isDarkTheme ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}
            >
              {isDarkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="text-green-600 border-green-600 hover:text-red-600 hover:border-red-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Columns */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column - Terrain Configuration */}
          <div className="lg:col-span-3">
            <Card className={isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle className={`text-xl ${isDarkTheme ? "text-white" : "text-gray-900"}`}>
                  Configuração do Terreno
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className={isDarkTheme ? "text-gray-300" : "text-gray-700"}>Dimensões Fixas</Label>
                  <div className={`p-4 rounded-lg ${isDarkTheme ? "bg-gray-800" : "bg-gray-100"}`}>
                    <p className={`text-lg font-semibold ${isDarkTheme ? "text-white" : "text-gray-900"}`}>
                      {FIXED_ROWS} linhas × {FIXED_COLS} colunas
                    </p>
                    <p className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-600"}`}>
                      Dimensões otimizadas para visualização
                    </p>
                  </div>
                </div>

                <div className={`space-y-3 pt-4 border-t ${isDarkTheme ? "border-gray-800" : "border-gray-200"}`}>
                  <h3 className={`font-semibold ${isDarkTheme ? "text-white" : "text-gray-900"}`}>Imagem de Fundo</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="background"
                      checked={useBackground}
                      onCheckedChange={(checked) => setUseBackground(checked as boolean)}
                    />
                    <label htmlFor="background" className={`text-sm ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}>
                      Usar Imagem de Fundo
                    </label>
                  </div>
                  
                  <Button
                    variant="outline"
                    className={`w-full ${isDarkTheme ? "bg-gray-800 border-gray-700 text-white hover:bg-gray-700" : "bg-white border-gray-300 hover:bg-gray-50"}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Carregar Imagem
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  
                  <div className="space-y-1">
                    <Label className={`text-xs ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}>Ou cole uma URL:</Label>
                    <Input
                      placeholder="https://exemplo.com/terreno.jpg"
                      value={backgroundUrl}
                      onChange={(e) => setBackgroundUrl(e.target.value)}
                      className={`text-sm ${isDarkTheme ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                    />
                  </div>
                </div>

                <Button
                  onClick={initializeGrid}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Inicializar Grid
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Grid Visualization */}
          <div className="lg:col-span-6">
            <Card className={isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={isDarkTheme ? "text-white" : "text-gray-900"}>Visualização do Terreno</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className={isDarkTheme ? "bg-gray-800 border-gray-700 text-white hover:bg-gray-700" : "bg-white border-gray-300 hover:bg-gray-50"}
                      onClick={() => setZoom(Math.max(50, zoom - 10))}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className={`text-sm w-16 text-center ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}>{zoom}%</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className={isDarkTheme ? "bg-gray-800 border-gray-700 text-white hover:bg-gray-700" : "bg-white border-gray-300 hover:bg-gray-50"}
                      onClick={() => setZoom(Math.min(200, zoom + 10))}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`${isDarkTheme ? "bg-gray-950" : "bg-gray-100"} rounded-lg p-4 overflow-auto max-h-[600px]`}>
                  {grid.length === 0 ? (
                    <div className={`h-96 flex items-center justify-center ${isDarkTheme ? "text-gray-500" : "text-gray-400"}`}>
                      <p>Inicialize o grid para começar</p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${FIXED_COLS}, 1fr)`,
                        gap: "2px",
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: "top left",
                        backgroundImage: useBackground && backgroundUrl ? `url(${backgroundUrl})` : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                      onMouseDown={() => setIsDrawing(true)}
                      onMouseUp={() => setIsDrawing(false)}
                      onMouseLeave={() => setIsDrawing(false)}
                    >
                      {grid.map((row, rowIdx) =>
                        row.map((cell, colIdx) => (
                          <div
                            key={`${rowIdx}-${colIdx}`}
                            className={`w-6 h-6 border ${isDarkTheme ? "border-gray-800" : "border-gray-300"} rounded-sm cursor-pointer flex items-center justify-center ${getCellColor(cell.type, rowIdx, colIdx)} hover:opacity-80 transition-all duration-200`}
                            onClick={() => handleCellClick(rowIdx, colIdx)}
                            onMouseEnter={() => handleCellMouseEnter(rowIdx, colIdx)}
                          >
                            {(cell.type !== "empty" || (machinePosition && machinePosition.row === rowIdx && machinePosition.col === colIdx)) && 
                              getCellIcon(cell.type, rowIdx, colIdx)}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Drawing Mode */}
          <div className="lg:col-span-3 flex flex-col">
            {/* Drawing Mode Card */}
            <Card className={`${isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} flex flex-col h-full`}>
              <CardHeader>
                <CardTitle className={isDarkTheme ? "text-white" : "text-gray-900"}>Modo de Desenho</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 flex-1 flex flex-col justify-center">
                {[
                  { value: "empty", label: "Vazio", icon: Circle },
                  { value: "obstacle", label: "Obstáculo", icon: Square },
                  { value: "start", label: "Início", icon: MapPin },
                ].map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.value}
                      onClick={() => setDrawMode(mode.value as DrawMode)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        drawMode === mode.value
                          ? "bg-blue-600 border-blue-500 text-white"
                          : isDarkTheme
                          ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-750"
                          : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Bottom Section - Parameters and Estimates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Parameters Card */}
          <Card className={isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}>
            <CardHeader>
              <CardTitle className={isDarkTheme ? "text-white" : "text-gray-900"}>Parâmetros de Estimativa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Tipo de Maquinário */}
              <div className="space-y-2">
                <Label className={isDarkTheme ? "text-gray-300" : "text-gray-700"}>Tipo de Maquinário</Label>
                <Select value={machineType} onValueChange={setMachineType}>
                  <SelectTrigger className={isDarkTheme ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preparo-solo">Preparo do solo (Arado/Cultivador)</SelectItem>
                    <SelectItem value="plantio">Plantio/Semeadura</SelectItem>
                    <SelectItem value="pulverizacao">Pulverização</SelectItem>
                    <SelectItem value="colheita">Colheita</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Número de Máquinas */}
              <div className="space-y-2">
                <Label className={isDarkTheme ? "text-gray-300" : "text-gray-700"}>Número de Máquinas</Label>
                <Select value={numMachines} onValueChange={setNumMachines}>
                  <SelectTrigger className={isDarkTheme ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={String(num)}>
                        {num} {num === 1 ? "Máquina" : "Máquinas"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tamanho da Área */}
              <div className="space-y-2">
                <Label className={isDarkTheme ? "text-gray-300" : "text-gray-700"}>
                  Tamanho da Área (m²)
                </Label>
                <Input
                  type="number"
                  value={areaSize}
                  onChange={(e) => setAreaSize(e.target.value)}
                  className={isDarkTheme ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}
                />
              </div>

              {/* Tipo de Solo */}
              <div className="space-y-2">
                <Label className={isDarkTheme ? "text-gray-300" : "text-gray-700"}>Tipo de Solo</Label>
                <Select value={soilType} onValueChange={setSoilType}>
                  <SelectTrigger className={isDarkTheme ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arenoso">Arenoso</SelectItem>
                    <SelectItem value="argiloso">Argiloso</SelectItem>
                    <SelectItem value="areno-argiloso">Areno-Argiloso</SelectItem>
                    <SelectItem value="organico">Orgânico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Umidade do Solo */}
              <div className="space-y-2">
                <Label className={isDarkTheme ? "text-gray-300" : "text-gray-700"}>Umidade do Solo</Label>
                <Select value={soilMoisture} onValueChange={setSoilMoisture}>
                  <SelectTrigger className={isDarkTheme ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seco">Seco</SelectItem>
                    <SelectItem value="úmido">Úmido</SelectItem>
                    <SelectItem value="encharcado">Encharcado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Inclinação do Terreno */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className={isDarkTheme ? "text-gray-300" : "text-gray-700"}>Inclinação do Terreno</Label>
                  <span className={`text-sm font-semibold ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}>
                    {terrainSlope[0]}%
                  </span>
                </div>
                <Slider
                  value={terrainSlope}
                  onValueChange={setTerrainSlope}
                  min={0}
                  max={30}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Consumo de Combustível */}
              <div className="space-y-2">
                <Label className={isDarkTheme ? "text-gray-300" : "text-gray-700"}>
                  Consumo de Combustível (L/h)
                </Label>
                <Input
                  type="number"
                  value={fuelConsumption}
                  onChange={(e) => setFuelConsumption(e.target.value)}
                  className={isDarkTheme ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}
                />
              </div>

              {/* Tempo Máximo de Operação */}
              <div className="space-y-2">
                <Label className={isDarkTheme ? "text-gray-300" : "text-gray-700"}>
                  Tempo Máximo de Operação (h)
                </Label>
                <Input
                  type="number"
                  value={maxOperationTime}
                  onChange={(e) => setMaxOperationTime(e.target.value)}
                  className={isDarkTheme ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}
                />
              </div>

              {/* Calculate Button */}
              <Button
                onClick={handleCalculateEstimates}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calcular Estimativas
              </Button>
            </CardContent>
          </Card>

          {/* Estimates Results Card */}
          <Card className={isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}>
            <CardHeader>
              <CardTitle className={isDarkTheme ? "text-white" : "text-gray-900"}>Estimativas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={`p-3 rounded-lg ${isDarkTheme ? "bg-gray-800" : "bg-gray-100"}`}>
                <Label className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-600"}`}>
                  Área Total
                </Label>
                <p className={`text-lg font-semibold ${isDarkTheme ? "text-white" : "text-gray-900"}`}>
                  {areaSize} m²
                </p>
              </div>

              <div className={`p-3 rounded-lg ${isDarkTheme ? "bg-gray-800" : "bg-gray-100"}`}>
                <Label className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-600"}`}>
                  Tempo Estimado
                </Label>
                <p className={`text-lg font-semibold ${isDarkTheme ? "text-white" : "text-gray-900"}`}>
                  {estimatedTime !== null ? `${estimatedTime} h` : "—"}
                </p>
              </div>

              <div className={`p-3 rounded-lg ${isDarkTheme ? "bg-gray-800" : "bg-gray-100"}`}>
                <Label className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-600"}`}>
                  Combustível Estimado
                </Label>
                <p className={`text-lg font-semibold ${isDarkTheme ? "text-white" : "text-gray-900"}`}>
                  {estimatedFuel !== null ? `${estimatedFuel} L` : "—"}
                </p>
              </div>

              {/* Coverage Stats */}
              {coverageStats && (
                <>
                  <div className={`p-3 rounded-lg ${isDarkTheme ? "bg-green-900/30 border border-green-700" : "bg-green-100 border border-green-300"}`}>
                    <Label className={`text-sm ${isDarkTheme ? "text-green-400" : "text-green-700"}`}>
                      Distância Total da Rota
                    </Label>
                    <p className={`text-lg font-semibold ${isDarkTheme ? "text-green-300" : "text-green-900"}`}>
                      {coverageStats.distanciaTotal} células
                    </p>
                  </div>

                  <div className={`p-3 rounded-lg ${isDarkTheme ? "bg-green-900/30 border border-green-700" : "bg-green-100 border border-green-300"}`}>
                    <Label className={`text-sm ${isDarkTheme ? "text-green-400" : "text-green-700"}`}>
                      Células Cobertas
                    </Label>
                    <p className={`text-lg font-semibold ${isDarkTheme ? "text-green-300" : "text-green-900"}`}>
                      {coverageStats.celulasCobertas} células
                    </p>
                  </div>

                  <div className={`p-3 rounded-lg ${isDarkTheme ? "bg-green-900/30 border border-green-700" : "bg-green-100 border border-green-300"}`}>
                    <Label className={`text-sm ${isDarkTheme ? "text-green-400" : "text-green-700"}`}>
                      Percentual de Cobertura
                    </Label>
                    <p className={`text-lg font-semibold ${isDarkTheme ? "text-green-300" : "text-green-900"}`}>
                      {coverageStats.percentualCobertura.toFixed(1)}%
                    </p>
                  </div>
                </>
              )}

              {/* Animation Controls */}
              {calculatedPath.length > 0 && (
                <div className={`p-4 rounded-lg space-y-3 ${isDarkTheme ? "bg-gray-800 border border-gray-700" : "bg-gray-100 border border-gray-300"}`}>
                  <Label className={`text-sm font-semibold ${isDarkTheme ? "text-white" : "text-gray-900"}`}>
                    Controles de Animação
                  </Label>
                  
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      onClick={isAnimating ? pauseAnimation : startAnimation}
                      className={`flex-1 ${isAnimating ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"} text-white`}
                      disabled={calculatedPath.length === 0}
                    >
                      {isAnimating ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Animar
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={resetAnimation}
                      variant="outline"
                      className={`${isDarkTheme ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600" : "bg-white border-gray-300 hover:bg-gray-50"}`}
                      disabled={calculatedPath.length === 0}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className={`text-xs ${isDarkTheme ? "text-gray-400" : "text-gray-600"}`}>
                        Velocidade da Animação
                      </Label>
                      <span className={`text-xs font-semibold ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}>
                        {animationSpeed[0]}x
                      </span>
                    </div>
                    <Slider
                      value={animationSpeed}
                      onValueChange={setAnimationSpeed}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                      disabled={isAnimating}
                    />
                    <p className={`text-xs ${isDarkTheme ? "text-gray-500" : "text-gray-500"}`}>
                      {animationSpeed[0] <= 3 ? "Lenta" : animationSpeed[0] <= 6 ? "Média" : "Rápida"}
                    </p>
                  </div>

                  <div className={`text-xs ${isDarkTheme ? "text-gray-400" : "text-gray-600"}`}>
                    Progresso: {currentPathIndex} / {calculatedPath.length} células
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 space-y-3">
                <Button
                  onClick={handleFullCoverage}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isAnimating}
                >
                  <Tractor className="w-4 h-4 mr-2" />
                  Cobertura Total
                </Button>
                <Button
                  onClick={handleClearGrid}
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Limpar Grid
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RouteOptimization;