// src/App.tsx

import React, { useState } from 'react';
import { Container, Box, Typography, Grid, Paper } from '@mui/material';
import Canvas from './components/Canvas';
import Palette from './components/Palette';
import ColorPicker from './components/ColorPicker';
import Tools from './components/Tools';
import Preview from './components/Preview';

type Tool = 'brush' | 'eyedropper' | 'fill' | 'select';

const App: React.FC = () => {
  const gridSize = 40; // グリッドサイズを一貫して使用

  // キャンバスのピクセルデータを管理する状態（40×40）
  const [grid, setGrid] = useState<number[][]>(
    Array.from({ length: gridSize }, () => Array(gridSize).fill(0)) // 初期値はパレットインデックス0
  );

  // パレットの色を管理する状態（256通常 + 1背景）
  const [paletteColors, setPaletteColors] = useState<string[]>(
    Array(257).fill('rgba(255,255,255,1)') // 初期色を白に設定
  );

  // 選択中のパレットのインデックス（初期は0）
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);

  // 使用中のツール（'brush', 'eyedropper', 'fill', 'select'）
  const [tool, setTool] = useState<Tool>('brush');

  // 範囲選択の状態（{x1, y1, x2, y2}）
  const [selection, setSelection] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);

  // 背景色として固定されたパレットのインデックス（例: 256）
  const [backgroundColorIndex, setBackgroundColorIndex] = useState<number>(256); // 256を背景カラーとして使用

  // 範囲選択中かどうかを管理する状態
  const [isSelecting, setIsSelecting] = useState(false);

  // 選択範囲の移動オフセット（dx, dy）
  const [moveOffset, setMoveOffset] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  /**
   * selectedColor を更新し、paletteColors を更新する関数
   */
  const handleSetSelectedColor = (color: string) => {
    setPaletteColors(prevPalette => {
      if (prevPalette[selectedPaletteIndex] !== color) {
        const newPalette = prevPalette.slice();
        newPalette[selectedPaletteIndex] = color;
        return newPalette;
      }
      return prevPalette;
    });
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        overflowX: 'auto',   // 横スクロールを許可
      }}
    >
      <Box
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* タイトル */}
        <Typography variant="h4" align="center" gutterBottom>
          ドット絵作成ツール
        </Typography>

        {/* メインコンテンツ */}
        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="flex-start"
        >
          {/* プレビュー */}
          <Grid item xs={12} md={3}>
            <Box sx={{ width: '100%', height: '100%' }}>
              <Preview
                grid={grid}
                paletteColors={paletteColors}
                backgroundColorIndex={backgroundColorIndex}
              />
            </Box>
          </Grid>

          {/* キャンバス */}
          <Grid item xs={12} md={6}>
            <Box sx={{ width: '100%', height: '100%' }}>
              <Canvas
                grid={grid}
                setGrid={setGrid}
                paletteColors={paletteColors}
                selectedPaletteIndex={selectedPaletteIndex}
                tool={tool}
                setSelectedColorIndex={setSelectedPaletteIndex}
                selection={selection}
                setSelection={setSelection}
                backgroundColorIndex={backgroundColorIndex}
                isSelecting={isSelecting}
                setIsSelecting={setIsSelecting}
                moveOffset={moveOffset}
                setMoveOffset={setMoveOffset}
              />
            </Box>
          </Grid>

          {/* ツール */}
          <Grid item xs={12} md={3}>
            <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
              <Tools
                setTool={setTool}
                grid={grid}
                setGrid={setGrid}
                paletteColors={paletteColors}
                selection={selection}
                setSelection={setSelection}
                backgroundColorIndex={backgroundColorIndex}
                isSelecting={isSelecting}
                moveOffset={moveOffset}
                setMoveOffset={setMoveOffset}
              />
              <Palette
                paletteColors={paletteColors}
                setPaletteColors={setPaletteColors}
                selectedPaletteIndex={selectedPaletteIndex}
                setSelectedPaletteIndex={setSelectedPaletteIndex}
                backgroundColorIndex={backgroundColorIndex}
                setBackgroundColorIndex={setBackgroundColorIndex} // 再追加
              />
              <ColorPicker
                selectedColor={paletteColors[selectedPaletteIndex]}
                setSelectedColor={handleSetSelectedColor}
                selectedPaletteIndex={selectedPaletteIndex}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default App;
