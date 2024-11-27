// src/components/Canvas.tsx

import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';

interface Selection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

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
  gridSize: number;
  backgroundImage: string | null; // 追加
  backgroundOpacity: number; // 追加
  isBackgroundImageOn: boolean; // 追加
}

const Canvas: React.FC<CanvasProps> = React.memo(({
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
  gridSize,
  backgroundImage, // 追加
  backgroundOpacity, // 追加
  isBackgroundImageOn, // 追加
}) => {
  const [isPainting, setIsPainting] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number } | null>(null); // 追加

  // 塗りつぶし関数
  const fillColor = useCallback((x: number, y: number, targetIndex: number) => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => row.slice());
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
      return newGrid;
    });
  }, [gridSize, selectedPaletteIndex, setGrid]);

  // ツールに応じたインタラクションハンドラ
  const handleInteract = useCallback((x: number, y: number) => {
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return; // 範囲外チェックを追加
    if (tool === 'eyedropper') {
      setSelectedColorIndex(grid[y][x]);
    }
    else if (tool === 'brush') {
      if (grid[y][x] !== selectedPaletteIndex) {
        setGrid(prevGrid => {
          const newGrid = [...prevGrid];
          newGrid[y][x] = selectedPaletteIndex;
          return newGrid;
        });
      }
    }
    else if (tool === 'fill') {
      const targetIndex = grid[y][x];
      if (targetIndex !== selectedPaletteIndex) {
        fillColor(x, y, targetIndex);
      }
    }
  }, [tool, grid, selectedPaletteIndex, setSelectedColorIndex, setGrid, fillColor, gridSize]);

  // Bresenhamのアルゴリズムを用いた2点間のセル取得関数
  const getLinePoints = useCallback((x0: number, y0: number, x1: number, y1: number) => {
    const points: { x: number; y: number }[] = [];

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      points.push({ x: x0, y: y0 });

      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }

    return points;
  }, []);

  // マウスダウンハンドラ
  const handleMouseDown = useCallback((e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    if (tool === 'select') {
      setIsSelecting(true);
      setStartPos({ x, y });
      setCurrentPos({ x, y });
      setMoveOffset({ dx: 0, dy: 0 });
    } else {
      setIsPainting(true);
      handleInteract(x, y);
      setLastMousePos({ x, y }); // 追加
    }
  }, [tool, setIsSelecting, handleInteract, setMoveOffset]);

  // マウスアップハンドラ
  const handleMouseUp = useCallback(() => {
    if (isSelecting && tool === 'select' && startPos && currentPos) {
      const x1 = Math.min(startPos.x, currentPos.x);
      const y1 = Math.min(startPos.y, currentPos.y);
      const x2 = Math.max(startPos.x, currentPos.x);
      const y2 = Math.max(startPos.y, currentPos.y);
      setSelection({ x1, y1, x2, y2 });
    }
    if (isPainting) {
      setIsPainting(false);
      setLastMousePos(null); // 追加
    }
    setIsSelecting(false);
    setStartPos(null);
    setCurrentPos(null);
  }, [isSelecting, tool, startPos, currentPos, setSelection, isPainting, setIsSelecting]);

  // マウスオーバーハンドラ
  const handleMouseOver = useCallback((e: React.MouseEvent, x: number, y: number) => {
    if (tool === 'select' && isSelecting) {
      setCurrentPos({ x, y });
    } else if ((tool === 'brush' || tool === 'fill') && isPainting) {
      if (lastMousePos) {
        const points = getLinePoints(lastMousePos.x, lastMousePos.y, x, y);
        points.forEach(point => {
          handleInteract(point.x, point.y);
        });
      } else {
        handleInteract(x, y);
      }
      setLastMousePos({ x, y });
    }
  }, [tool, isSelecting, isPainting, handleInteract, lastMousePos, getLinePoints]);


  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        paddingTop: '100%', // 正方形のアスペクト比を維持
        border: '1px solid #000',
        cursor: tool === 'select' ? 'move' : 'crosshair',
        userSelect: 'none',
        overflow: 'hidden',
      }}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        handleMouseUp();
        setLastMousePos(null); // 追加
      }}
      role="grid"
      aria-label="ドット絵キャンバス"
      tabIndex={0} // フォーカスを可能にする
      onKeyDown={(e) => {
        // キーボードショートカットの例（Ctrl+Sで保存など）
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault();
        }
      }}
    >
      {/* 背景色レイヤー */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: isBackgroundImageOn ? 'rgba(0,0,0,0)' : paletteColors[backgroundColorIndex],
          pointerEvents: 'none',
          zIndex: 1, // 最下層
        }}
      />

      {/* 背景画像レイヤー */}
      {isBackgroundImageOn && backgroundImage && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: backgroundOpacity,
            pointerEvents: 'none',
            zIndex: 2, // 背景色レイヤーの上
          }}
        />
      )}

      {/* グリッドピクセルレイヤー */}
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
          zIndex: 3, // 背景画像レイヤーの上
        }}
      >
        {grid.map((row, y) =>
          row.map((paletteIndex, x) => {
            const color = paletteIndex=== backgroundColorIndex && isBackgroundImageOn ? 'rgba(0,0,0,0)' : paletteColors[paletteIndex];
            return (
              <Box
                key={`${x}-${y}`}
                role="gridcell"
                aria-label={`Pixel ${x + 1}, ${y + 1}`}
                tabIndex={0} // フォーカスを可能にする
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleInteract(x, y);
                  }
                }}
                sx={{
                  backgroundColor: color,
                  outline: 'none',
                  '&:focus': {
                    border: '2px solid #000',
                  },
                }}
                onMouseDown={(e) => handleMouseDown(e, x, y)}
                onMouseOver={(e) => handleMouseOver(e, x, y)}
              />
            );
          })
        )}
      </Box>

      {/* グリッドラインオーバーレイヤー */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${100 / gridSize}% ${100 / gridSize}%`,
          pointerEvents: 'none', // オーバーレイヤーはマウスイベントを受け取らない
          zIndex: 4, // グリッドピクセルレイヤーの上
        }}
      />

      {/* 選択範囲のオーバーレイ */}
      {selection && <Box sx={{
        position: 'absolute',
        border: '2px dashed #000',
        left: `${(selection.x1 / gridSize) * 100}%`,
        top: `${(selection.y1 / gridSize) * 100}%`,
        width: `${((selection.x2 - selection.x1 + 1) / gridSize) * 100}%`,
        height: `${((selection.y2 - selection.y1 + 1) / gridSize) * 100}%`,
        pointerEvents: 'none',
        boxSizing: 'border-box',
        zIndex: 5,
      }} />}

      {/* 移動中の選択範囲のピクセル */}
      {selection &&
        (moveOffset.dx !== 0 || moveOffset.dy !== 0) &&
        grid.map((row, y) =>
          row.map((paletteIndex, x) => {
            if (
              x >= selection.x1 &&
              x <= selection.x2 &&
              y >= selection.y1 &&
              y <= selection.y2
            ) {
              const newX = x + moveOffset.dx;
              const newY = y + moveOffset.dy;
              if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
                const color = paletteColors[paletteIndex];
                return (
                  <Box
                    key={`moved-${newX}-${newY}`}
                    sx={{
                      position: 'absolute',
                      left: `${(newX / gridSize) * 100}%`,
                      top: `${(newY / gridSize) * 100}%`,
                      width: `${(1 / gridSize) * 100}%`,
                      height: `${(1 / gridSize) * 100}%`,
                      backgroundColor: color,
                      pointerEvents: 'none',
                      opacity: 1,
                      border: '1px solid #ddd',
                      zIndex: 6,
                    }}
                  />
                );
              }
            }
            return null;
          })
        )}
    </Box>
  );
});

export default Canvas;
