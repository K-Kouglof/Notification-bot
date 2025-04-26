require('dotenv').config(); // ←追加！

const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 3000;

// ダミーWebサーバー
app.get('/', (req, res) => res.send('Bot is alive!'));
app.listen(PORT, () => console.log(`Web server is listening on port ${PORT}`));

// Discord Bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  presence: {
    status: 'online', // ←追加！
    activities: [{
      name: '通知待機中🔔', // 好きな文章でOK
      type: 'WATCHING',    // PLAYING, LISTENING, WATCHING, STREAMING から選べる
    }],
  },
});

// トークンをここに入れる
client.login(process.env.TOKEN);

// ログイン時の確認メッセージ
client.on('ready', () => {
  console.log(`${client.user.tag} がログインしました！`);
});

// ✅ 複数チャンネルとロールの対応表
const CHANNEL_ROLE_MAP = {
  '1364116532992413728': '1365148542724739113', // マルチ募集チャンネル → マルチ通知ロール
  '1364124380111835177': '1365221370258133023', // Q&Aチャンネル → Q&A通知ロール
  '1363744830966075493': '1365217879947083797', // サーバーお知らせチャンネル→お知らせ通知ロール
  // 必要に応じて追加してね
};

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  const roleId = CHANNEL_ROLE_MAP[message.channel.id];
  if (roleId) {
    message.channel.send(`<@&${roleId}> が来ているよ〜！`);
  }
});

console.log('トークン:', process.env.TOKEN ? 'あり' : 'なし');

// スリープ防止のために10分ごとにログ出力
setInterval(() => {
  console.log('Bot is still running...');
}, 10 * 60 * 1000); // 10分ごと
