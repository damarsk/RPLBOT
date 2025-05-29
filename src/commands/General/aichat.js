const axios = require("axios");
require("dotenv").config();
const mongoose = require('mongoose');
const Conversation = require('../../models/Conversation');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_ID = process.env.MODEL_ID;
const MONGODB_URI = process.env.MONGODB_URI;
const AI_CHANNEL_ID = "1374642110174593078";
const MAX_TOKENS = 500000;


mongoose.connect(MONGODB_URI);

function estimateTokenCount(text) {
  
  return Math.ceil(text.length / 4);
}

module.exports.onMessage = async (message) => {
  if (message.author.bot) return;
  const channelId = message.channel.id;

  if (channelId === AI_CHANNEL_ID) {
    try {
      await message.channel.sendTyping();

      
      let convo = await Conversation.findOne({ channelId });
      if (!convo) {
        convo = new Conversation({ channelId, messages: [], totalTokens: 0 });
      }

      
      const userMsg = {
        role: "user",
        parts: [{ text: message.content }],
        tokenCount: estimateTokenCount(message.content)
      };
      convo.messages.push(userMsg);
      convo.totalTokens += userMsg.tokenCount;

      
      while (convo.totalTokens > MAX_TOKENS && convo.messages.length > 0) {
        convo.totalTokens -= convo.messages[0].tokenCount || 0;
        convo.messages.shift();
      }

      await convo.save();

      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${GEMINI_API_KEY}`;
      const requestBody = {
        contents: convo.messages.map(({ role, parts }) => ({
            role,
            parts: parts.map(({ text }) => ({ text })) 
        })),
        generationConfig: { responseMimeType: "text/plain" },
        };

      const response = await axios.post(apiUrl, requestBody);
      const aiResponse = response.data.candidates[0].content.parts[0].text;

      
      const aiMsg = {
        role: "model",
        parts: [{ text: aiResponse }],
        tokenCount: estimateTokenCount(aiResponse)
      };
      convo.messages.push(aiMsg);
      convo.totalTokens += aiMsg.tokenCount;

      
      while (convo.totalTokens > MAX_TOKENS && convo.messages.length > 0) {
        convo.totalTokens -= convo.messages[0].tokenCount || 0;
        convo.messages.shift();
      }

      await convo.save();

      
      const sendLongMessage = async (content) => {
        const maxLength = 2000;
        while (content.length > maxLength) {
          const part = content.slice(0, maxLength);
          await message.reply(part);
          content = content.slice(maxLength);
        }
        if (content.length > 0) {
          await message.reply(content);
        }
      };
      await sendLongMessage(aiResponse);

    } catch (error) {
      console.error("Error AI:", error);
      message.reply("Terjadi kesalahan saat memproses permintaan AI.");
    }
  }
};