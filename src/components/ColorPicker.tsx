// src/components/ColorPicker.tsx

import React, { useState, useEffect } from 'react';
import { Box, Slider, TextField, Typography } from '@mui/material';

interface ColorPickerProps {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  selectedPaletteIndex: number;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  setSelectedColor,
  selectedPaletteIndex,
}) => {
  const [r, setR] = useState(255);
  const [g, setG] = useState(255);
  const [b, setB] = useState(255);

  useEffect(() => {
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

  useEffect(() => {
    const color = `rgba(${r}, ${g}, ${b}, 1)`;
    if (color !== selectedColor) {
      setSelectedColor(color);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r, g, b]);

  const handleSliderChange = (
    value: number,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    setter(value);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);
    if (value >= 0 && value <= 255) {
      setter(value);
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      {['R', 'G', 'B'].map((channel, index) => {
        const value = index === 0 ? r : index === 1 ? g : b;
        const setValue =
          index === 0 ? setR : index === 1 ? setG : setB;
        return (
          <Box
            key={channel}
            sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
          >
            <Typography sx={{ width: '30px' }}>{channel}:</Typography>
            <Slider
              value={value}
              onChange={(e, val) => handleSliderChange(val as number, setValue)}
              min={0}
              max={255}
              sx={{ mx: 2 }}
            />
            <TextField
              type="number"
              value={value}
              onChange={e => handleInputChange(e, setValue)}
              inputProps={{ min: 0, max: 255 }}
              sx={{ width: '60px' }}
            />
          </Box>
        );
      })}
    </Box>
  );
};

export default ColorPicker;
