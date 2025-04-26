// ==============================
// 🌱 環境変数をロード
// ==============================
require('dotenv').config();

// ==============================
// 📦 必要なライブラリ
// ==============================
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

// ==============================
// 🌐 ダミーWebサーバー（Renderヘルスチェック用）
// ==============================
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot is alive!'));
app.listen(PORT, () => console.log(`✅ Web server is listening on port ${PORT}`));

// ==============================
// 🤖 Discord Botの起動設定
// ==============================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  presence: {
    status: 'online',
    activities: [{
      name: '通知待機中🔔',
      type: 3, // WATCHING = 3
    }],
  },
});

// ==============================
// 🔑 トークンチェックしてログイン
// ==============================
const TOKEN = process.env.TOKEN;
if (!TOKEN) {
  console.error('❌ TOKEN環境変数が未設定です！');
  process.exit(1);
}
client.login(TOKEN);

// ==============================
// 🎉 Bot起動時の処理
// ==============================
client.once('ready', () => {
  console.log(`🎉 ${client.user.tag} がログインしました！`);
});

// ==============================
// 🔔 チャンネルとロールの対応表
// ==============================
const CHANNEL_ROLE_MAP = {
  '1364116532992413728': '1365148542724739113', // マルチ募集チャンネル → マルチ通知ロール
  '1364124380111835177': '1365221370258133023', // Q&Aチャンネル → Q&A通知ロール
  '1363744830966075493': '1365217879947083797', // サーバーお知らせチャンネル → お知らせ通知ロール
  // 必要ならここに追加！
};

// ==============================
// 📩 メッセージ受信時の処理
// ==============================
client.on('messageCreate', (message) => {
  if (message.author.bot) return; // Botのメッセージは無視

  const roleId = CHANNEL_ROLE_MAP[message.channel.id];
  if (roleId) {
    message.channel.send({
      content: `<@&${roleId}> が来ているよ〜！`
    });
  }
});

// ==============================
// ⚡ エラーハンドリング（落ちないBotに強化）
// ==============================
client.on('error', error => console.error('❌ クライアントエラー:', error));
client.on('shardError', error => console.error('❌ シャードエラー:', error));
process.on('unhandledRejection', error => console.error('❌ 未処理のPromiseエラー:', error));
process.on('uncaughtException', error => console.error('❌ 未処理の例外エラー:', error));

// ==============================
// ⏰ スリープ防止のため10分ごとにログ出力
// ==============================
setInterval(() => {
  console.log('💤 Bot is still running...');
}, 10 * 60 * 1000); // 10分ごと
