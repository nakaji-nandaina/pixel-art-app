// src/components/Preview.tsx

import React from 'react';
import { Box, Typography } from '@mui/material';

interface PreviewProps {
  grid: number[][];
  paletteColors: string[];
  backgroundColorIndex: number | null;
}

const Preview: React.FC<PreviewProps> = ({
  grid,
  paletteColors,
  backgroundColorIndex,
}) => {
  const gridSize = 40; // グリッドサイズ（40x40）

  // プレビューコンテナのスタイル
  const getPreviewStyle = () => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#030303',
    border: '0px solid #000',
    display: 'grid',
    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
    gridTemplateRows: `repeat(${gridSize}, 1fr)`,
  });

  // 各ピクセルのスタイル
  const getPixelStyle = (x: number, y: number, color: string, isBackground: boolean) => ({
    border: '0px solid #ddd',
    backgroundColor: isBackground ? '#ddd' : color,
  });

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        paddingTop: '100%', // 正方形のアスペクト比を維持
        border: '1px solid #000',
        overflow: 'hidden',
      }}
    >
      <Box sx={getPreviewStyle()}>
        {grid.map((row, y) =>
          row.map((paletteIndex, x) => {
            const isBackground = backgroundColorIndex !== null && paletteIndex === backgroundColorIndex;
            const color = paletteColors[paletteIndex];
            return (
              <Box
                key={`preview-${x}-${y}`}
                sx={getPixelStyle(x, y, color, isBackground)}
              />
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
  );
};

export default Preview;
