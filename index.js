// ==============================
// 🌱 環境変数をロード
// ==============================
require('dotenv').config();

// ==============================
// 📦 必要なライブラリ
// ==============================
const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

// ==============================
// 🌐 ダミーWebサーバー（Renderヘルスチェック用）
// ==============================
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot is alive!'));
app.listen(PORT, () => console.log(`✅ Web server is listening on port ${PORT}`));

// ==============================
// 🤖 Discordクライアント設定
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
      type: 3, // WATCHING
    }],
  },
});

// ==============================
// 🔑 ログイン処理
// ==============================
function loginBot(token) {
  if (!token) {
    console.error('❌ TOKEN環境変数が未設定です！');
    process.exit(1);
  }
  client.login(token);
}
loginBot(process.env.TOKEN);

// ==============================
// 🎉 Bot起動時の処理
// ==============================
client.once('ready', () => {
  console.log(`🎉 ${client.user.tag} がログインしました！`);
});

// ==============================
// 🔔 通知対象チャンネル → ロール対応表
// ==============================
const NOTIFY_ROLE_BY_CHANNEL = {
  '1364116532992413728': '1365148542724739113', // マルチ募集
  '1364124380111835177': '1365221370258133023', // Q&A
  '1363744830966075493': '1365217879947083797', // お知らせ
};

// ==============================
// 📩 メッセージ受信時の通知処理（埋め込み対応）
// ==============================
function notifyRoleIfMapped(message) {
  if (message.author.bot) return;

  const roleId = NOTIFY_ROLE_BY_CHANNEL[message.channel.id];
  if (!roleId) return;

  const embed = new EmbedBuilder()
    .setTitle('🔔 通知が届きました！')
    .setDescription(`<@&${roleId}> が来ているよ！`)
    .setColor(0x00BFFF)
    .setTimestamp();

  message.channel.send({
    content: `<@&${roleId}>`, // メンション通知用（Embed内はPingされない）
    embeds: [embed],
  });
}

client.on('messageCreate', notifyRoleIfMapped);

// ==============================
// ⚡ エラーハンドリング
// ==============================
function handleError(type, error) {
  console.error(`❌ ${type}:`, error);
}

client.on('error', error => handleError('クライアントエラー', error));
client.on('shardError', error => handleError('シャードエラー', error));
process.on('unhandledRejection', error => handleError('未処理のPromiseエラー', error));
process.on('uncaughtException', error => handleError('未処理の例外エラー', error));

