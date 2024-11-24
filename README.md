# ドット絵を作るアプリ(初心者向け)

取り合えず基本機能だけ実装しました。ドット絵を簡単に作成・編集できるシンプルなアプリケーションです。

[Demo](https://dot-a-d5f6c.firebaseapp.com/)

## 目次
- [現在の機能](#現在の機能)
- [これから実装することリスト](#これから実装することリスト)
- [使用技術](#使用技術)

## 現在の機能

- **グリッドベースのキャンバス**: ピクセル単位でドット絵を描くためのグリッド。
- **カラー選択ツール**: 豊富なカラーパレットから色を選択可能。
- **描画ツール**: ペン、バケツ塗りなどの基本的なツール。
- **保存**: 作成したドット絵をローカルに保存できます。

## これから実装することリスト

1. **データ管理**
   - アカウントを作成し、クラウド上で作品を保存・管理。
2. **テンプレートギャラリー**
   - 既存のドット絵テンプレートを提供し、ユーザーがカスタマイズ可能にする。
3. **ドット絵の読み込み**
   - 既存のドット絵を読み込み編集できるようにする。画像サイズが異なる場合は最近傍法か線形補間で補正する。（ここはユーザが選択可能になるようにしたい）
4. **エクスポートオプションの拡充**
   - PNGやJPGなど、異なるフォーマットでのエクスポート機能。1ピクセルを10×10にするなどサイズ変更もできるようにする。
5. **リアルタイムコラボレーション**
   - 複数のユーザーが同時に一つのドット絵を編集できる機能。

## 使用技術

- **フロントエンド**
  - [React](https://reactjs.org/)
- **バックエンド**
  - [Firebase](https://firebase.google.com/)（ホスティング、データベース）
- **CI/CD**
  - [GitHub Actions](https://github.com/features/actions)（自動デプロイ）

