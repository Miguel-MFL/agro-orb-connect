import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tractor, ArrowLeft, Circle, Square, ZoomIn, ZoomOut, MapPin, Flag, Sun, Moon } from "lucide-react";
import { toast } from "sonner";

type CellType = "empty" | "obstacle" | "start" | "end" | "machine";
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
  const [machineType, setMachineType] = useState("tractor");
  const [soilType, setSoilType] = useState("clay");
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

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
    initializeGrid();
    toast.success("Grid limpo!");
  };

  const handleStartRoute = () => {
    if (grid.length === 0) {
      toast.error("Aplique as dimensões primeiro!");
      return;
    }
    toast.success("Rota iniciada!");
  };

  const getCellColor = (type: CellType) => {
    const baseOpacity = "bg-opacity-60";
    switch (type) {
      case "empty": return `${isDarkTheme ? "bg-gray-700" : "bg-gray-300"} ${baseOpacity}`;
      case "obstacle": return `bg-red-600 ${baseOpacity}`;
      case "start": return `bg-yellow-500 ${baseOpacity}`;
      case "end": return `bg-purple-600 ${baseOpacity}`;
      case "machine": return `bg-green-500 ${baseOpacity}`;
      default: return `${isDarkTheme ? "bg-gray-700" : "bg-gray-300"} ${baseOpacity}`;
    }
  };

  const getCellIcon = (type: CellType) => {
    switch (type) {
      case "empty": return <Circle className="w-3 h-3" />;
      case "obstacle": return <Square className="w-3 h-3" />;
      case "start": return <MapPin className="w-3 h-3" />;
      case "end": return <Flag className="w-3 h-3" />;
      case "machine": return <Tractor className="w-3 h-3" />;
      default: return <Circle className="w-3 h-3" />;
    }
  };

  return (
    <div className={`min-h-screen w-full ${isDarkTheme ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Header */}
      <header className={`${isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} border-b py-4 px-6`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tractor className="w-8 h-8 text-blue-500" />
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
                            className={`w-6 h-6 border ${isDarkTheme ? "border-gray-800" : "border-gray-300"} rounded-sm cursor-pointer flex items-center justify-center ${getCellColor(cell.type)} hover:opacity-80 transition-opacity`}
                            onClick={() => handleCellClick(rowIdx, colIdx)}
                            onMouseEnter={() => handleCellMouseEnter(rowIdx, colIdx)}
                          >
                            {cell.type !== "empty" && getCellIcon(cell.type)}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Simulation Controls */}
          <div className="lg:col-span-3">
            <Card className={isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle className={isDarkTheme ? "text-white" : "text-gray-900"}>Controles da Simulação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Drawing Mode */}
                <div className="space-y-3">
                  <h3 className={`font-semibold ${isDarkTheme ? "text-white" : "text-gray-900"}`}>Modo de Desenho</h3>
                  <div className="space-y-2">
                    {[
                      { value: "empty", label: "Vazio", icon: Circle },
                      { value: "obstacle", label: "Obstáculo", icon: Square },
                      { value: "start", label: "Início", icon: MapPin },
                      { value: "end", label: "Fim", icon: Flag },
                      { value: "machine", label: "Máquina", icon: Tractor },
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
                  </div>
                </div>

                {/* Machine Type */}
                <div className="space-y-3">
                  <h3 className={`font-semibold ${isDarkTheme ? "text-white" : "text-gray-900"}`}>Tipo de Maquinário</h3>
                  <Select value={machineType} onValueChange={setMachineType}>
                    <SelectTrigger className={isDarkTheme ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tractor">Trator</SelectItem>
                      <SelectItem value="harvester">Colheitadeira</SelectItem>
                      <SelectItem value="sprayer">Pulverizador</SelectItem>
                      <SelectItem value="planter">Plantadeira</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Soil Type */}
                <div className="space-y-3">
                  <h3 className={`font-semibold ${isDarkTheme ? "text-white" : "text-gray-900"}`}>Tipo de Solo</h3>
                  <Select value={soilType} onValueChange={setSoilType}>
                    <SelectTrigger className={isDarkTheme ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clay">Solo Argiloso</SelectItem>
                      <SelectItem value="sandy">Solo Arenoso</SelectItem>
                      <SelectItem value="loamy">Solo Areno-Argiloso</SelectItem>
                      <SelectItem value="organic">Solo Orgânico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleStartRoute}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Iniciar Rota
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
    </div>
  );
};

export default RouteOptimization;