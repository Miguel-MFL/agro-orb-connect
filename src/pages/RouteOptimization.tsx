import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tractor, ArrowLeft, Circle, Square, ZoomIn, ZoomOut, MapPin, Flag } from "lucide-react";
import { toast } from "sonner";

type CellType = "empty" | "obstacle" | "start" | "end" | "machine";
type DrawMode = CellType;

interface Cell {
  type: CellType;
}

const RouteOptimization = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [rows, setRows] = useState(16);
  const [cols, setCols] = useState(24);
  const [useBackground, setUseBackground] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [zoom, setZoom] = useState(100);
  const [drawMode, setDrawMode] = useState<DrawMode>("empty");
  const [machineType, setMachineType] = useState("tractor");
  const [soilType, setSoilType] = useState("clay");
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const initializeGrid = (r: number, c: number) => {
    const newGrid: Cell[][] = [];
    for (let i = 0; i < r; i++) {
      newGrid[i] = [];
      for (let j = 0; j < c; j++) {
        newGrid[i][j] = { type: "empty" };
      }
    }
    setGrid(newGrid);
  };

  const handleApplyDimensions = () => {
    if (rows < 5 || rows > 40) {
      toast.error("Linhas devem estar entre 5 e 40");
      return;
    }
    if (cols < 5 || cols > 50) {
      toast.error("Colunas devem estar entre 5 e 50");
      return;
    }
    initializeGrid(rows, cols);
    toast.success("Dimensões aplicadas!");
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
    initializeGrid(rows, cols);
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
    switch (type) {
      case "empty": return "bg-gray-700";
      case "obstacle": return "bg-red-600";
      case "start": return "bg-yellow-500";
      case "end": return "bg-purple-600";
      case "machine": return "bg-green-500";
      default: return "bg-gray-700";
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
    <div className="min-h-screen w-full bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tractor className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold">Simulador de Rotas de Máquinas Agrícolas</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="text-green-600 border-green-600 hover:text-red-600 hover:border-red-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Main Content - 3 Columns */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column - Terrain Configuration */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">Dimensões do Terreno</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Linhas (Altura)</Label>
                    <Input
                      type="number"
                      min={5}
                      max={40}
                      value={rows}
                      onChange={(e) => setRows(Number(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <p className="text-xs text-gray-500">5 a 40 linhas</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Colunas (Largura)</Label>
                    <Input
                      type="number"
                      min={5}
                      max={50}
                      value={cols}
                      onChange={(e) => setCols(Number(e.target.value))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <p className="text-xs text-gray-500">5 a 50 colunas</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-800">
                  <h3 className="font-semibold text-white">Imagem de Fundo</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="background"
                      checked={useBackground}
                      onCheckedChange={(checked) => setUseBackground(checked as boolean)}
                    />
                    <label htmlFor="background" className="text-sm text-gray-300">
                      Imagem de Fundo
                    </label>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
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
                    <Label className="text-gray-300 text-xs">Ou cole uma URL:</Label>
                    <Input
                      placeholder="https://exemplo.com/terreno.jpg"
                      value={backgroundUrl}
                      onChange={(e) => setBackgroundUrl(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white text-sm"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleApplyDimensions}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Aplicar Dimensões
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Grid Visualization */}
          <div className="lg:col-span-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Visualização do Terreno</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                      onClick={() => setZoom(Math.max(50, zoom - 10))}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-300 w-16 text-center">{zoom}%</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                      onClick={() => setZoom(Math.min(200, zoom + 10))}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-950 rounded-lg p-4 overflow-auto max-h-[600px]">
                  {grid.length === 0 ? (
                    <div className="h-96 flex items-center justify-center text-gray-500">
                      <p>Aplique as dimensões para visualizar o grid</p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
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
                            className={`w-6 h-6 border border-gray-800 rounded-sm cursor-pointer flex items-center justify-center ${getCellColor(cell.type)} hover:opacity-80 transition-opacity`}
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
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Controles da Simulação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Drawing Mode */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-white">Modo de Desenho</h3>
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
                              : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-750"
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
                  <h3 className="font-semibold text-white">Tipo de Maquinário</h3>
                  <Select value={machineType} onValueChange={setMachineType}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
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
                  <h3 className="font-semibold text-white">Tipo de Solo</h3>
                  <Select value={soilType} onValueChange={setSoilType}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
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