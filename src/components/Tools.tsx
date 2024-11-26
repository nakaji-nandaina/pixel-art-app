// src/components/Tools.tsx

import React, { useCallback } from 'react';
import { Box, IconButton, Stack, Button, Tooltip } from '@mui/material';
import BrushIcon from '@mui/icons-material/Brush';
import ColorizeIcon from '@mui/icons-material/Colorize';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import SaveIcon from '@mui/icons-material/Save';

type Tool = 'fill' | 'brush' | 'eyedropper' | 'select';

interface Selection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface ToolsProps {
  setTool: React.Dispatch<React.SetStateAction<Tool>>;
  tool: Tool; // 現在選択されているツール
  grid: number[][];
  setGrid: React.Dispatch<React.SetStateAction<number[][]>>;
  paletteColors: string[];
  selection: Selection | null;
  setSelection: (selection: Selection | null) => void;
  backgroundColorIndex: number;
  isSelecting: boolean;
  moveOffset: { dx: number; dy: number };
  setMoveOffset: React.Dispatch<React.SetStateAction<{ dx: number; dy: number }>>;
  gridSize: number; // 動的グリッドサイズの追加
}

const Tools: React.FC<ToolsProps> = React.memo(({
  setTool,
  tool, // 現在選択されているツール
  grid,
  setGrid,
  paletteColors,
  selection,
  setSelection,
  backgroundColorIndex,
  isSelecting,
  moveOffset,
  setMoveOffset,
  gridSize,
}) => {
  const handleSave = useCallback(() => {
    try {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = gridSize;
      canvasElement.height = gridSize;
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
        scaledCanvas.width = gridSize * 10;
        scaledCanvas.height = gridSize * 10;
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
              URL.revokeObjectURL(link.href);
            } else {
              alert('画像の生成に失敗しました。');
            }
          }, 'image/png');
        } else {
          alert('画像のコンテキスト取得に失敗しました。');
        }
      }
    } catch (error) {
      console.error('保存中にエラーが発生しました:', error);
      alert('保存中にエラーが発生しました。');
    }
  }, [grid, gridSize, paletteColors, backgroundColorIndex]);

  const handleMove = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
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
  }, [setMoveOffset]);

  const clearSelection = useCallback(() => {
    try {
      if (moveOffset.dx !== 0 || moveOffset.dy !== 0) {
        const newGrid = grid.map(row => row.slice());
        if (selection) {
          for (let y = selection.y1; y <= selection.y2; y++) {
            for (let x = selection.x1; x <= selection.x2; x++) {
              const newX = x + moveOffset.dx;
              const newY = y + moveOffset.dy;
              // 移動先がグリッド内であれば上書き
              if (
                newX >= 0 &&
                newX < gridSize &&
                newY >= 0 &&
                newY < gridSize
              ) {
                newGrid[newY][newX] = grid[y][x];
              }
              // 元の位置は変更しない（コピー）
              // newGrid[y][x] = backgroundColorIndex; // これをコメントアウトまたは削除
            }
          }
          setGrid(newGrid);
          setMoveOffset({ dx: 0, dy: 0 });
        }
      }
      setSelection(null);
    } catch (error) {
      console.error('選択解除中にエラーが発生しました:', error);
      alert('選択解除中にエラーが発生しました。');
    }
  }, [moveOffset, grid, gridSize, backgroundColorIndex, selection, setGrid, setMoveOffset, setSelection]);

  const handleToolChange = useCallback((newTool: Tool) => {
    setTool(prevTool => {
      // 現在のツールが 'select' で、新しいツールも 'select' の場合
      if (prevTool === 'select' && newTool === 'select') {
        // 範囲選択を解除
        clearSelection();
        return 'brush'; // デフォルトツールに戻す
      }

      // 現在のツールが 'select' で、新しいツールが別のツールの場合
      if (prevTool === 'select' && newTool !== 'select') {
        // 範囲選択を解除
        clearSelection();
      }

      return newTool;
    });
  }, [setTool, clearSelection]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      {/* ツールボタンを横並びに配置 */}
      <Stack direction="row" spacing={1} sx={{ width: '100%', marginBottom: 2 }}>
        <Tooltip title="ブラシツール" arrow>
          <IconButton
            size="small"
            onClick={() => handleToolChange('brush')}
            color={tool === 'brush' ? 'secondary' : 'primary'} // 選択されている場合はsecondary色
            aria-label="ブラシツールを選択"
          >
            <BrushIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="スポイトツール" arrow>
          <IconButton
            size="small"
            onClick={() => handleToolChange('eyedropper')}
            color={tool === 'eyedropper' ? 'secondary' : 'primary'} // 選択されている場合はsecondary色
            aria-label="スポイトツールを選択"
          >
            <ColorizeIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="塗りつぶしツール" arrow>
          <IconButton
            size="small"
            onClick={() => handleToolChange('fill')}
            color={tool === 'fill' ? 'secondary' : 'primary'} // 選択されている場合はsecondary色
            aria-label="塗りつぶしツールを選択"
          >
            <FormatColorFillIcon /> {/* バケツマークに変更 */}
          </IconButton>
        </Tooltip>
        <Tooltip title="範囲選択ツール" arrow>
          <IconButton
            size="small"
            onClick={() => handleToolChange('select')}
            color={tool === 'select' ? 'secondary' : 'primary'} // 選択されている場合はsecondary色
            aria-pressed={tool === 'select'}
            aria-label="範囲選択ツールを選択"
          >
            <SelectAllIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* 保存ボタン */}
      <Box sx={{ width: '100%', marginBottom: 2 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          color="primary"
          startIcon={<SaveIcon />}
          fullWidth
          aria-label="画像を保存"
        >
          保存
        </Button>
      </Box>

      {/* 移動ボタン */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 2 }}>
        <Button
          variant="outlined"
          onClick={() => handleMove('up')}
          disabled={!selection}
          aria-label="選択範囲を上に移動"
        >
          ↑
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleMove('left')}
          disabled={!selection}
          aria-label="選択範囲を左に移動"
        >
          ←
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleMove('down')}
          disabled={!selection}
          aria-label="選択範囲を下に移動"
        >
          ↓
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleMove('right')}
          disabled={!selection}
          aria-label="選択範囲を右に移動"
        >
          →
        </Button>
      </Box>
    </Box>
  );
});

export default Tools;
