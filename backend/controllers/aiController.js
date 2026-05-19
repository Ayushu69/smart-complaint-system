const Complaint = require("../models/Complaint");

// @desc    Analyze a complaint using OpenRouter AI
// @route   POST /api/ai/analyze
// @access  Private
const analyzeComplaint = async (req, res) => {
  const { complaintId } = req.body;

  try {
    // Guard: make sure the API key is actually set
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "your_openrouter_api_key_here") {
      return res.status(500).json({
        success: false,
        message: "OPENROUTER_API_KEY is not configured in .env",
      });
    }

    if (!complaintId) {
      return res.status(400).json({ success: false, message: "complaintId is required" });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    // Verify ownership or admin
    if (complaint.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const prompt = `You are an AI assistant for a government complaint management system. Analyze the following complaint and return a JSON response only, with no extra text or markdown.

Complaint Details:
- Title: ${complaint.title}
- Category: ${complaint.category}
- Description: ${complaint.description}
- Location: ${complaint.location}

Return ONLY this exact JSON structure:
{
  "priority": "<Low|Medium|High|Critical>",
  "department": "<responsible government department name>",
  "summary": "<2-3 sentence summary of the complaint>",
  "autoResponse": "<a polite, professional automated response message to send to the citizen who filed this complaint>"
}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000",  // required by OpenRouter
        "X-Title": "Smart Complaint System",       // optional but good practice
      },
      body: JSON.stringify({
        model: "openrouter/auto",   // free tier auto-routing
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024,
      }),
    });

    const data = await response.json();

    // OpenRouter error (e.g. bad key, quota exceeded)
    if (!response.ok || data.error) {
      console.error("OpenRouter error:", data.error);
      return res.status(502).json({
        success: false,
        message: data.error?.message || "OpenRouter API error",
        code: data.error?.code,
      });
    }

    const rawText = data.choices?.[0]?.message?.content?.trim();

    if (!rawText) {
      return res.status(500).json({ success: false, message: "Empty response from AI" });
    }

    // Parse AI response — strip any accidental markdown fences
    let aiResult;
    try {
      const cleanText = rawText.replace(/```json|```/g, "").trim();
      aiResult = JSON.parse(cleanText);
    } catch (parseErr) {
      return res.status(500).json({
        success: false,
        message: "Failed to parse AI response as JSON",
        rawResponse: rawText,
      });
    }

    // Save AI analysis back to complaint
    complaint.aiAnalysis = {
      priority: aiResult.priority,
      department: aiResult.department,
      summary: aiResult.summary,
      autoResponse: aiResult.autoResponse,
    };
    await complaint.save();

    res.json({
      success: true,
      message: "AI analysis complete",
      data: {
        complaintId: complaint._id,
        title: complaint.title,
        analysis: complaint.aiAnalysis,
      },
    });
  } catch (error) {
    console.error("AI Controller Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { analyzeComplaint };
