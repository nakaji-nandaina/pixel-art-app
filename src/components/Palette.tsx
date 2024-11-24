// src/components/Palette.tsx

import React from 'react';
import { Box, Tooltip } from '@mui/material';

interface PaletteProps {
  paletteColors: string[];
  setPaletteColors: React.Dispatch<React.SetStateAction<string[]>>;
  selectedPaletteIndex: number;
  setSelectedPaletteIndex: (index: number) => void;
  backgroundColorIndex: number;
  setBackgroundColorIndex: (index: number) => void;
}

const Palette: React.FC<PaletteProps> = ({
  paletteColors,
  setPaletteColors,
  selectedPaletteIndex,
  setSelectedPaletteIndex,
  backgroundColorIndex,
  setBackgroundColorIndex,
}) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(16, 1fr)', // 256通常 + 1背景 = 17列
        gridTemplateRows: 'repeat(Math.ceil(257 / 16), 1fr)', // 行数を計算
        gap: '2px',
        mb: 2,
        width: '100%',
      }}
    >
      {paletteColors.map((color, index) => {
        const isBackground = index === backgroundColorIndex;

        const handleClick = () => {
          setSelectedPaletteIndex(index);
        };

        const handleContextMenu = (e: React.MouseEvent) => {
          e.preventDefault();
          setBackgroundColorIndex(index);
        };

        return (
          <Tooltip
            key={index}
            title={'背景色 (右クリックで変更)'}
            arrow
          >
            <Box
              onClick={handleClick}
              onContextMenu={handleContextMenu}
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
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default Palette;
