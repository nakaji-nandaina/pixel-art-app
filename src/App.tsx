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
  Switch,
  FormControlLabel, // 追加
  Slider,
} from '@mui/material';
import Canvas from './components/Canvas';
import Palette from './components/Palette';
import ColorPicker from './components/ColorPicker';
import Tools from './components/Tools';
import Preview from './components/Preview';
import { resizeImageNearestNeighbor } from './utils/resizeImage';

type Tool = 'brush' | 'eyedropper' | 'fill' | 'select';

// 初期パレットの色定義を更新
const initialPaletteColors: string[] = [
  'rgba(255, 0, 0, 1)',       // 0: 赤
  'rgba(0, 255, 0, 1)',       // 1: 緑
  'rgba(0, 0, 255, 1)',       // 2: 青
  'rgba(255, 255, 0, 1)',     // 3: 黄
  'rgba(0, 255, 255, 1)',     // 4: シアン
  'rgba(255, 0, 255, 1)',     // 5: マゼンタ
  'rgba(165, 42, 42, 1)',     // 6: 茶
  'rgba(128, 128, 128, 1)',   // 7: 灰
  'rgba(82, 108, 106, 1)',    // 8: #526C6A
  'rgba(88, 255, 177, 1)',    // 9: #58FFB1
  // 10-39: 白
  ...Array(30).fill('rgba(255,255,255,1)'),
  'rgba(255, 255, 255, 1)',   // 40: 白（背景パレット）
];

