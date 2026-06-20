const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.post('/api/generate', async (req, res) => {
  const { userInput } = req.body;

  if (!userInput) {
    return res.status(400).json({ error: "Input is required!" });
  }

  try {
    // ১. ইউনিভার্সাল এআই মাস্টার প্রম্পট
   const refinedPrompt = `A truly authentic real-world photograph of ${userInput}, visually indistinguishable from an actual professional camera capture, with zero AI-generated appearance. Captured in a spontaneous candid documentary moment with natural emotion and believable presence. No posing, no staged expression, no artificial perfection. Photographed on Canon EOS R5 with RF 85mm f/1.4L lens, shutter speed 1/1200s, ISO 400, full-frame sensor rendering, realistic optical characteristics, natural depth compression, accurate focal behavior. Natural early-morning ambient light with soft atmospheric diffusion, physically accurate light falloff, realistic shadow gradients, subtle indirect bounce light, true dynamic range, natural highlight roll-off. Extremely realistic skin and surface rendering: visible pores, tiny asymmetry, natural skin variation, realistic hair texture, micro-contrast, true material response, lifelike reflections, authentic environmental interaction. Documentary-grade composition with believable framing, cinematic foreground separation, natural negative space, immersive depth, premium editorial storytelling. True camera realism: RAW photo aesthetic, accurate color science, realistic white balance, subtle sensor noise, natural edge softness, organic detail retention, film-quality tonal transitions. No CGI, no AI artifacts, no plastic skin, no excessive smoothness, no oversharpening, no fake HDR, no unrealistic glow, no overprocessed colors, no synthetic details. Final result should resemble an untouched high-end editorial photograph selected for publication, completely believable as a real captured moment.`;

    // ২. স্পেস বা খালি জায়গাগুলোকে ইউআরএল ফ্রেন্ডলি করা (সবচেয়ে গুরুত্বপূর্ণ লাইন)
    const cleanInput = encodeURIComponent(userInput.trim());
    
    // ৩. রিয়েল-টাইম এআই ইমেজ লিংক জেনারেটর
    const imageUrl = `https://image.pollinations.ai/p/${cleanInput}?width=600&height=400&nologo=true`;

    console.log("image:", imageUrl);

    // ৪. ডাটাবেজে ডাটা সেভ করা
    const savedData = await prisma.generation.create({
      data: { userInput, refinedPrompt, imageUrl }
    });

    res.status(200).json({
      success: true,
      refinedPrompt: savedData.refinedPrompt,
      imageUrl: savedData.imageUrl
    });

  } catch (error) {
    console.error("Main Server Error:", error);
    res.status(500).json({ error: "সার্ভার প্রসেসিং ব্যর্থ হয়েছে।" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server actively running on: http://localhost:${PORT}`);
});