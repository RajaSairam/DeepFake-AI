 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response("ok", { headers: corsHeaders });
   }
 
   try {
     const authHeader = req.headers.get("Authorization");
     if (!authHeader?.startsWith("Bearer ")) {
       return new Response(
         JSON.stringify({ error: "Unauthorized" }),
         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     const supabase = createClient(
       Deno.env.get("SUPABASE_URL")!,
       Deno.env.get("SUPABASE_ANON_KEY")!,
       { global: { headers: { Authorization: authHeader } } }
     );
 
     const token = authHeader.replace("Bearer ", "");
     const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
     if (claimsError || !claimsData?.user) {
       return new Response(
         JSON.stringify({ error: "Unauthorized" }),
         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     const { scanId, detectionType, textContent, fileUrl } = await req.json();
 
     if (!scanId || !detectionType) {
       return new Response(
         JSON.stringify({ error: "Missing required fields" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     console.log(`Analyzing content for scan ${scanId}, type: ${detectionType}`);
 
     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
     if (!LOVABLE_API_KEY) {
       throw new Error("LOVABLE_API_KEY is not configured");
     }
 
     // Construct the prompt based on detection type
     let systemPrompt = "";
     let userPrompt = "";
 
     switch (detectionType) {
       case "email":
         systemPrompt = `You are an expert cybersecurity analyst specializing in email phishing detection. Analyze the provided email content and identify potential phishing indicators, spoofing attempts, malicious links, social engineering tactics, and impersonation attempts.
 
 Provide your analysis in JSON format with the following structure:
 {
   "verdict": "real" | "fake" | "suspicious",
   "riskScore": 0-100,
   "confidence": "low" | "medium" | "high",
   "explanation": "Brief summary of findings",
   "indicators": ["List of specific indicators found"],
   "detailedAnalysis": "Comprehensive analysis explaining your reasoning"
 }`;
         userPrompt = `Analyze this email for potential phishing or scam indicators:\n\n${textContent}`;
         break;
 
       case "text":
       case "sms":
         systemPrompt = `You are an expert in detecting SMS and messaging scams. Analyze the provided message for signs of phishing, social engineering, urgency tactics, fake offers, and manipulation attempts.
 
 Provide your analysis in JSON format with the following structure:
 {
   "verdict": "real" | "fake" | "suspicious",
   "riskScore": 0-100,
   "confidence": "low" | "medium" | "high",
   "explanation": "Brief summary of findings",
   "indicators": ["List of specific indicators found"],
   "detailedAnalysis": "Comprehensive analysis explaining your reasoning"
 }`;
         userPrompt = `Analyze this text message for potential scam indicators:\n\n${textContent}`;
         break;
 
       case "investment":
         systemPrompt = `You are a financial fraud detection expert. Analyze the provided investment proposal for signs of Ponzi schemes, pump-and-dump schemes, fake cryptocurrency offerings, unrealistic returns promises, pressure tactics, and other financial fraud indicators.
 
 Provide your analysis in JSON format with the following structure:
 {
   "verdict": "real" | "fake" | "suspicious",
   "riskScore": 0-100,
   "confidence": "low" | "medium" | "high",
   "explanation": "Brief summary of findings",
   "indicators": ["List of specific indicators found"],
   "detailedAnalysis": "Comprehensive analysis explaining your reasoning"
 }`;
         userPrompt = `Analyze this investment proposal for potential fraud indicators:\n\n${textContent}`;
         break;
 
       case "job_offer":
         systemPrompt = `You are an expert in detecting fraudulent job offers. Analyze the provided job offer for signs of employment scams, fake companies, requests for personal information or money, unrealistic offers, and other red flags.
 
 Provide your analysis in JSON format with the following structure:
 {
   "verdict": "real" | "fake" | "suspicious",
   "riskScore": 0-100,
   "confidence": "low" | "medium" | "high",
   "explanation": "Brief summary of findings",
   "indicators": ["List of specific indicators found"],
   "detailedAnalysis": "Comprehensive analysis explaining your reasoning"
 }`;
         userPrompt = `Analyze this job offer for potential fraud indicators:\n\n${textContent}`;
         break;
 
       case "review":
         systemPrompt = `You are an expert in detecting fake reviews and ratings manipulation. Analyze the provided review for signs of artificial generation, paid reviews, coordinated campaigns, and authenticity indicators.
 
 Provide your analysis in JSON format with the following structure:
 {
   "verdict": "real" | "fake" | "suspicious",
   "riskScore": 0-100,
   "confidence": "low" | "medium" | "high",
   "explanation": "Brief summary of findings",
   "indicators": ["List of specific indicators found"],
   "detailedAnalysis": "Comprehensive analysis explaining your reasoning"
 }`;
         userPrompt = `Analyze this review for authenticity:\n\n${textContent}`;
         break;
 
       case "image":
       case "video":
       case "audio":
         // For media types, provide a placeholder analysis
         // In production, you would integrate with specialized ML models
         systemPrompt = `You are an AI assistant. The user is asking about media analysis capabilities.`;
         userPrompt = `The user uploaded a ${detectionType} file for deepfake analysis. Since you cannot directly analyze media files, provide a helpful response explaining what indicators users should look for when verifying ${detectionType} content, and note that this is a demonstration of the text analysis capabilities. Return a JSON response indicating this is a media file that would require specialized analysis.
 
 Return JSON format:
 {
   "verdict": "suspicious",
   "riskScore": 50,
   "confidence": "low",
   "explanation": "Media file uploaded - specialized analysis required",
   "indicators": ["Media file analysis requires specialized ML models", "Manual verification recommended"],
   "detailedAnalysis": "Description of what to look for in ${detectionType} deepfakes"
 }`;
         break;
 
       default:
         systemPrompt = `You are a general fraud detection expert. Analyze the provided content for any signs of scams, fraud, or manipulation.
 
 Provide your analysis in JSON format with the following structure:
 {
   "verdict": "real" | "fake" | "suspicious",
   "riskScore": 0-100,
   "confidence": "low" | "medium" | "high",
   "explanation": "Brief summary of findings",
   "indicators": ["List of specific indicators found"],
   "detailedAnalysis": "Comprehensive analysis explaining your reasoning"
 }`;
         userPrompt = `Analyze this content for potential fraud indicators:\n\n${textContent || "No text content provided"}`;
     }
 
     // Call the Lovable AI Gateway
     const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
       method: "POST",
       headers: {
         Authorization: `Bearer ${LOVABLE_API_KEY}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         model: "google/gemini-3-flash-preview",
         messages: [
           { role: "system", content: systemPrompt },
           { role: "user", content: userPrompt },
         ],
         response_format: { type: "json_object" },
       }),
     });
 
     if (!response.ok) {
       if (response.status === 429) {
         console.error("Rate limit exceeded");
         throw new Error("Rate limit exceeded. Please try again later.");
       }
       if (response.status === 402) {
         console.error("Payment required");
         throw new Error("AI credits exhausted. Please add credits to continue.");
       }
       const errorText = await response.text();
       console.error("AI gateway error:", response.status, errorText);
       throw new Error("AI analysis failed");
     }
 
     const aiResponse = await response.json();
     const analysisText = aiResponse.choices?.[0]?.message?.content;
 
     if (!analysisText) {
       throw new Error("No analysis returned from AI");
     }
 
     console.log("AI Response:", analysisText);
 
     // Parse the JSON response
     let analysis;
     try {
       analysis = JSON.parse(analysisText);
     } catch (e) {
       console.error("Failed to parse AI response:", e);
       // Fallback to default values
       analysis = {
         verdict: "suspicious",
         riskScore: 50,
         confidence: "low",
         explanation: "Analysis completed but results may be incomplete.",
         indicators: ["Manual review recommended"],
         detailedAnalysis: analysisText,
       };
     }
 
     // Validate and normalize the response
     const verdict = ["real", "fake", "suspicious"].includes(analysis.verdict)
       ? analysis.verdict
       : "suspicious";
     const riskScore = Math.min(100, Math.max(0, parseInt(analysis.riskScore) || 50));
     const confidence = ["low", "medium", "high"].includes(analysis.confidence)
       ? analysis.confidence
       : "medium";
 
     // Insert the result into the database
     const { error: insertError } = await supabase
       .from("scan_results")
       .insert({
         scan_id: scanId,
         verdict: verdict,
         risk_score: riskScore,
         confidence: confidence,
         explanation: analysis.explanation || "Analysis completed.",
         indicators: analysis.indicators || [],
         ai_analysis: analysis.detailedAnalysis || null,
       });
 
     if (insertError) {
       console.error("Error inserting result:", insertError);
       throw new Error("Failed to save analysis results");
     }
 
     // Update scan status to completed
     const { error: updateError } = await supabase
       .from("scans")
       .update({ status: "completed" })
       .eq("id", scanId);
 
     if (updateError) {
       console.error("Error updating scan status:", updateError);
     }
 
     console.log(`Analysis complete for scan ${scanId}`);
 
     return new Response(
       JSON.stringify({
         success: true,
         verdict,
         riskScore,
         confidence,
       }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error) {
     console.error("Analysis error:", error);
     return new Response(
       JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });