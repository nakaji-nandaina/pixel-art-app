// src/components/Tools.js

import React from 'react';
import './Tools.css';

/**
 * Tools コンポーネント
 * ツールバーを表示し、各種ツールの選択や操作を提供します。
 *
 * Props:
 * - setTool: ツールを設定する関数
 * - grid: キャンバスのピクセルデータを保持する配列
 * - setGrid: gridを更新する関数
 * - paletteColors: パレットの色データを保持する配列
 * - selection: 現在の範囲選択状態
 * - setSelection: selectionを更新する関数
 * - backgroundColorIndex: 背景色として設定されているパレットのインデックス
 * - isSelecting: 範囲選択中かどうかの状態
 * - moveOffset: 現在の移動オフセット
 * - setMoveOffset: moveOffset を更新する関数
 */
function Tools({
  setTool,
  grid,
  setGrid,
  paletteColors,
  selection,
  setSelection,
  backgroundColorIndex,
  isSelecting,
  moveOffset, // 追加
  setMoveOffset, // 追加
}) {
  /**
   * 画像をPNG形式で保存する関数
   */
  const handleSave = () => {
    const canvasElement = document.createElement('canvas');
    canvasElement.width = 40;
    canvasElement.height = 40;
    const ctx = canvasElement.getContext('2d');

    grid.forEach((row, y) => {
      row.forEach((paletteIndex, x) => {
        // 背景色として設定された色を透過扱い
        if (
          backgroundColorIndex !== null &&
          paletteIndex === backgroundColorIndex
        ) {
          ctx.clearRect(x, y, 1, 1);
        } else {
          ctx.fillStyle = paletteColors[paletteIndex];
          ctx.fillRect(x, y, 1, 1);
        }
      });
    });

    // スケーリングして見やすいサイズに
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = 40 * 10; // 10倍に拡大
    scaledCanvas.height = 40 * 10;
    const scaledCtx = scaledCanvas.getContext('2d');
    scaledCtx.imageSmoothingEnabled = false;
    scaledCtx.drawImage(canvasElement, 0, 0, scaledCanvas.width, scaledCanvas.height);

    scaledCanvas.toBlob(blob => {
      const link = document.createElement('a');
      link.download = 'pixel-art.png';
      link.href = URL.createObjectURL(blob);
      link.click();
    }, 'image/png');
  };

  /**
   * 範囲選択した部分を移動する関数
   */
  const handleMove = direction => {
    if (!selection) return;
    let dx = 0;
    let dy = 0;
    if (direction === 'up') dy = -1;
    if (direction === 'down') dy = 1;
    if (direction === 'left') dx = -1;
    if (direction === 'right') dx = 1;

    setMoveOffset(prev => ({ dx: prev.dx + dx, dy: prev.dy + dy }));
  };

  /**
   * 範囲選択を解除する関数
   * 移動を確定する
   */
  const clearSelection = () => {
    if (moveOffset.dx !== 0 || moveOffset.dy !== 0) {
      const newGrid = grid.map(row => row.slice());
      for (let y = selection.y1; y <= selection.y2; y++) {
        for (let x = selection.x1; x <= selection.x2; x++) {
          const newX = x + moveOffset.dx;
          const newY = y + moveOffset.dy;
          if (newX >= 0 && newX < 40 && newY >= 0 && newY < 40) {
            newGrid[newY][newX] = grid[y][x];
          }
        }
      }
      setGrid(newGrid);
      setMoveOffset({ dx: 0, dy: 0 });
    }
    setSelection(null);
  };

  /**
   * 確定せずにツールを変更する際に移動を確定する
   */
  const handleToolChange = newTool => {
    if (moveOffset.dx !== 0 || moveOffset.dy !== 0) {
      clearSelection();
    }
    setTool(newTool);
  };

  return (
    <div className="tools">
      <button onClick={() => handleToolChange('brush')}>ブラシ</button>
      <button onClick={() => handleToolChange('eyedropper')}>スポイト</button>
      <button onClick={() => handleToolChange('fill')}>塗りつぶし</button>
      <button onClick={() => handleToolChange('select')}>範囲選択</button>
      <button onClick={handleSave}>保存</button>
      <div className="move-buttons">
        <button onClick={() => handleMove('up')} disabled={isSelecting}>
          ↑
        </button>
        <button onClick={() => handleMove('left')} disabled={isSelecting}>
          ←
        </button>
        <button onClick={() => handleMove('down')} disabled={isSelecting}>
          ↓
        </button>
        <button onClick={() => handleMove('right')} disabled={isSelecting}>
          →
        </button>
      </div>
      <button onClick={clearSelection}>選択解除</button>
    </div>
  );
}

export default Tools;
