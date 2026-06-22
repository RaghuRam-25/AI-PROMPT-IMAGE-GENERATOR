const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

// CORS এবং JSON মিডলওয়্যার
app.use(cors());
app.use(express.json());

// Hugging Face ফ্রি ইনফ্যারেন্স ফাংশন
async function queryHF(modelId, payload) {
  return await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
    headers: { 
      Authorization: `Bearer ${process.env.HF_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    method: "POST",
    body: JSON.stringify(payload),
  });
}

app.post('/api/generate', async (req, res) => {
  const { userInput } = req.body;

  if (!userInput) {
    return res.status(400).json({ error: "Input is required!" });
  }

  // কি-ওয়ার্ড চেকিং: ইনপুটটি কি সাধারণ আইডিয়া নাকি অলরেডি এআই প্রম্পট?
  const isAlreadyPrompt = /canon|eos|8k|photorealistic|bokeh|resolution|detailed/i.test(userInput);

  let refinedPrompt = "";
  let imageUrl = "";

  try {
    if (!isAlreadyPrompt) {
      // 📝 মোড ১: শুধুমাত্র প্রম্পট জেনারেট হবে (কোনো ছবি নয়)
      console.log("মোড ১: এআই প্রম্পট তৈরি করছে...");
      
      const llmModel = "Qwen/Qwen2.5-7B-Instruct";
      const systemPrompt = `You are an expert AI prompt engineer. Expand the user's simple concept into a highly detailed, photorealistic, and descriptive image prompt suitable for Midjourney and Bing. Include professional camera terms like 'Shot on Canon EOS R5, 85mm lens, photorealistic, 8k resolution'. Keep it under 60 words. Respond ONLY with the expanded prompt text, no explanations.`;
      
      try {
        const textResponse = await queryHF(llmModel, {
          inputs: `<|im_start|>system\n${systemPrompt}<|im_end|>\n<|im_start|>user\n${userInput}<|im_end|>\n<|im_start|>assistant\n`,
          parameters: { max_new_tokens: 100, temperature: 0.7 }
        });

        if (textResponse.ok) {
          const textResult = await textResponse.json();
          const generatedText = textResult[0]?.generated_text || "";
          
          // টেক্সট স্প্লিট করার সেফটি হ্যান্ডলিং
          if (generatedText.includes("<|im_start|>assistant\n")) {
            refinedPrompt = generatedText.split("<|im_start|>assistant\n")[1]?.replace("<|im_end|>", "").trim();
          } else {
            refinedPrompt = generatedText.trim();
          }
        }
      } catch (e) {
        console.log("HF API Offline, using template fallback...", e.message);
      }

      // যদি API কোনো কারণে রেসপন্স না দেয় বা প্রম্পট খালি থাকে
      if (!refinedPrompt) {
        refinedPrompt = `Award-winning National Geographic editorial photo of ${userInput}, candid documentary style. Shot on Canon EOS R5 with an 85mm f/1.4 lens, photorealistic, sharp focus, crisp 8k resolution, cinematic atmosphere.`;
      }
    } else {
      // 🎨 মোড ২: ইনপুট অলরেডি প্রম্পট, তাই সরাসরি ছবি জেনারেট হবে
      console.log("মোড ২: সরাসরি ছবি তৈরি হচ্ছে...");
      refinedPrompt = userInput; 
      const cleanInput = encodeURIComponent(userInput.trim());
      imageUrl = `https://image.pollinations.ai/p/${cleanInput}?width=800&height=500&nologo=true`;
    }

    // ডাটাবেজে সেভ করা
    try {
      await prisma.generation.create({
        data: { userInput, refinedPrompt, imageUrl: imageUrl || "" }
      });
    } catch (dbError) {
      console.log("Database write skipped:", dbError.message);
    }

    // ফ্রন্টএন্ডে রেজাল্ট পাঠানো
    res.status(200).json({
      success: true,
      refinedPrompt: isAlreadyPrompt ? "" : refinedPrompt, // মোড ২ এ নতুন প্রম্পট খালি থাকবে
      imageUrl: imageUrl // মোড ১ এ ইমেজ খালি থাকবে
    });

  } catch (error) {
    console.error("Main Server Error:", error);
    res.status(500).json({ error: "সার্ভার প্রসেসিং ব্যর্থ হয়েছে।" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server actively running on: http://localhost:${PORT}`);
});