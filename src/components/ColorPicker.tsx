// src/components/ColorPicker.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Slider, TextField, Typography } from '@mui/material';

interface ColorPickerProps {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  selectedPaletteIndex: number;
}

const ColorPicker: React.FC<ColorPickerProps> = React.memo(({
  selectedColor,
  setSelectedColor,
  selectedPaletteIndex,
}) => {
  const [r, setR] = useState<number>(255);
  const [g, setG] = useState<number>(255);
  const [b, setB] = useState<number>(255);
  const [error, setError] = useState<{ r: boolean; g: boolean; b: boolean }>({
    r: false,
    g: false,
    b: false,
  });

  // Refを使って状態更新のソースを追跡
  const isUpdatingRef = useRef<boolean>(false);

  // selectedColorが変更された場合にr, g, bを更新
  useEffect(() => {
    if (isUpdatingRef.current) {
      // ユーザー入力による更新の場合は無視
      isUpdatingRef.current = false;
      return;
    }

    const rgba = selectedColor.match(/\d+/g);
    if (rgba) {
      const newR = parseInt(rgba[0], 10);
      const newG = parseInt(rgba[1], 10);
      const newB = parseInt(rgba[2], 10);
      if (r !== newR) setR(newR);
      if (g !== newG) setG(newG);
      if (b !== newB) setB(newB);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColor]);

  // r, g, bが変更された場合にselectedColorを更新
  useEffect(() => {
    const color = `rgba(${r}, ${g}, ${b}, 1)`;
    if (color !== selectedColor) {
      isUpdatingRef.current = true;
      setSelectedColor(color);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r, g, b]);

  const handleSliderChange = useCallback((
    value: number,
    setter: React.Dispatch<React.SetStateAction<number>>,
    channel: 'r' | 'g' | 'b'
  ) => {
    setter(value);
    setError(prev => ({ ...prev, [channel]: false }));
  }, []);

  const handleInputChange = useCallback((
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setter: React.Dispatch<React.SetStateAction<number>>,
    channel: 'r' | 'g' | 'b'
  ) => {
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);
    if (value >= 0 && value <= 255) {
      setter(value);
      setError(prev => ({ ...prev, [channel]: false }));
    } else {
      setError(prev => ({ ...prev, [channel]: true }));
    }
  }, []);

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      {['R', 'G', 'B'].map((channel, index) => {
        const value = index === 0 ? r : index === 1 ? g : b;
        const setValue =
          index === 0 ? setR : index === 1 ? setG : setB;
        const channelKey = channel.toLowerCase() as 'r' | 'g' | 'b';
        return (
          <Box
            key={channel}
            sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
          >
            <Typography sx={{ width: '30px' }} id={`slider-label-${channel}`}>
              {channel}:
            </Typography>
            <Slider
              value={value}
              onChange={(e, val) => handleSliderChange(val as number, setValue, channelKey)}
              min={0}
              max={255}
              aria-labelledby={`slider-label-${channel}`}
              sx={{ mx: 2 }}
            />
            <TextField
              type="number"
              value={value}
              onChange={e => handleInputChange(e, setValue, channelKey)}
              inputProps={{ min: 0, max: 255, 'aria-labelledby': `slider-label-${channel}` }}
              error={error[channelKey]}
              helperText={error[channelKey] ? '0-255の範囲で入力してください' : ''}
              sx={{ width: '60px' }}
            />
          </Box>
        );
      })}
    </Box>
  );
});

export default ColorPicker;
