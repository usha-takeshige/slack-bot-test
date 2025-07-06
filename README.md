# Slack Bot - Greeting System

Slackでメンションされたときに、メッセージ内容に応じて返答するボットシステムです。

## 機能

- 「おはよう」→「こんにちは」と返答
- 「hello」→「good night」と返答
- その他のメッセージには理解できない旨を返答

## セットアップ手順

### 1. Slackアプリの作成

1. [Slack API](https://api.slack.com/apps)にアクセス
2. 「Create New App」をクリック
3. 「From scratch」を選択
4. アプリ名とワークスペースを設定

### 2. Slack アプリの設定

#### OAuth & Permissions
1. 左メニューの「OAuth & Permissions」をクリック
2. 「Scopes」セクションで以下のBot Token Scopesを追加：
   - `app_mentions:read`
   - `chat:write`
   - `im:read`
   - `im:write`

#### Event Subscriptions
1. 左メニューの「Event Subscriptions」をクリック
2. 「Enable Events」をONに設定
3. 「Request URL」に以下を設定：
   - `https://your-vercel-app.vercel.app/api/slack`
4. 「Subscribe to bot events」で以下を追加：
   - `app_mention`
   - `message.im`

### 3. 環境変数の設定

#### ローカル開発環境
`.env.local`ファイルを作成し、以下を設定：

```
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
```

#### Vercel環境
1. Vercelダッシュボードでプロジェクトを選択
2. 「Settings」→「Environment Variables」で以下を追加：
   - `SLACK_BOT_TOKEN`: SlackアプリのBot User OAuth Token

### 4. ボットトークンの取得

1. Slack APIのアプリ設定で「OAuth & Permissions」を選択
2. 「Install to Workspace」をクリック
3. 生成された「Bot User OAuth Token」を環境変数に設定

### 5. デプロイ

```bash
npm run build
vercel --prod
```

## 使い方

1. Slackワークスペースでボットをチャンネルに招待
2. ボットをメンションして以下のメッセージを送信：
   - `@bot おはよう` → 「こんにちは」と返答
   - `@bot hello` → 「good night」と返答

## 開発

```bash
# 依存関係のインストール
npm install

# ローカル開発サーバーの起動
npm run dev
```

## API エンドポイント

- `/api/slack` - Slack Events APIからのWebhookを処理
- `/api/greeting` - 既存のGreeting API（テスト用）

## 注意事項

- Slackアプリの設定でRequest URLを正しく設定してください
- 環境変数のSLACK_BOT_TOKENは必須です
- 本番環境では署名検証の実装を推奨します 