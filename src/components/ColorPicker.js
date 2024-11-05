// src/components/ColorPicker.js
import React, { useState, useEffect } from 'react';
import './ColorPicker.css';

/**
 * ColorPicker コンポーネント
 * RGBスライダーと数値入力を提供し、色を選択・更新します。
 * 色の変更はボタン操作ではなく、スライダーや数値入力を変更した瞬間に自動的に反映されます。
 *
 * Props:
 * - selectedColor: 現在選択されている色（rgba形式）
 * - setSelectedColor: 選択色を更新する関数
 * - selectedPaletteIndex: 現在選択されているパレットのインデックス
 */
function ColorPicker({
  selectedColor,
  setSelectedColor,
  selectedPaletteIndex,
}) {
  const [r, setR] = useState(255);
  const [g, setG] = useState(255);
  const [b, setB] = useState(255);

  /**
   * selectedColor が変更されたときに R, G, B を更新
   */
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

  /**
   * R, G, B が変更されたときに selectedColor を更新
   */
  useEffect(() => {
    const color = `rgba(${r}, ${g}, ${b}, 1)`;
    if (color !== selectedColor) {
      setSelectedColor(color);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r, g, b]);

  return (
    <div className="color-picker">
      <div className="color-slider">
        <label>R:</label>
        <input
          type="range"
          min="0"
          max="255"
          value={r}
          onChange={e => setR(Number(e.target.value))}
        />
        <input
          type="number"
          min="0"
          max="255"
          value={r}
          onChange={e => {
            const value = Number(e.target.value);
            if (value >= 0 && value <= 255) setR(value);
          }}
        />
      </div>
      <div className="color-slider">
        <label>G:</label>
        <input
          type="range"
          min="0"
          max="255"
          value={g}
          onChange={e => setG(Number(e.target.value))}
        />
        <input
          type="number"
          min="0"
          max="255"
          value={g}
          onChange={e => {
            const value = Number(e.target.value);
            if (value >= 0 && value <= 255) setG(value);
          }}
        />
      </div>
      <div className="color-slider">
        <label>B:</label>
        <input
          type="range"
          min="0"
          max="255"
          value={b}
          onChange={e => setB(Number(e.target.value))}
        />
        <input
          type="number"
          min="0"
          max="255"
          value={b}
          onChange={e => {
            const value = Number(e.target.value);
            if (value >= 0 && value <= 255) setB(value);
          }}
        />
      </div>
      {/* 明暗バーを削除しました */}
    </div>
  );
}

export default ColorPicker;
