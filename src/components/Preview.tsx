// src/components/Preview.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';

interface PreviewProps {
  grid: number[][];
  paletteColors: string[];
  backgroundColorIndex: number;
  gridSize: number;
}

const Preview: React.FC<PreviewProps> = React.memo(
  ({ grid, paletteColors, backgroundColorIndex, gridSize }) => {
    // プレビューの背景色を管理する状態
    const [previewBackgroundColor, setPreviewBackgroundColor] = useState<string>('#ddd');

    /**
     * 背景色を変更するハンドラー（プレビュー専用）
     */
    const handlePreviewBackgroundColorChange = useCallback((color: string) => {
      setPreviewBackgroundColor(color);
    }, []);

    // 現在のプレビュー背景色
    const currentPreviewBackgroundColor = previewBackgroundColor;

    // グリッド全体のスタイル（widthとheightはここでは設定しない）
    const getPreviewStyle = useMemo(
      () => ({
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        imageRendering: 'pixelated' as const, // ピクセルアートの鮮明表示
      }),
      [gridSize]
    );

    // 各ピクセルのスタイル
    const getPixelStyle = useMemo(
      () => (color: string, isBackground: boolean) => ({
        // border: '1px solid #ddd', // ボーダーを削除
        backgroundColor: isBackground ? currentPreviewBackgroundColor : color, // 背景色を変更
        width: '100%',
        height: '100%',
      }),
      [currentPreviewBackgroundColor]
    );

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* プレビュー表示部分 */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            paddingTop: '100%', // 正方形のアスペクト比を維持
            // border: '1px solid #000', // 外枠のボーダーも不要なら削除
            overflow: 'hidden',
            backgroundColor: currentPreviewBackgroundColor, // 背景色を適用
          }}
          role="img"
          aria-label="ドット絵のプレビュー"
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              ...getPreviewStyle,
            }}
          >
            {grid.map((row, y) =>
              row.map((paletteIndex, x) => {
                const isBackground = paletteIndex === backgroundColorIndex;
                const color = paletteColors[paletteIndex];
                return (
                  <Box key={`preview-${x}-${y}`} sx={getPixelStyle(color, isBackground)} />
                );
              })
            )}
          </Box>
          <Box
            sx={{
              position: 'absolute',
              bottom: '5px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              padding: '2px 5px',
              borderRadius: '3px',
            }}
          >
            <Typography variant="subtitle1">プレビュー</Typography>
          </Box>
        </Box>

        {/* 背景色選択ボタン部分 */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="subtitle1" gutterBottom>
            背景色を選択:
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center">
            {[
              { label: '#ddd', color: '#ddd' },
              { label: '#bbb', color: '#bbb' },
              { label: '#999', color: '#999' },
            ].map(({ label, color }) => (
              <Button
                key={label}
                variant={currentPreviewBackgroundColor === color ? 'contained' : 'outlined'}
                onClick={() => handlePreviewBackgroundColorChange(color)}
                sx={{
                  backgroundColor: color,
                  borderColor: color,
                  minWidth: '40px',
                  width: '40px',
                  height: '40px',
                  '&:hover': {
                    backgroundColor: color,
                  },
                }}
                aria-label={`プレビューの背景色を${label}に設定`}
              >
                {/* 視覚的に色を表示するためにボタン内にテキストを追加することも可能です */}
              </Button>
            ))}
          </Stack>
        </Box>
      </Box>
    );
  }
);

export default Preview;