const App: React.FC = () => {
  // 現在のグリッドサイズ
  const [gridSize, setGridSize] = useState<number>(40);
  
  // グリッドのピクセルデータを背景色インデックスで初期化
  const [grid, setGrid] = useState<number[][]>(
    Array.from({ length: gridSize }, () => Array(gridSize).fill(40)) // 背景色インデックスは40（白）
  );

  // パレットの色を管理する状態を更新
  const [paletteColors, setPaletteColors] = useState<string[]>(initialPaletteColors);

  // 選択中のパレットのインデックス（初期は0）
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);

  // 使用中のツール（'brush', 'eyedropper', 'fill', 'select'）
  const [tool, setTool] = useState<Tool>('brush'); // 初期はブラシツール

  // 範囲選択の状態（{x1, y1, x2, y2}）
  const [selection, setSelection] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);
  
  // 初期の背景色インデックス
  const [backgroundColorIndex, setBackgroundColorIndex] = useState<number>(40); // 40番を背景カラーとして使用

  const [isSelecting, setIsSelecting] = useState(false);

  const [moveOffset, setMoveOffset] = useState<{ dx: number; dy: number }>({
    dx: 0,
    dy: 0,
  });

  /**
   * 背景画像を管理する状態
   */
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  /**
   * 背景画像の透過度を管理する状態
   */
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(0.5); // 初期は不透明

  /**
   * 背景画像のオンオフを管理する状態
   */
  const [isBackgroundImageOn, setIsBackgroundImageOn] = useState<boolean>(false);

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
   * グリッドサイズ入力の変更を管理
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
    if (value < 8 || value > 64) {
      setErrorMessage('グリッドサイズは8から64の範囲で設定してください。');
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

  /**
   * 背景画像のアップロードを処理する関数
   */
  const handleBackgroundImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const result = reader.result;
        if (typeof result === 'string') {
          const img = new Image();
          img.src = result;
          img.onload = async () => {
            // キャンバスのピクセルサイズを取得（例: gridSize 40 -> 800pxの場合）
            const canvasPixelSize = 800; // キャンバスの表示サイズに合わせて調整
            // 画像のアスペクト比を保ちつつリサイズ
            let targetWidth = canvasPixelSize;
            let targetHeight = canvasPixelSize;
            if (img.width > img.height) {
              targetWidth = canvasPixelSize;
              targetHeight = Math.round((img.height / img.width) * canvasPixelSize);
            } else {
              targetHeight = canvasPixelSize;
              targetWidth = Math.round((img.width / img.height) * canvasPixelSize);
            }

            try {
              const resizedDataUrl = await resizeImageNearestNeighbor(img, targetWidth, targetHeight);
              setBackgroundImage(resizedDataUrl);
              setIsBackgroundImageOn(true); // 画像をアップロードしたら初期はオフ
              setPaletteColors(prevColors => {
                const newColors = [...prevColors];
                newColors[40] = 'rgba(255, 255, 255, 1)'; // 背景画像オフ時は白
                return newColors;
              });
            } catch (error) {
              console.error('画像のリサイズに失敗しました:', error);
              setErrorMessage('画像のリサイズに失敗しました。');
              setOpenSnackbar(true);
            }
          };
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  /**
   * 背景画像の透過度変更ハンドラ
   */
  const handleBackgroundOpacityChange = useCallback((e: Event, newValue: number | number[]) => {
    setBackgroundOpacity(newValue as number);
  }, []);

  /**
   * 背景画像のオンオフ切替ハンドラ
   */
  const handleBackgroundToggle = useCallback(() => {
    setIsBackgroundImageOn(prev => {
      const newState = !prev;
      setPaletteColors(prevColors => {
        const newPalette = [...prevColors];
        if (newState) {
          // 背景画像がオンになったら背景パレットを透明に設定
          newPalette[40] = 'rgba(255, 255, 255, 0)';
        } else {
          // 背景画像がオフになったら背景パレットを白に設定
          newPalette[40] = 'rgba(255, 255, 255, 1)';
        }
        return newPalette;
      });
      return newState;
    });
  }, []);

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
          ピクセルくりえいたー
        </Typography>


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
            {/* グリッドサイズの入力と背景画像のアップロード */}
            <Box sx={{ mt:4, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {/* グリッドサイズ入力 */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  サイズ:
                </Typography>
                <TextField
                  type="number"
                  value={gridSizeInput}
                  onChange={handleGridSizeInputChange}
                  inputProps={{ min: 8, max: 64 }}
                  aria-label="グリッドサイズを入力"
                  sx={{ mr: 2, width: '80px' }}
                />
                <Button
                  variant="contained"
                  onClick={handleGridSizeConfirm}
                  aria-label="グリッドサイズを決定"
                >
                  決定
                </Button>
              </Box>

              {/* 背景画像のオンオフ切替 */}
              <FormControlLabel
                control={
                  <Switch
                    checked={isBackgroundImageOn}
                    onChange={handleBackgroundToggle}
                    name="backgroundImageToggle"
                    color="primary"
                    inputProps={{ 'aria-label': '背景画像のオンオフ切替' }}
                    disabled={!backgroundImage} // 背景画像がない場合は無効
                  />
                }
                label="背景画像を表示"
              />

              {/* 背景画像アップロードと透過度調整 */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mt:2 }}>
                {/* 背景画像アップロード */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Button variant="outlined" component="label" aria-label="背景画像をアップロード">
                    背景画像をアップロード
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleBackgroundImageUpload}
                    />
                  </Button>
                </Box>

                {/* 背景画像の透過度調整 */}
                {isBackgroundImageOn && backgroundImage && (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      背景画像の透過度:
                    </Typography>
                    <Slider
                      value={backgroundOpacity}
                      onChange={handleBackgroundOpacityChange}
                      min={0}
                      max={1}
                      step={0.01}
                      aria-labelledby="background-opacity-slider"
                    />
                  </Box>
                )}
              </Box>
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
                tool={tool} // ツールを渡す
                setSelectedColorIndex={setSelectedPaletteIndex}
                selection={selection}
                setSelection={setSelection}
                backgroundColorIndex={backgroundColorIndex}
                isSelecting={isSelecting}
                setIsSelecting={setIsSelecting}
                moveOffset={moveOffset}
                setMoveOffset={setMoveOffset}
                gridSize={gridSize}
                backgroundImage={backgroundImage} // 背景画像を渡す
                backgroundOpacity={backgroundOpacity} // 透過度を渡す
                isBackgroundImageOn={isBackgroundImageOn} // 背景画像のオンオフを渡す
              />
            </Box>
          </Grid>

          {/* ツールパネル */}
          <Grid item sx={{ flexShrink: 0, width: '300px' }}>
            <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
              <Tools
                setTool={setTool}
                tool={tool} // 現在のツールを渡す
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
                isBackgroundImageOn={isBackgroundImageOn}
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
