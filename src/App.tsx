// src/App.tsx

import React, { useState, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import Canvas from './components/Canvas';
import Palette from './components/Palette';
import ColorPicker from './components/ColorPicker';
import Tools from './components/Tools';
import Preview from './components/Preview';

type Tool = 'brush' | 'eyedropper' | 'fill' | 'select';

const App: React.FC = () => {
  // 現在のグリッドサイズ
  const [gridSize, setGridSize] = useState<number>(40);
  
  // グリッドのピクセルデータを背景色インデックスで初期化
  const [grid, setGrid] = useState<number[][]>(
    Array.from({ length: 40 }, () => Array(40).fill(256)) // 初期値は背景色インデックス256
  );

  // パレットの色を管理する状態（256通常色 + 1背景色）
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
  const [moveOffset, setMoveOffset] = useState<{ dx: number; dy: number }>({
    dx: 0,
    dy: 0,
  });

  /**
   * グリッドサイズ入力の一時的な状態
   */
  const [gridSizeInput, setGridSizeInput] = useState<string>(gridSize.toString());

  /**
   * エラーメッセージ用の状態
   */
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  
  /**
   * selectedColor を更新し、paletteColors を更新する関数
   */
  const handleSetSelectedColor = useCallback(
    (color: string) => {
      setPaletteColors((prevPalette) => {
        if (prevPalette[selectedPaletteIndex] !== color) {
          const newPalette = [...prevPalette];
          newPalette[selectedPaletteIndex] = color;
          return newPalette;
        }
        return prevPalette;
      });
    },
    [selectedPaletteIndex]
  );

  /**
   * グリッドサイズの入力変更を管理
   */
  const handleGridSizeInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setGridSizeInput(e.target.value);
  }, []);

  /**
   * グリッドサイズの決定ボタン押下時の処理
   */
  const handleGridSizeConfirm = useCallback(() => {
    const value = Number(gridSizeInput);
    if (isNaN(value)) {
      setErrorMessage('数値を入力してください。');
      setOpenSnackbar(true);
      return;
    }
    if (value < 10 || value > 100) {
      setErrorMessage('グリッドサイズは10から100の範囲で設定してください。');
      setOpenSnackbar(true);
      return;
    }

    // グリッドサイズが変更された場合、新しいグリッドを背景色で初期化
    if (value !== gridSize) {
      setGridSize(value);
      setGrid(Array.from({ length: value }, () => Array(value).fill(backgroundColorIndex)));
      setSelection(null);
      setMoveOffset({ dx: 0, dy: 0 });
    }
  }, [gridSizeInput, gridSize, backgroundColorIndex]);

  /**
   * Snackbarの閉じるハンドラ
   */
  const handleSnackbarClose = useCallback(
    (event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }
      setOpenSnackbar(false);
    },
    []
  );

  return (
    <Container
      maxWidth={false} // フル幅に設定
      sx={{
        overflowX: 'auto', // 横スクロールを許可
        minWidth: '1300px', // 最小幅を設定（必要に応じて調整）
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

        {/* グリッドサイズの入力 */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ mr: 2 }}>
            グリッドサイズ:
          </Typography>
          <TextField
            type="number"
            value={gridSizeInput}
            onChange={handleGridSizeInputChange}
            inputProps={{ min: 10, max: 100 }}
            aria-label="グリッドサイズを入力"
            sx={{ mr: 2, width: '100px' }}
          />
          <Button
            variant="contained"
            onClick={handleGridSizeConfirm}
            aria-label="グリッドサイズを決定"
          >
            決定
          </Button>
        </Box>

        {/* メインコンテンツ */}
        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="flex-start"
          wrap="nowrap" // 折り返しを禁止
        >
          {/* プレビュー */}
          <Grid item sx={{ flexShrink: 0, width: '300px' }}>
            <Box sx={{ width: '100%', height: 'auto' }}>
              <Preview
                grid={grid}
                paletteColors={paletteColors}
                backgroundColorIndex={backgroundColorIndex}
                gridSize={gridSize}
              />
            </Box>
          </Grid>

          {/* キャンバス */}
          <Grid item sx={{ flexShrink: 0, width: '800px' }}>
            <Box sx={{ width: '100%', height: 'auto' }}>
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
                gridSize={gridSize}
              />
            </Box>
          </Grid>

          {/* ツールパネル */}
          <Grid item sx={{ flexShrink: 0, width: '300px' }}>
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
                gridSize={gridSize}
              />
              <Palette
                paletteColors={paletteColors}
                setPaletteColors={setPaletteColors}
                selectedPaletteIndex={selectedPaletteIndex}
                setSelectedPaletteIndex={setSelectedPaletteIndex}
                backgroundColorIndex={backgroundColorIndex}
                setBackgroundColorIndex={setBackgroundColorIndex} 
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

      {/* エラーメッセージ用のSnackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default App;
