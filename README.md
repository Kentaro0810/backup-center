# 一括バックアップ管理

`kentaro0810.github.io`配下の自作ツールが同一オリジンのlocalStorageを共有することを利用し、ブラウザーデータを1つのJSONファイルとして書き出し・復元する静的Webアプリです。

## 主な機能
- localStorageデータの一覧と容量表示
- 全データのJSON一括書き出し
- リンク集データや未分類データの除外設定
- バックアップ形式・バージョン・データ型の検証
- 追加・上書き復元
- 全置換復元
- localStorageの全削除

## 公開方法
1. GitHubで `backup-center` というPublicリポジトリを作成します。
2. 4ファイルをアップロードします。
3. Settings → Pagesでmainブランチのrootを公開します。

## 注意
GitHub Pagesの各ツールが同じオリジン `https://kentaro0810.github.io` にある場合に利用できます。sessionStorage、Cookie、IndexedDBは対象外です。
