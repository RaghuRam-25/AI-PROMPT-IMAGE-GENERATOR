'use client';
import { useState } from 'react';

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [refinedPrompt, setRefinedPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!userInput) return alert("অনুগ্রহ করে কিছু লিখুন!");
    setLoading(true);
    setRefinedPrompt('');
    setImageUrl('');

    try {
      // Vercel-এর এনভায়রনমেন্ট ভ্যারিয়েবল চেক করা হচ্ছে। না থাকলে ডিফল্ট লোকালহোস্ট ব্যবহার করবে।
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const response = await fetch(`${backendUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput }),
      });

      const result = await response.json();
      
      if (result.success) {
        setRefinedPrompt(result.refinedPrompt);
        setImageUrl(result.imageUrl);
      } else {
        alert(result.error || "কোনো समस्या হয়েছে, আবার চেষ্টা করো।");
      }
    } catch (error) {
      console.error(error);
      alert("ব্যাকএন্ড সার্ভার কানেক্ট করা যাচ্ছে না। নিশ্চিত করুন আপনার ব্যাকএন্ড সচল আছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-2 text-blue-400">AI Prompt & Image Generator</h1>
      <p className="text-gray-400 mb-8 text-center max-w-md">তোমার অগোছালো আইডিয়াটি নিচে লেখো। আমাদের এআই সেটিকে নিখুঁত করে ছবি ও প্রম্পট বানিয়ে দেবে।</p>

      <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
        <textarea
          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
          placeholder="যেমন: একটি বিড়াল চাঁদে বসে চা খাচ্ছে..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
        >
          {loading ? 'এআই ভাবছে... একটু অপেক্ষা করো...' : 'ম্যাজিক শুরু করো ✨'}
        </button>

        {(refinedPrompt || imageUrl) && (
          <div className="mt-8 border-t border-gray-700 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center justify-center bg-gray-900 p-4 rounded-lg border border-gray-700 min-h-[300px]">
              {imageUrl ? (
                <img src={imageUrl} alt="AI Generated" className="rounded-lg max-w-full h-auto object-cover" key={imageUrl} />
              ) : (
                <p className="text-gray-500">ছবি তৈরি হচ্ছে...</p>
              )}
            </div>

            <div className="flex flex-col justify-between bg-gray-900 p-4 rounded-lg border border-gray-700">
              <div>
                <h3 className="text-md font-semibold text-blue-400 mb-2">যেকোনো AI (ChatGPT/Midjourney/Bing)-এর জন্য ইউনিভার্সাল প্রম্পট:</h3>
                <p className="text-sm text-gray-300 italic">"{refinedPrompt}"</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(refinedPrompt);
                  alert("প্রম্পট কপি হয়েছে!");
                }}
                className="mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition text-sm"
              >
                📋 প্রম্পট কপি করো
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}