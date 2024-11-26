// src/components/Palette.tsx

import React, { useCallback } from 'react';
import { Box, Tooltip } from '@mui/material';

interface PaletteProps {
  paletteColors: string[];
  setPaletteColors: React.Dispatch<React.SetStateAction<string[]>>;
  selectedPaletteIndex: number;
  setSelectedPaletteIndex: (index: number) => void;
  backgroundColorIndex: number;
  setBackgroundColorIndex: (index: number) => void;
}

const Palette: React.FC<PaletteProps> = React.memo(({
  paletteColors,
  setPaletteColors,
  selectedPaletteIndex,
  setSelectedPaletteIndex,
  backgroundColorIndex,
  setBackgroundColorIndex,
}) => {
  const handleClick = useCallback((index: number) => {
    setSelectedPaletteIndex(index);
  }, [setSelectedPaletteIndex]);

  const handleContextMenu = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setBackgroundColorIndex(index);
  }, [setBackgroundColorIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedPaletteIndex(index);
    }
    if (e.key === 'ContextMenu') { // 一部のキーボードでは右クリックをシミュレート
      e.preventDefault();
      setBackgroundColorIndex(index);
    }
  }, [setSelectedPaletteIndex, setBackgroundColorIndex]);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(16, 1fr)', // 256通常 + 1背景 = 17列
        gridTemplateRows: 'repeat(auto-fill, 1fr)', // 行数を自動計算
        gap: '2px',
        mb: 2,
        width: '100%',
      }}
      role="list"
      aria-label="カラーパレット"
    >
      {paletteColors.map((color, index) => {
        const isBackground = index === backgroundColorIndex;
        return (
          <Box
            role="listitem"
            tabIndex={0}
            aria-label={`パレットカラー ${index + 1}`}
            onClick={() => handleClick(index)}
            onContextMenu={(e) => handleContextMenu(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            sx={{
              width: '100%',
              paddingTop: '100%', // 正方形のアスペクト比を維持
              position: 'relative',
              border:
                selectedPaletteIndex === index
                  ? '2px solid #000'
                  : '1px solid #ccc',
              backgroundColor: color,
              cursor: 'pointer',
              '&:focus': {
                outline: '2px solid #000',
              },
            }}
          >
            {isBackground && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  fontSize: '8px',
                  color: '#fff',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  padding: '1px 2px',
                  borderRadius: '3px',
                }}
              >
                BG
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
});

export default Palette;
