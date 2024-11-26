// src/components/ColorPicker.tsx

import React, { useCallback, useState } from 'react';
import {
  Box,
  Slider,
  Typography,
  Grid,
  TextField,
  IconButton
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

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
  // パース関数: rgba文字列をRGB数値に変換
  const parseRGBA = useCallback((color: string) => {
    const regex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/;
    const result = regex.exec(color);
    if (result) {
      return {
        r: Number(result[1]),
        g: Number(result[2]),
        b: Number(result[3]),
        a: 1, // 透過度を1に固定
      };
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  }, []);

  // RGB値の状態管理
  const color = parseRGBA(selectedColor);

  // RGB値を16進数に変換
  const rgbToHex = useCallback((r: number, g: number, b: number) => {
    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }, []);

  // 16進数カラーコードをRGB値に変換
  const hexToRgb = useCallback((hex: string) => {
    const cleanedHex = hex.replace(/^#/, '');
    if (cleanedHex.length === 3) {
      // 例: #333 -> #333333
      const expandedHex = cleanedHex.split('').map(c => c + c).join('');
      return expandedHex.match(/.{2}/g)?.map(c => parseInt(c, 16)) || [255, 255, 255];
    } else if (cleanedHex.length === 6) {
      return cleanedHex.match(/.{2}/g)?.map(c => parseInt(c, 16)) || [255, 255, 255];
    }
    return [255, 255, 255];
  }, []);

  // スライダーまたは入力フィールドからのRGB値の変更を処理
  const handleChange = useCallback(
    (channel: 'r' | 'g' | 'b') => (
      event: Event,
      newValue: number | number[]
    ) => {
      const value = Array.isArray(newValue) ? newValue[0] : newValue;
      const clampedValue = Math.max(0, Math.min(255, value)); // 値を0-255に制限

      let newColor = '';
      switch (channel) {
        case 'r':
          newColor = `rgba(${clampedValue}, ${color.g}, ${color.b}, ${color.a})`;
          break;
        case 'g':
          newColor = `rgba(${color.r}, ${clampedValue}, ${color.b}, ${color.a})`;
          break;
        case 'b':
          newColor = `rgba(${color.r}, ${color.g}, ${clampedValue}, ${color.a})`;
          break;
        default:
          newColor = selectedColor;
      }
      setSelectedColor(newColor);
    },
    [color, setSelectedColor, selectedColor]
  );

  // 数値入力フィールドの変更を処理
  const handleInputChange = useCallback(
    (channel: 'r' | 'g' | 'b') => (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      let value = Number(event.target.value);
      if (isNaN(value)) value = 0;
      value = Math.max(0, Math.min(255, value)); // 値を0-255に制限

      let newColor = '';
      switch (channel) {
        case 'r':
          newColor = `rgba(${value}, ${color.g}, ${color.b}, ${color.a})`;
          break;
        case 'g':
          newColor = `rgba(${color.r}, ${value}, ${color.b}, ${color.a})`;
          break;
        case 'b':
          newColor = `rgba(${color.r}, ${color.g}, ${value}, ${color.a})`;
          break;
        default:
          newColor = selectedColor;
      }
      setSelectedColor(newColor);
    },
    [color, setSelectedColor, selectedColor]
  );

  // ローカルステート: HEX入力フィールドの値
  const [hexInput, setHexInput] = useState<string>(rgbToHex(color.r, color.g, color.b));
  const [hexError, setHexError] = useState<boolean>(false);

  // 16進数カラーコードの変更を処理（ローカルステートのみ更新）
  const handleHexInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let hex = event.target.value.trim();
      // '#'を自動で追加
      if (!hex.startsWith('#')) {
        hex = `#${hex}`;
      }
      setHexInput(hex);
      // 入力が3または6文字の16進数のみ受け付ける
      const regex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;
      if (regex.test(hex)) {
        setHexError(false);
      } else {
        setHexError(true);
      }
    },
    []
  );

  // HEX決定ボタンをクリックした際にカラーを更新
  const handleHexConfirm = useCallback(() => {
    const regex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;
    if (regex.test(hexInput)) {
      const [r, g, b] = hexToRgb(hexInput);
      setSelectedColor(`rgba(${r}, ${g}, ${b}, 1)`);
    } else {
      // エラーハンドリング: 必要に応じてメッセージを表示
      alert('有効な16進数カラーコードを入力してください。例: #FF5733');
    }
  }, [hexInput, hexToRgb, setSelectedColor]);

  // HEXコピーボタンをクリックした際にカラーコードをコピー
  const handleHexCopy = useCallback(() => {
    navigator.clipboard.writeText(hexInput)
      .then(() => {
        // コピー成功時のフィードバック（例: 一時的なメッセージ表示）
        alert(`カラーコード ${hexInput} をコピーしました！`);
      })
      .catch(() => {
        // コピー失敗時のエラーハンドリング
        alert('カラーコードのコピーに失敗しました。');
      });
  }, [hexInput]);

  // グラデーションの生成関数
  const generateGradient = useCallback(
    (channel: 'r' | 'g' | 'b') => {
      let startColor = '';
      let endColor = '';

      switch (channel) {
        case 'r':
          startColor = `rgba(0, ${color.g}, ${color.b}, 1)`;
          endColor = `rgba(255, ${color.g}, ${color.b}, 1)`;
          break;
        case 'g':
          startColor = `rgba(${color.r}, 0, ${color.b}, 1)`;
          endColor = `rgba(${color.r}, 255, ${color.b}, 1)`;
          break;
        case 'b':
          startColor = `rgba(${color.r}, ${color.g}, 0, 1)`;
          endColor = `rgba(${color.r}, ${color.g}, 255, 1)`;
          break;
        default:
          startColor = `rgba(0,0,0,1)`;
          endColor = `rgba(255,255,255,1)`;
      }

      return `linear-gradient(to right, ${startColor}, ${endColor})`;
    },
    [color]
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        カラーピッカー
      </Typography>
      <Grid container spacing={2} alignItems="center">
        {/* Red Slider */}
        <Grid item xs={2}>
          <Typography variant="body1">R</Typography>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ position: 'relative', width: '100%' }}>
            <Slider
              value={color.r}
              onChange={handleChange('r')}
              aria-labelledby="red-slider"
              min={0}
              max={255}
              step={1}
              sx={{
                width: '100%',
                color: 'transparent', // デフォルトの色を透明に設定
                position: 'relative',
                zIndex: 1,
                height: 8, // スライダー全体の高さを調整（デフォルトは4）
                '& .MuiSlider-thumb': {
                  width: 24, // サムの幅を調整（デフォルトは12）
                  height: 24, // サムの高さを調整（デフォルトは12）
                  backgroundColor: '#FF0000', // チャンネルに対応する色
                  '&:hover, &.Mui-focusVisible, &.Mui-active': {
                    boxShadow: '0px 0px 0px 8px rgba(255, 0, 0, 0.16)',
                  },
                },
                '& .MuiSlider-rail': {
                  height: 8, // レールの高さを調整（デフォルトは4）
                },
                '& .MuiSlider-track': {
                  height: 8, // トラックの高さを調整（デフォルトは4）
                  border: 'none', // トラックのボーダーを削除
                },
              }}
              // SliderのRailにグラデーションを適用
              componentsProps={{
                rail: {
                  style: {
                    background: generateGradient('r'),
                  },
                },
              }}
            />
            {/* SliderのTrackを上に重ねて表示 */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${(color.r / 255) * 100}%`,
                backgroundColor: 'transparent',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={4}>
          <TextField
            type="number"
            value={color.r}
            onChange={handleInputChange('r')}
            inputProps={{ min: 0, max: 255 }}
            variant="outlined"
            size="small"
            aria-label="Red value"
            sx={{ width: '100%' }} // 入力フィールドの幅を調整
          />
        </Grid>

        {/* Green Slider */}
        <Grid item xs={2}>
          <Typography variant="body1">G</Typography>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ position: 'relative', width: '100%' }}>
            <Slider
              value={color.g}
              onChange={handleChange('g')}
              aria-labelledby="green-slider"
              min={0}
              max={255}
              step={1}
              sx={{
                width: '100%',
                color: 'transparent', // デフォルトの色を透明に設定
                position: 'relative',
                zIndex: 1,
                height: 8, // スライダー全体の高さを調整
                '& .MuiSlider-thumb': {
                  width: 24, // サムの幅を調整
                  height: 24, // サムの高さを調整
                  backgroundColor: '#00FF00', // チャンネルに対応する色
                  '&:hover, &.Mui-focusVisible, &.Mui-active': {
                    boxShadow: '0px 0px 0px 8px rgba(0, 255, 0, 0.16)',
                  },
                },
                '& .MuiSlider-rail': {
                  height: 8, // レールの高さを調整
                },
                '& .MuiSlider-track': {
                  height: 8, // トラックの高さを調整
                  border: 'none', // トラックのボーダーを削除
                },
              }}
              // SliderのRailにグラデーションを適用
              componentsProps={{
                rail: {
                  style: {
                    background: generateGradient('g'),
                  },
                },
              }}
            />
            {/* SliderのTrackを上に重ねて表示 */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${(color.g / 255) * 100}%`,
                backgroundColor: 'transparent',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={4}>
          <TextField
            type="number"
            value={color.g}
            onChange={handleInputChange('g')}
            inputProps={{ min: 0, max: 255 }}
            variant="outlined"
            size="small"
            aria-label="Green value"
            sx={{ width: '100%' }} // 入力フィールドの幅を調整
          />
        </Grid>

        {/* Blue Slider */}
        <Grid item xs={2}>
          <Typography variant="body1">B</Typography>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ position: 'relative', width: '100%' }}>
            <Slider
              value={color.b}
              onChange={handleChange('b')}
              aria-labelledby="blue-slider"
              min={0}
              max={255}
              step={1}
              sx={{
                width: '100%',
                color: 'transparent', // デフォルトの色を透明に設定
                position: 'relative',
                zIndex: 1,
                height: 8, // スライダー全体の高さを調整
                '& .MuiSlider-thumb': {
                  width: 24, // サムの幅を調整
                  height: 24, // サムの高さを調整
                  backgroundColor: '#0000FF', // チャンネルに対応する色
                  '&:hover, &.Mui-focusVisible, &.Mui-active': {
                    boxShadow: '0px 0px 0px 8px rgba(0, 0, 255, 0.16)',
                  },
                },
                '& .MuiSlider-rail': {
                  height: 8, // レールの高さを調整
                },
                '& .MuiSlider-track': {
                  height: 8, // トラックの高さを調整
                  border: 'none', // トラックのボーダーを削除
                },
              }}
              // SliderのRailにグラデーションを適用
              componentsProps={{
                rail: {
                  style: {
                    background: generateGradient('b'),
                  },
                },
              }}
            />
            {/* SliderのTrackを上に重ねて表示 */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${(color.b / 255) * 100}%`,
                backgroundColor: 'transparent',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={4}>
          <TextField
            type="number"
            value={color.b}
            onChange={handleInputChange('b')}
            inputProps={{ min: 0, max: 255 }}
            variant="outlined"
            size="small"
            aria-label="Blue value"
            sx={{ width: '100%' }} // 入力フィールドの幅を調整
          />
        </Grid>

        {/* Hexadecimal Color Code */}
        <Grid item xs={12}>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={6}>
              <TextField
                value={hexInput}
                onChange={handleHexInputChange}
                variant="outlined"
                size="small"
                aria-label="Hexadecimal color code"
                error={hexError}
                helperText={hexError ? '有効な16進数を入力してください（例: #FF5733）' : ''}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={1} justifyContent="flex-start">
                <Grid item xs={6}>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={handleHexConfirm}
                    disabled={hexError}
                    aria-label="HEX code"
                    sx={{ width: '100%' }}
                  >
                    <CheckIcon />
                  </IconButton>
                </Grid>
                <Grid item xs={6}>
                  <IconButton
                    color="primary"
                    onClick={handleHexCopy}
                    size="small"
                    aria-label="Copy HEX code"
                    sx={{ width: '100%' }}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={4}>
          {/* 空のGridアイテムで整列 */}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ColorPicker;
