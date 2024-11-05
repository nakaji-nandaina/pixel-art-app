// src/App.js

import React, { useState } from 'react';
import Canvas from './components/Canvas';
import Palette from './components/Palette';
import ColorPicker from './components/ColorPicker';
import Tools from './components/Tools';
import './App.css';

/**
 * App コンポーネント
 * アプリ全体のレイアウトと状態管理を行います。
 */
function App() {
  // キャンバスのピクセルデータを管理する状態（40×40）
  const [grid, setGrid] = useState(
    Array.from({ length: 40 }, () => Array(40).fill(0)) // 初期値はパレットインデックス0（白）
  );

  // パレットの色を管理する状態（256色、初期はすべて白）
  const [paletteColors, setPaletteColors] = useState(
    Array(256).fill('rgba(255,255,255,1)')
  );

  // 選択中のパレットのインデックス（初期は0）
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);

  // 使用中のツール（'brush', 'eyedropper', 'fill', 'select'）
  const [tool, setTool] = useState('brush');

  // 範囲選択の状態（{x1, y1, x2, y2}）
  const [selection, setSelection] = useState(null);

  // 背景色として設定されたパレットのインデックス（nullの場合は設定なし）
  const [backgroundColorIndex, setBackgroundColorIndex] = useState(null);

  // 範囲選択中かどうかを管理する状態
  const [isSelecting, setIsSelecting] = useState(false);

  // 選択範囲の移動オフセット（dx, dy）
  const [moveOffset, setMoveOffset] = useState({ dx: 0, dy: 0 });

  /**
   * selectedColor を更新し、paletteColors を更新する関数
   */
  const handleSetSelectedColor = (color) => {
    setPaletteColors(prevPalette => {
      // 現在の色と新しい色が異なる場合のみ更新
      if (prevPalette[selectedPaletteIndex] !== color) {
        const newPalette = prevPalette.slice();
        newPalette[selectedPaletteIndex] = color;
        return newPalette;
      }
      return prevPalette;
    });
  };

  return (
    <div className="app">
      <h1>ドット絵作成ツール</h1>
      <div className="main-content">
        {/* キャンバス */}
        <Canvas
          grid={grid}
          setGrid={setGrid}
          paletteColors={paletteColors}
          selectedPaletteIndex={selectedPaletteIndex}
          tool={tool}
          setSelectedColorIndex={(index) => setSelectedPaletteIndex(index)}
          selection={selection}
          setSelection={setSelection}
          backgroundColorIndex={backgroundColorIndex}
          isSelecting={isSelecting}
          setIsSelecting={setIsSelecting}
          moveOffset={moveOffset} // 追加
          setMoveOffset={setMoveOffset} // 追加
        />

        {/* サイドバー */}
        <div className="sidebar">
          {/* パレット */}
          <Palette
            paletteColors={paletteColors}
            setPaletteColors={setPaletteColors}
            selectedPaletteIndex={selectedPaletteIndex}
            setSelectedPaletteIndex={setSelectedPaletteIndex}
            backgroundColorIndex={backgroundColorIndex}
            setBackgroundColorIndex={setBackgroundColorIndex}
          />

          {/* カラーピッカー */}
          <ColorPicker
            selectedColor={paletteColors[selectedPaletteIndex]}
            setSelectedColor={handleSetSelectedColor}
            selectedPaletteIndex={selectedPaletteIndex}
          />

          {/* ツールバー */}
          <Tools
            setTool={setTool}
            grid={grid}
            setGrid={setGrid}
            paletteColors={paletteColors}
            selection={selection}
            setSelection={setSelection}
            backgroundColorIndex={backgroundColorIndex}
            isSelecting={isSelecting}
            moveOffset={moveOffset} // 追加
            setMoveOffset={setMoveOffset} // 追加
          />
        </div>
      </div>
    </div>
  );
}

export default App;
