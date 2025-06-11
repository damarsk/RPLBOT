const axios = require("axios");
require("dotenv").config();
const Conversation = require('../../models/Conversation');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_ID = process.env.MODEL_ID;
const AI_CHANNEL_ID = "1374642110174593078";
const MAX_TOKENS = 500000;

function estimateTokenCount(text) {
  return Math.ceil(text.length / 4);
}

/**
 * SmartChunking untuk memotong pesan berdasarkan kalimat dan kata
 * @param {string} content - Konten yang akan dipotong
 * @param {number} maxLength - Panjang maksimal per chunk (default: 2000)
 * @returns {string[]} - Array dari chunks
 */
function smartChunking(content, maxLength = 2000) {
  if (content.length <= maxLength) {
    return [content];
  }

  const chunks = [];
  let remainingContent = content;

  while (remainingContent.length > 0) {
    if (remainingContent.length <= maxLength) {
      chunks.push(remainingContent);
      break;
    }

    let chunkEnd = maxLength;
    let chunk = remainingContent.slice(0, chunkEnd);

    // Prioritas 1: Cari akhir paragraf (\n\n)
    const paragraphEnd = chunk.lastIndexOf('\n\n');
    if (paragraphEnd > maxLength * 0.5) { // Minimal 50% dari maxLength
      chunkEnd = paragraphEnd + 2;
    }
    // Prioritas 2: Cari akhir kalimat (. ! ?)
    else {
      const sentenceEnds = [
        chunk.lastIndexOf('. '),
        chunk.lastIndexOf('! '),
        chunk.lastIndexOf('? '),
        chunk.lastIndexOf('.\n'),
        chunk.lastIndexOf('!\n'),
        chunk.lastIndexOf('?\n')
      ];
      
      const lastSentenceEnd = Math.max(...sentenceEnds);
      if (lastSentenceEnd > maxLength * 0.3) { // Minimal 30% dari maxLength
        chunkEnd = lastSentenceEnd + (chunk[lastSentenceEnd + 1] === '\n' ? 2 : 2);
      }
      // Prioritas 3: Cari akhir baris (\n)
      else {
        const lineEnd = chunk.lastIndexOf('\n');
        if (lineEnd > maxLength * 0.2) { // Minimal 20% dari maxLength
          chunkEnd = lineEnd + 1;
        }
        // Prioritas 4: Cari spasi terakhir
        else {
          const lastSpace = chunk.lastIndexOf(' ');
          if (lastSpace > maxLength * 0.1) { // Minimal 10% dari maxLength
            chunkEnd = lastSpace + 1;
          }
          // Jika tidak ada spasi yang cocok, potong paksa di maxLength
        }
      }
    }

    chunk = remainingContent.slice(0, chunkEnd).trim();
    chunks.push(chunk);
    remainingContent = remainingContent.slice(chunkEnd).trim();
  }

  return chunks;
}

/**
 * Mengirim pesan panjang dengan SmartChunking
 * @param {Object} message - Discord message object
 * @param {string} content - Konten yang akan dikirim
 * @param {number} maxLength - Panjang maksimal per pesan (default: 2000)
 */
async function sendSmartChunkedMessage(message, content, maxLength = 2000) {
  try {
    const chunks = smartChunking(content, maxLength);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Tambahkan indikator untuk pesan multi-part
      let finalChunk = chunk;
      if (chunks.length > 1) {
        if (i === 0) {
          finalChunk = `${chunk}`;
        } else if (i === chunks.length - 1) {
          finalChunk = `${chunk}`;
        } else {
          finalChunk = `${chunk}`;
        }
      }
      
      await message.reply(finalChunk);
      
      // Delay kecil untuk menghindari rate limit
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  } catch (error) {
    console.error("Error sending chunked message:", error);
    await message.reply("Terjadi kesalahan saat mengirim pesan.");
  }
}

module.exports.onMessage = async (message) => {
  if (message.author.bot) return;
  const channelId = message.channel.id;

  if (channelId === AI_CHANNEL_ID) {
    try {
      await message.channel.sendTyping();

      // Cari atau buat conversation
      let convo = await Conversation.findOne({ channelId });
      if (!convo) {
        convo = new Conversation({ channelId, messages: [], totalTokens: 0 });
      }

      // Tambahkan pesan user
      const userMsg = {
        role: "user",
        parts: [{ text: message.content }],
        tokenCount: estimateTokenCount(message.content)
      };
      convo.messages.push(userMsg);
      convo.totalTokens += userMsg.tokenCount;

      // Trim conversation jika melebihi MAX_TOKENS
      while (convo.totalTokens > MAX_TOKENS && convo.messages.length > 0) {
        convo.totalTokens -= convo.messages[0].tokenCount || 0;
        convo.messages.shift();
      }

      await convo.save();

      // Kirim request ke Gemini API
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

      // Simpan response AI
      const aiMsg = {
        role: "model",
        parts: [{ text: aiResponse }],
        tokenCount: estimateTokenCount(aiResponse)
      };
      convo.messages.push(aiMsg);
      convo.totalTokens += aiMsg.tokenCount;

      // Trim conversation lagi setelah menambah response AI
      while (convo.totalTokens > MAX_TOKENS && convo.messages.length > 0) {
        convo.totalTokens -= convo.messages[0].tokenCount || 0;
        convo.messages.shift();
      }

      await convo.save();

      // Kirim response menggunakan SmartChunking
      await sendSmartChunkedMessage(message, aiResponse);

    } catch (error) {
      console.error("Error AI:", error);
      message.reply("Terjadi kesalahan saat memproses permintaan AI.");
    }
  }
};