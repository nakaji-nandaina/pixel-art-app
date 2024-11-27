// src/utils/resizeImage.ts

/**
 * 画像を最近傍法でリサイズし、Data URLとして返す関数
 * @param img リサイズする元のHTMLImageElement
 * @param targetWidth 目標の幅（ピクセル）
 * @param targetHeight 目標の高さ（ピクセル）
 * @returns リサイズされた画像のData URL
 */
export const resizeImageNearestNeighbor = (
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // 目標サイズのキャンバスを作成
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvasのコンテキストが取得できませんでした。'));
        return;
      }

      // 画像スムージングを無効化（最近傍法）
      ctx.imageSmoothingEnabled = false;

      // 元画像をキャンバスに描画（リサイズ）
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // リサイズされた画像のData URLを取得
      const resizedDataUrl = canvas.toDataURL('image/png');
      resolve(resizedDataUrl);
    } catch (error) {
      reject(error);
    }
  });
};
