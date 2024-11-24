// src/components/Tools.tsx

import React from 'react';
import { Box, Button, Stack } from '@mui/material';

type Tool = 'fill' | 'brush' | 'eyedropper' | 'select';

interface Selection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface ToolsProps {
  setTool: React.Dispatch<React.SetStateAction<Tool>>;
  grid: number[][];
  setGrid: React.Dispatch<React.SetStateAction<number[][]>>;
  paletteColors: string[];
  selection: Selection | null;
  setSelection: (selection: Selection | null) => void;
  backgroundColorIndex: number;
  isSelecting: boolean;
  moveOffset: { dx: number; dy: number };
  setMoveOffset: React.Dispatch<React.SetStateAction<{ dx: number; dy: number }>>;
}

const Tools: React.FC<ToolsProps> = ({
  setTool,
  grid,
  setGrid,
  paletteColors,
  selection,
  setSelection,
  backgroundColorIndex,
  isSelecting,
  moveOffset,
  setMoveOffset,
}) => {
  const handleSave = () => {
    const canvasElement = document.createElement('canvas');
    canvasElement.width = 40;
    canvasElement.height = 40;
    const ctx = canvasElement.getContext('2d');

    if (ctx) {
      grid.forEach((row, y) => {
        row.forEach((paletteIndex, x) => {
          if (paletteIndex === backgroundColorIndex) {
            ctx.clearRect(x, y, 1, 1);
          } else {
            ctx.fillStyle = paletteColors[paletteIndex];
            ctx.fillRect(x, y, 1, 1);
          }
        });
      });

      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = 40 * 10;
      scaledCanvas.height = 40 * 10;
      const scaledCtx = scaledCanvas.getContext('2d');
      if (scaledCtx) {
        scaledCtx.imageSmoothingEnabled = false;
        scaledCtx.drawImage(canvasElement, 0, 0, scaledCanvas.width, scaledCanvas.height);

        scaledCanvas.toBlob(blob => {
          if (blob) {
            const link = document.createElement('a');
            link.download = 'pixel-art.png';
            link.href = URL.createObjectURL(blob);
            link.click();
          }
        }, 'image/png');
      }
    }
  };

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    let dx = 0;
    let dy = 0;
    if (direction === 'up') dy = -1;
    if (direction === 'down') dy = 1;
    if (direction === 'left') dx = -1;
    if (direction === 'right') dx = 1;

    setMoveOffset(prev => ({
      dx: prev.dx + dx,
      dy: prev.dy + dy,
    }));
  };

  const clearSelection = () => {
    if (moveOffset.dx !== 0 || moveOffset.dy !== 0) {
      const newGrid = grid.map(row => row.slice());
      if (selection) {
        for (let y = selection.y1; y <= selection.y2; y++) {
          for (let x = selection.x1; x <= selection.x2; x++) {
            const newX = x + moveOffset.dx;
            const newY = y + moveOffset.dy;
            // 背景パレットの色は変更しない
            if (
              newX >= 0 &&
              newX < 40 &&
              newY >= 0 &&
              newY < 40 &&
              newGrid[newY][newX] !== backgroundColorIndex
            ) {
              newGrid[newY][newX] = grid[y][x];
            }
          }
        }
        setGrid(newGrid);
        setMoveOffset({ dx: 0, dy: 0 });
      }
    }
    setSelection(null);
  };

  const handleToolChange = (newTool: Tool) => {
    setTool(prevTool => {
      // 現在のツールが 'select' で、新しいツールも 'select' の場合
      if (prevTool === 'select' && newTool === 'select') {
        // 範囲選択を解除
        setSelection(null);
        setMoveOffset({ dx: 0, dy: 0 });
        return 'brush'; // デフォルトツールに戻す
      }

      // 現在のツールが 'select' で、新しいツールが別のツールの場合
      if (prevTool === 'select' && newTool !== 'select') {
        // 範囲選択を解除
        setSelection(null);
        setMoveOffset({ dx: 0, dy: 0 });
      }

      return newTool;
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      {/* ツールボタン */}
      <Stack spacing={1} sx={{ width: '100%', marginBottom: 2 }}>
        <Button
          variant="contained"
          onClick={() => handleToolChange('brush')}
          color="primary"
        >
          ブラシ
        </Button>
        <Button
          variant="contained"
          onClick={() => handleToolChange('eyedropper')}
          color="primary"
        >
          スポイト
        </Button>
        <Button
          variant="contained"
          onClick={() => handleToolChange('fill')}
          color="primary"
        >
          塗りつぶし
        </Button>
        <Button
          variant="contained"
          onClick={() => handleToolChange('select')}
          color={isSelecting ? 'secondary' : 'primary'}
        >
          範囲選択
        </Button>
        <Button variant="contained" onClick={handleSave} color="primary">
          保存
        </Button>
      </Stack>

      {/* 移動ボタン */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 2 }}>
        <Button
          variant="outlined"
          onClick={() => handleMove('up')}
          disabled={isSelecting}
        >
          ↑
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleMove('left')}
          disabled={isSelecting}
        >
          ←
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleMove('down')}
          disabled={isSelecting}
        >
          ↓
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleMove('right')}
          disabled={isSelecting}
        >
          →
        </Button>
      </Box>

      {/* 選択解除ボタン */}
      <Button variant="outlined" onClick={clearSelection} sx={{ width: '100%', marginBottom: 2 }}>
        選択解除
      </Button>
    </Box>
  );
};

export default Tools;
