// src/components/Palette.js
import React, { useState, useEffect } from 'react';
import './Palette.css';

/**
 * Palette コンポーネント
 * 16×16のパレットを表示し、色の選択やコピー、背景色の設定を行います。
 *
 * Props:
 * - paletteColors: パレットの色データを保持する配列
 * - setPaletteColors: paletteColorsを更新する関数
 * - selectedPaletteIndex: 現在選択されているパレットのインデックス
 * - setSelectedPaletteIndex: selectedPaletteIndexを更新する関数
 * - backgroundColorIndex: 背景色として設定されているパレットのインデックス
 * - setBackgroundColorIndex: backgroundColorIndexを更新する関数
 */
function Palette({
  paletteColors,
  setPaletteColors,
  selectedPaletteIndex,
  setSelectedPaletteIndex,
  backgroundColorIndex,
  setBackgroundColorIndex,
}) {
  const [copyMode, setCopyMode] = useState(false); // コピー操作モード
  const [copySourceIndex, setCopySourceIndex] = useState(null); // コピー元のインデックス

  /**
   * パレットセルをクリックしたときの処理
   */
  const handlePaletteClick = index => {
    if (copyMode) {
      // コピー操作中: コピー元からコピー先へ色をコピー
      if (copySourceIndex !== null && copySourceIndex !== index) {
        const newPalette = paletteColors.slice();
        newPalette[index] = paletteColors[copySourceIndex];
        setPaletteColors(newPalette);
      }
      setCopyMode(false);
      setCopySourceIndex(null);
    } else {
      // 通常の色選択: 選択色を更新
      setSelectedPaletteIndex(index);
    }
  };

  /**
   * パレットセルを右クリックしたときの処理（背景色の設定）
   */
  const handleRightClick = (e, index) => {
    e.preventDefault();
    // 同じ色を再度右クリックすると背景色の設定を解除
    setBackgroundColorIndex(index === backgroundColorIndex ? null : index);
  };

  /**
   * パレットセルをダブルクリックしたときの処理（コピー元の選択）
   */
  const handleDoubleClick = index => {
    setCopyMode(true);
    setCopySourceIndex(index);
  };

  return (
    <div className="palette">
      {paletteColors.map((color, index) => (
        <div
          key={index}
          className={`palette-cell ${
            selectedPaletteIndex === index ? 'selected' : ''
          } ${backgroundColorIndex === index ? 'background' : ''}`}
          style={{ backgroundColor: color }}
          onClick={() => handlePaletteClick(index)}
          onContextMenu={e => handleRightClick(e, index)}
          onDoubleClick={() => handleDoubleClick(index)}
        />
      ))}
    </div>
  );
}

export default Palette;
