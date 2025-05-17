import React, { useRef, useEffect, useState } from 'react';

interface CanvasProps {
  width?: number;
  height?: number;
}

interface CanvasSize {
  width: number;
  height: number;
}

const Canvas: React.FC<CanvasProps> = ({ width = 800, height = 600 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width, height });
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [aiGuess, setAiGuess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    setContext(ctx);
  }, [color, lineWidth]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context || isLoading) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || isLoading) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!context || !canvasRef.current || isLoading) return;
    context.closePath();
    setIsDrawing(false);
    // Save canvas state to history
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, canvasRef.current.toDataURL()]);
    setHistoryIndex(newHistory.length);
  };

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    // Clear history as well
    setHistory([]);
    setHistoryIndex(-1);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const prevIndex = historyIndex - 1;
    setHistoryIndex(prevIndex);
    const img = new Image();
    img.onload = () => {
      if (context && canvasRef.current) {
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        context.drawImage(img, 0, 0);
      }
    };
    img.src = history[prevIndex];
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    const img = new Image();
    img.onload = () => {
      if (context && canvasRef.current) {
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        context.drawImage(img, 0, 0);
      }
    };
    img.src = history[nextIndex];
  };

  const handleGuess = async () => {
    if (!canvasRef.current) return;

    setIsLoading(true);
    setAiGuess(null); // Clear previous guess

    const originalCanvas = canvasRef.current;
    const scaleFactor = 0.5; // 缩放因子，这里设置为0.5，即缩小一半
    const scaledWidth = originalCanvas.width * scaleFactor;
    const scaledHeight = originalCanvas.height * scaleFactor;

    // 创建一个临时的 canvas 元素用于缩放
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = scaledWidth;
    tempCanvas.height = scaledHeight;
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) {
      console.error('Failed to get temporary canvas context');
      return;
    }

    // 将原始 canvas 内容绘制到临时 canvas 上，实现缩放
    tempCtx.drawImage(originalCanvas, 0, 0, scaledWidth, scaledHeight);

    // 从临时 canvas 获取缩放后的图片数据
    const imageDataUrl = tempCanvas.toDataURL('image/png'); // 可以指定图片格式，这里使用png

    try {
      const response = await fetch('http://localhost:3000/api/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData: imageDataUrl }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Guess result:', result);
      setAiGuess(result.guess);

    } catch (error) {
      console.error('Error sending image data:', error);
      setAiGuess('Error getting guess.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    setCanvasSize(prev => ({
      ...prev,
      [dimension]: value
    }));
  };

  return (
    <div className="canvas-container">
      <div className="canvas-controls">
        <div className="control-group">
          <label>画笔颜色：</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
        <div className="control-group">
          <label>画笔粗细：</label>
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
          />
        </div>
        <div className="control-group">
          <label>画布宽度：</label>
          <input
            type="number"
            min="200"
            max="1200"
            value={canvasSize.width}
            onChange={(e) => handleSizeChange('width', Number(e.target.value))}
          />
        </div>
        <div className="control-group">
          <label>画布高度：</label>
          <input
            type="number"
            min="200"
            max="1200"
            value={canvasSize.height}
            onChange={(e) => handleSizeChange('height', Number(e.target.value))}
          />
        </div>
        <button onClick={clearCanvas}>清除画布</button>
        <button onClick={undo} disabled={historyIndex <= 0}>撤销</button>
        <button onClick={redo} disabled={historyIndex >= history.length - 1}>重做</button>
      </div>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ border: '1px solid #ccc' }}
      />
      <div className="controls">
        <button onClick={handleGuess} disabled={isLoading}>猜猜看</button>
      </div>
      {isLoading && (
        <div ref={resultRef} className="ai-guess-result">
          <h2>AI 的猜测</h2>
          <p>思考中...</p>
        </div>
      )}
      {aiGuess !== null && !isLoading && (
        <div ref={resultRef} className="ai-guess-result">
          <h2>AI 的猜测</h2>
          <p>{aiGuess}</p>
        </div>
      )}
    </div>
  );
};

export default Canvas;