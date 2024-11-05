// src/components/Canvas.js

import React from 'react';
import './Canvas.css';

/**
 * Canvas コンポーネント
 * 40×40のグリッドを表示し、各セルに対して色の変更やツール操作を行います。
 *
 * Props:
 * - grid: 2D配列でキャンバスのパレットインデックスデータを保持
 * - setGrid: gridを更新する関数
 * - paletteColors: パレットの色データを保持する配列
 * - selectedPaletteIndex: 現在選択されているパレットのインデックス
 * - tool: 現在選択されているツール（'brush', 'eyedropper', 'fill', 'select'）
 * - setSelectedColorIndex: 選択色のパレットインデックスを更新する関数
 * - selection: 現在の範囲選択状態
 * - setSelection: selectionを更新する関数
 * - backgroundColorIndex: 背景色として設定されているパレットのインデックス
 * - isSelecting: 範囲選択中かどうかの状態
 * - setIsSelecting: isSelecting を更新する関数
 * - moveOffset: 現在の移動オフセット
 * - setMoveOffset: moveOffset を更新する関数
 */
function Canvas({
  grid,
  setGrid,
  paletteColors,
  selectedPaletteIndex,
  tool,
  setSelectedColorIndex,
  selection,
  setSelection,
  backgroundColorIndex,
  isSelecting,
  setIsSelecting,
  moveOffset, // 追加
  setMoveOffset, // 追加
}) {
  const [isPainting, setIsPainting] = React.useState(false); // ペインティング中かどうか
  const [startPos, setStartPos] = React.useState(null); // 選択開始位置
  const [currentPos, setCurrentPos] = React.useState(null); // 現在のカーソル位置

  const cellSize = 17; // CSSで設定したセルのサイズに合わせる

  /**
   * セルをクリックまたはドラッグしたときの処理
   */
  const handleInteract = (x, y) => {
    if (tool === 'eyedropper') {
      setSelectedColorIndex(grid[y][x]);
    } else if (tool === 'brush' || tool === 'fill') {
      if (tool === 'brush') {
        if (grid[y][x] !== selectedPaletteIndex) {
          const newGrid = grid.map(row => row.slice());
          newGrid[y][x] = selectedPaletteIndex;
          setGrid(newGrid);
        }
      } else if (tool === 'fill') {
        const targetIndex = grid[y][x];
        if (targetIndex !== selectedPaletteIndex) {
          fillColor(x, y, targetIndex);
        }
      }
    }
    // 範囲選択ツールはここでは処理しない
  };

  /**
   * 塗りつぶしアルゴリズム（深さ優先探索）
   */
  const fillColor = (x, y, targetIndex) => {
    const newGrid = grid.map(row => row.slice());
    const stack = [[x, y]];
    while (stack.length > 0) {
      const [cx, cy] = stack.pop();
      if (
        cx >= 0 &&
        cx < 40 &&
        cy >= 0 &&
        cy < 40 &&
        newGrid[cy][cx] === targetIndex
      ) {
        newGrid[cy][cx] = selectedPaletteIndex;
        stack.push([cx + 1, cy]);
        stack.push([cx - 1, cy]);
        stack.push([cx, cy + 1]);
        stack.push([cx, cy - 1]);
      }
    }
    setGrid(newGrid);
  };

  /**
   * マウスダウン時の処理
   */
  const handleMouseDown = (e, x, y) => {
    e.preventDefault();
    if (tool === 'select') {
      setIsSelecting(true);
      setStartPos({ x, y });
      setCurrentPos({ x, y });
      setMoveOffset({ dx: 0, dy: 0 }); // 移動オフセットをリセット
    } else {
      setIsPainting(true);
      handleInteract(x, y);
    }
  };

  /**
   * マウスアップ時の処理
   */
  const handleMouseUp = () => {
    if (isSelecting && tool === 'select' && startPos && currentPos) {
      const x1 = Math.min(startPos.x, currentPos.x);
      const y1 = Math.min(startPos.y, currentPos.y);
      const x2 = Math.max(startPos.x, currentPos.x);
      const y2 = Math.max(startPos.y, currentPos.y);
      setSelection({ x1, y1, x2, y2 });
    }
    if (isPainting) {
      setIsPainting(false);
    }
    setIsSelecting(false);
    setStartPos(null);
    setCurrentPos(null);
  };

  /**
   * マウスオーバー時の処理
   */
  const handleMouseOver = (e, x, y) => {
    if (tool === 'select' && isSelecting) {
      setCurrentPos({ x, y });
    } else if ((tool === 'brush' || tool === 'fill') && isPainting) {
      handleInteract(x, y);
    }
  };

  /**
   * 選択範囲を描画するためのスタイルを計算
   */
  const getSelectionStyle = () => {
    if (!selection) return {};
    const left = (selection.x1+moveOffset.dx) * cellSize;
    const top = (selection.y1+moveOffset.dy) * cellSize;
    const width = (selection.x2 - selection.x1 + 1) * cellSize;
    const height = (selection.y2 - selection.y1 + 1) * cellSize;
    return {
      position: 'absolute',
      border: '2px dashed #000',
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      pointerEvents: 'none',
      boxSizing: 'border-box',
      zIndex:1,
    };
  };

  /**
   * 選択範囲を移動後の位置に描画するためのピクセルを取得
   */
  const getMovedSelectionPixels = () => {
    if (!selection || (moveOffset.dx === 0 && moveOffset.dy === 0)) return [];
    const movedPixels = [];
    for (let y = selection.y1; y <= selection.y2; y++) {
      for (let x = selection.x1; x <= selection.x2; x++) {
        const newX = x + moveOffset.dx;
        const newY = y + moveOffset.dy;
        if (newX >= 0 && newX < 40 && newY >= 0 && newY < 40) {
          movedPixels.push({
            x: newX,
            y: newY,
            color: paletteColors[grid[y][x]],
          });
        }
      }
    }
    return movedPixels;
  };

  return (
    <div
      className="canvas"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ position: 'relative' }}
    >
      {grid.map((row, y) =>
        row.map((paletteIndex, x) => {
          // 背景色として設定された色を透明にする
          const isBackground =
            backgroundColorIndex !== null &&
            paletteIndex === backgroundColorIndex;

          // セルが選択範囲内にあるかどうか
          const isSelected =
            selection &&
            x >= selection.x1 &&
            x <= selection.x2 &&
            y >= selection.y1 &&
            y <= selection.y2;

          return (
            <div
              key={`${x}-${y}`}
              className={`cell ${isSelected ? 'selected' : ''}`}
              style={{
                backgroundColor: isBackground
                  ? 'transparent'
                  : paletteColors[paletteIndex],
              }}
              onMouseDown={e => handleMouseDown(e, x, y)}
              onMouseOver={e => handleMouseOver(e, x, y)}
            />
          );
        })
      )}
      {/* 選択範囲のオーバーレイ */}
      {selection && <div style={getSelectionStyle()} />}
      {/* 移動中の選択範囲のオーバーレイ */}
      {selection && (moveOffset.dx !== 0 || moveOffset.dy !== 0) &&
        getMovedSelectionPixels().map(pixel => (
          <div
            key={`moved-${pixel.x}-${pixel.y}`}
            className="cell moved-cell"
            style={{
              position: 'absolute',
              left: `${pixel.x * cellSize}px`,
              top: `${pixel.y * cellSize}px`,
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              backgroundColor: pixel.color,
              pointerEvents: 'none',
              opacity: 1,
            }}
          />
        ))
      }
    </div>
  );
}

export default Canvas;
