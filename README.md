<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🍌 NANOBANANA MAGIC

**Gemini AI を使った画像生成アプリ**

pixivFACTORY 向けグッズデザインも簡単に作成！

</div>

---

## 📖 目次

- [使い方（2つの方法）](#-使い方2つの方法)
- [機能一覧](#-機能一覧)
- [操作手順](#-操作手順)
- [ローカルで実行する](#-ローカルで実行する)
- [注意事項](#-注意事項)

---

## 🚀 使い方（2つの方法）

### 方法1: Google AI Studio で無料で使う（おすすめ！）

**完全無料**で画像生成ができます。

1. 下記リンクにアクセス
2. Google アカウントでログイン
3. すぐに使える！

👉 **[Google AI Studio で無料で使う](https://ai.studio/apps/drive/1fFjmvZbE4HWDvqrfhbLUD8vvICJymf58)**

---

### 方法2: 有料APIキーを使う

自分のサイトやアプリに組み込みたい場合は、有料のAPIキーが必要です。

#### 必要なもの
- **有料の Gemini API キー**（課金設定済み）
- 使用モデル: `gemini-3-pro-image-preview`

#### APIキーの取得方法
1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. APIキーを作成
3. [Google Cloud Console](https://console.cloud.google.com/) で課金を有効化
4. アプリの 🔑 ボタンからAPIキーを入力

> ⚠️ **注意**: 無料のAPIキーでは画像生成ができません（limit: 0）

---

## ✨ 機能一覧

### 🎨 画像生成
| 機能 | 説明 |
|------|------|
| **呪文（プロンプト）** | 作りたいもののキーワードを入力 |
| **世界観（テーマ）** | 30種類以上のスタイルから選択 |
| **カメラアングル** | アイレベル、ローアングル、俯瞰など |
| **キャンバス比率** | 正方形、縦長、横長、Kindle表紙など |
| **参考画像** | アップロードしてキャラを引き継ぎ |

### 🏭 pixivFACTORY 対応テーマ
- Tシャツデザイン
- アクリルスタンド
- スマホケース
- マグカップ
- トートバッグ
- キャンバスアート
- アクリルキーホルダー
- 抱き枕カバー（表裏自動生成）

### 🎮 その他の機能
- **AUTO CRAFT**: 連続自動生成（最大20回）
- **REMIX**: 他の画像の設定を引き継いで再生成
- **コレクションルーム**: 生成した画像を一覧表示
- **隠しゲーム**: バナナを3回クリックで...？

---

## 📝 操作手順

### 基本的な使い方

1. **呪文を入力**
   - 例: `宇宙猫`、`サイバーパンクな渋谷`、`かわいいドラゴン`

2. **世界観を選択**
   - 「指定なし」〜「浮世絵風」まで多数

3. **比率を選択**
   - グッズ用なら自動で最適比率に設定されます

4. **CREATE ITEM をクリック**
   - 画像が生成されます（10〜30秒）

5. **ダウンロード or シェア**
   - 生成された画像をダウンロード
   - X(Twitter) でシェア

### AUTO CRAFT（連続生成）

1. 設定を決める
2. 「AUTO CRAFT」ボタンをクリック
3. 最大20枚まで自動生成
4. 「STOP」で停止

### REMIX（設定引き継ぎ）

1. コレクションルーム（📜ボタン）を開く
2. 気に入った画像の「REMIX」をクリック
3. 呪文・世界観・アングルが引き継がれる
4. 微調整して再生成

---

## 💻 ローカルで実行する

### 必要環境
- Node.js

### 手順

```bash
# 1. 依存関係をインストール
npm install

# 2. 開発サーバーを起動
npm run dev
```

### 注意
- ローカル実行でも**有料APIキー**が必要です
- 無料で使いたい場合は Google AI Studio をご利用ください

---

## ⚠️ 注意事項

### APIについて
- **画像生成には有料APIキーが必須**です
- 無料APIキーでは `limit: 0` のエラーが出ます
- 無料で使いたい場合は [Google AI Studio](https://ai.studio/apps/drive/1fFjmvZbE4HWDvqrfhbLUD8vvICJymf58) をご利用ください

### 生成について
- 生成には10〜30秒かかります
- 内容によってはAIが生成を拒否する場合があります
- 抱き枕カバーは自動で表裏2枚生成されます

### データについて
- APIキーはブラウザのローカルストレージに保存されます
- サーバーには送信されません
- 生成した画像はセッション中のみ保持されます

---

## 🔗 リンク

- **無料で使う**: [Google AI Studio](https://ai.studio/apps/drive/1fFjmvZbE4HWDvqrfhbLUD8vvICJymf58)
- **APIキー取得**: [Google AI Studio - API Keys](https://aistudio.google.com/app/apikey)
- **グッズ作成**: [pixivFACTORY](https://factory.pixiv.net/)
- **最新ツール配布**: [LINE公式](https://lin.ee/fz5ZIFu)

---

## 📄 ライセンス

このプロジェクトは Google AI Studio で作成されました。

---

<div align="center">

**Made with 🍌 by Nanobanana Magic**

</div>
