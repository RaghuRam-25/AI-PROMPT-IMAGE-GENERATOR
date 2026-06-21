'use client';
import { useState } from 'react';

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [refinedPrompt, setRefinedPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!userInput) return alert("Please type your request!");
    setLoading(true);

    // কি-ওয়ার্ড চেক করে লোডিং টেক্সট ডায়নামিক করা
    const isAlreadyPrompt = /canon|eos|8k|photorealistic|bokeh|resolution|detailed/i.test(userInput);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const response = await fetch(`${backendUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput }),
      });

      const result = await response.json();
      
      if (result.success) {
        if (isAlreadyPrompt) {
          // যদি ছবি জেনারেট মোড হয়
          setImageUrl(result.imageUrl);
          setRefinedPrompt(''); // পুরানো প্রম্পট হাইড করে দেব
        } else {
          // যদি প্রম্পট মেকিং মোড হয়
          setRefinedPrompt(result.refinedPrompt);
          setImageUrl(''); // পুরানো ছবি হাইড করে দেব
        }
      } else {
        alert(result.error || "An error occurred.");
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-50 via-indigo-50 to-blue-50 text-gray-800 flex flex-col items-center p-4 sm:p-8 font-sans">
      
      {/* Header */}
      <div className="w-full max-w-xl text-center mt-4 mb-6 relative">
        <div className="flex justify-between items-center px-2">
          <div className="w-10"></div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
            ✨ AI Image Generator
          </h1>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Type your request and get stunning images</p>
      </div>

      <div className="w-full max-w-xl flex flex-col gap-5">
        
        {/* Input Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100/80">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Prompt</label>
          <div className="relative">
            <textarea
              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 pr-10 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition"
              rows="3"
              maxLength="500"
              placeholder="ধাপ ১: এখানে সাধারণ আইডিয়া লিখুন... \nধাপ ২: এআই প্রম্পটটি কপি করে এখানে পেস্ট করুন..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <span className="absolute bottom-3 right-3 text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md font-mono">
              {userInput.length}/500 ✨
            </span>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing...
              </>
            ) : (
              /canon|eos|8k/i.test(userInput) ? 'Generate Image 🚀' : 'Generate Expert Prompt ✨'
            )}
          </button>
        </div>

        {/* Loading Spinner Box */}
        {loading && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100/80 flex flex-col items-center justify-center min-h-[120px]">
            <div className="animate-pulse flex flex-col items-center gap-2">
              <p className="text-sm text-purple-500 font-medium">AI Engine is active...</p>
              <div className="h-2 w-32 bg-purple-200 rounded"></div>
            </div>
          </div>
        )}

        {/* Card: Generated Prompt Display */}
        {!loading && refinedPrompt && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100/80">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Generated Prompt</label>
            <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed font-mono">
              {refinedPrompt}
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(refinedPrompt);
                  alert("Prompt copied! Now paste it above to generate the real image.");
                }}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-xl transition shadow-sm text-xs"
              >
                📋 Copy Prompt
              </button>
            </div>
          </div>
        )}

        {/* Card: Generated Image Display */}
        {!loading && imageUrl && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100/80">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Generated Image</label>
            <div className="relative group rounded-xl overflow-hidden bg-gray-50 border border-gray-100 min-h-[250px] flex items-center justify-center">
              <img src={imageUrl} alt="AI Photo Output" className="w-full h-auto max-h-[400px] object-cover rounded-xl" key={imageUrl} />
              <a href={imageUrl} target="_blank" rel="noreferrer" className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full shadow hover:bg-white transition">
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}