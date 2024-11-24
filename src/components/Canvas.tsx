// src/components/Canvas.tsx

import React, { useState } from 'react';
import { Box } from '@mui/material';

interface CanvasProps {
  grid: number[][];
  setGrid: React.Dispatch<React.SetStateAction<number[][]>>;
  paletteColors: string[];
  selectedPaletteIndex: number;
  tool: 'brush' | 'eyedropper' | 'fill' | 'select';
  setSelectedColorIndex: (index: number) => void;
  selection: Selection | null;
  setSelection: (selection: Selection | null) => void;
  backgroundColorIndex: number;
  isSelecting: boolean;
  setIsSelecting: (selecting: boolean) => void;
  moveOffset: { dx: number; dy: number };
  setMoveOffset: (offset: { dx: number; dy: number }) => void;
}

interface Selection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const Canvas: React.FC<CanvasProps> = ({
  grid,
  setGrid,
  paletteColors,
  selectedPaletteIndex,
  tool,
  setSelectedColorIndex,
  selection,
  setSelection,
  backgroundColorIndex,
  isSelecting,
  setIsSelecting,
  moveOffset,
  setMoveOffset,
}) => {
  const [isPainting, setIsPainting] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);

  const gridSize = 40; // グリッドサイズ（40x40）

  const handleInteract = (x: number, y: number) => {
    if (tool === 'eyedropper') {
      setSelectedColorIndex(grid[y][x]);
    } else if (tool === 'brush' || tool === 'fill') {
      if (tool === 'brush') {
        if (grid[y][x] !== selectedPaletteIndex) {
          const newGrid = grid.map(row => row.slice());
          newGrid[y][x] = selectedPaletteIndex;
          setGrid(newGrid);
        }
      } else if (tool === 'fill') {
        const targetIndex = grid[y][x];
        if (targetIndex !== selectedPaletteIndex) {
          fillColor(x, y, targetIndex);
        }
      }
    }
  };

  const fillColor = (x: number, y: number, targetIndex: number) => {
    const newGrid = grid.map(row => row.slice());
    const stack: [number, number][] = [[x, y]];
    while (stack.length > 0) {
      const [cx, cy] = stack.pop()!;
      if (
        cx >= 0 &&
        cx < gridSize &&
        cy >= 0 &&
        cy < gridSize &&
        newGrid[cy][cx] === targetIndex
      ) {
        newGrid[cy][cx] = selectedPaletteIndex;
        stack.push([cx + 1, cy]);
        stack.push([cx - 1, cy]);
        stack.push([cx, cy + 1]);
        stack.push([cx, cy - 1]);
      }
    }
    setGrid(newGrid);
  };

  const handleMouseDown = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    if (tool === 'select') {
      setIsSelecting(true);
      setStartPos({ x, y });
      setCurrentPos({ x, y });
      setMoveOffset({ dx: 0, dy: 0 });
    } else {
      setIsPainting(true);
      handleInteract(x, y);
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && tool === 'select' && startPos && currentPos) {
      const x1 = Math.min(startPos.x, currentPos.x);
      const y1 = Math.min(startPos.y, currentPos.y);
      const x2 = Math.max(startPos.x, currentPos.x);
      const y2 = Math.max(startPos.y, currentPos.y);
      setSelection({ x1, y1, x2, y2 });
    }
    if (isPainting) {
      setIsPainting(false);
    }
    setIsSelecting(false);
    setStartPos(null);
    setCurrentPos(null);
  };

  const handleMouseOver = (e: React.MouseEvent, x: number, y: number) => {
    if (tool === 'select' && isSelecting) {
      setCurrentPos({ x, y });
    } else if ((tool === 'brush' || tool === 'fill') && isPainting) {
      handleInteract(x, y);
    }
  };

  const getSelectionStyle = () => {
    if (!selection) return {};
    const { x1, y1, x2, y2 } = selection;
    const { dx, dy } = moveOffset;

    const left = ((x1 + dx) / gridSize) * 100;
    const top = ((y1 + dy) / gridSize) * 100;
    const width = ((x2 - x1 + 1) / gridSize) * 100;
    const height = ((y2 - y1 + 1) / gridSize) * 100;

    return {
      position: 'absolute' as const,
      border: '2px dashed #000',
      left: `${left}%`,
      top: `${top}%`,
      width: `${width}%`,
      height: `${height}%`,
      pointerEvents: 'none',
      boxSizing: 'border-box' as const,
      zIndex: 1,
    };
  };

  const getMovedSelectionPixels = () => {
    if (!selection || (moveOffset.dx === 0 && moveOffset.dy === 0)) return [];
    const { x1, y1, x2, y2 } = selection;
    const { dx, dy } = moveOffset;
    const movedPixels: { x: number; y: number; color: string }[] = [];
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        const newX = x + dx;
        const newY = y + dy;
        if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
          movedPixels.push({
            x: newX,
            y: newY,
            color: paletteColors[grid[y][x]],
          });
        }
      }
    }
    return movedPixels;
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        paddingTop: '100%', // 正方形のアスペクト比を維持
        border: '1px solid #000',
        cursor: 'crosshair',
        userSelect: 'none',
        overflow: 'hidden',
      }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {grid.map((row, y) =>
          row.map((paletteIndex, x) => {

            return (
              <Box
                key={`${x}-${y}`}
                sx={{
                  border: '1px solid #ddd',
                  backgroundColor: paletteColors[paletteIndex],
                }}
                onMouseDown={e => handleMouseDown(e, x, y)}
                onMouseOver={e => handleMouseOver(e, x, y)}
              />
            );
          })
        )}
      </Box>
      {/* 選択範囲のオーバーレイ */}
      {selection && <Box sx={getSelectionStyle()} />}
      {/* 移動中の選択範囲のオーバーレイ */}
      {selection &&
        (moveOffset.dx !== 0 || moveOffset.dy !== 0) &&
        getMovedSelectionPixels().map(pixel => (
          <Box
            key={`moved-${pixel.x}-${pixel.y}`}
            sx={{
              position: 'absolute',
              left: `${(pixel.x / gridSize) * 100}%`,
              top: `${(pixel.y / gridSize) * 100}%`,
              width: `${(1 / gridSize) * 100}%`,
              height: `${(1 / gridSize) * 100}%`,
              backgroundColor: pixel.color,
              pointerEvents: 'none',
              opacity: 1,
              border: '1px solid #ddd',
            }}
          />
        ))}
    </Box>
  );
};

export default Canvas;