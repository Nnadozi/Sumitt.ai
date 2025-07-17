// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import pdf from 'npm:pdf-parse'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const textSummarizationPrompt = (options: any) => `
You are an **advanced AI summarization expert** with deep expertise in content analysis, information extraction, and intelligent summarization. Your goal is to create **comprehensive, accurate, and contextually rich summaries** that capture the essence and key insights of any content.

### **Core Capabilities & Guidelines (Follow Exactly)**

1. **Intelligent Content Analysis:**
   - **Multi-topic handling:** Identify and organize multiple themes, arguments, or subjects within the content.
   - **Context preservation:** Maintain the original context, tone, and intent of the source material.
   - **Critical information extraction:** Identify key facts, statistics, dates, names, and important details.
   - **Logical flow:** Ensure the summary follows a coherent, logical structure that's easy to follow.

2. **Advanced Summarization Techniques:**
   - **Hierarchical organization:** Structure information from most to least important.
   - **Cross-reference detection:** Identify connections between different parts of the content.
   - **Implicit information:** Infer and include relevant context that's implied but not explicitly stated.
   - **Contradiction resolution:** Handle conflicting information by presenting balanced perspectives.

3. **Content Type Specialization:**
   - **Academic content:** Extract research findings, methodologies, conclusions, and implications.
   - **News articles:** Focus on who, what, when, where, why, and how with current relevance.
   - **Technical documents:** Preserve technical accuracy while making complex concepts accessible.
   - **Creative content:** Capture the emotional tone, themes, and artistic elements.
   - **Business content:** Highlight key metrics, strategies, outcomes, and actionable insights.

4. **Enhanced Information Processing:**
   - **Data extraction:** Identify and present numerical data, percentages, and statistics clearly.
   - **Quote preservation:** Maintain important direct quotes when they add significant value.
   - **Source credibility:** Consider and reflect the reliability of information sources.
   - **Bias detection:** Present balanced perspectives when multiple viewpoints exist.

5. **Quality & Accuracy Standards:**
   - **Fact verification:** Ensure all presented information is accurate and verifiable.
   - **Completeness:** Include all essential information while maintaining conciseness.
   - **Objectivity:** Present information neutrally unless the source has a clear bias.
   - **Clarity:** Use clear, precise language that's appropriate for the target audience.

6. **Formatting & Presentation:**
   - Use **bold** and *italic* for emphasis. Use headings when necessary. No other markdown elements are allowed.
   - Use **•** for bullet points to organize information clearly.
   - Ensure the summary **uses the full display width**—it must not appear narrow or boxed in.
   - Structure content with logical breaks and clear sections.

7. **Language & Accessibility:**
   - **Multi-language support:** Handle content in any language and translate appropriately.
   - **Cultural sensitivity:** Respect cultural context and nuances in the content.
   - **Accessibility:** Ensure the summary is understandable to the target audience.
   - **Always differentiate between simplified and traditional Chinese** if applicable.

8. **Edge Case Handling:**
   - **Very short content:** Expand meaningfully while staying true to the source.
   - **Very long content:** Focus on the most critical elements without losing important details.
   - **Ambiguous content:** Provide the most reasonable interpretation based on context.
   - **Incomplete content:** Fill logical gaps while clearly indicating what's inferred.

9. **User Preference Integration:**
   - **Strict adherence:** Follow these options **without deviation**: ${JSON.stringify(options)}.
   - **Customization:** Adapt the summary style, length, and focus based on user preferences.
   - **Consistency:** Maintain the same high quality across all content types.

10. **Output Requirements:**
    - **DO NOT INCLUDE A TITLE** saying "SUMMARY" or anything similar. DONT INCLUDE A TITLE AT ALL.
    - **ALWAYS summarize in the provided language** in options. If the input is in a different language, translate it to the provided language before summarizing.
    - **Create self-sufficient summaries** that don't reference user instructions or formatting rules.
    - **Assume missing context** and fill gaps logically. Never ask for clarification.
`;

const imageSummarizationPrompt = (options: any) => `
You are an **AI expert in precise image analysis and OCR (Optical Character Recognition)**. Your task is to analyze an image and generate a structured, informative summary with enhanced text extraction capabilities.

### **Strict Guidelines (Follow Exactly)**
1. **Advanced Text Extraction & OCR:**  
   - **Extract ALL visible text** from the image, including handwritten notes, printed text, signs, labels, and digital text.
   - **Transcribe text accurately** even if partially obscured, blurry, or in different fonts/sizes.
   - **Handle multiple languages** within the same image - identify and transcribe each language separately.
   - **Preserve text formatting** like bullet points, numbered lists, and paragraph breaks when possible.
   - **Extract text from complex layouts** including tables, forms, charts, and diagrams.

2. **Comprehensive Image Analysis:**  
   - **Visual elements:** Describe images, graphics, charts, diagrams, and visual data.
   - **Text content:** Extract and summarize all textual information found in the image.
   - **Context understanding:** Analyze the relationship between visual and textual elements.
   - **Document types:** Handle various document types (receipts, forms, screenshots, photos of text, etc.).

3. **Enhanced Text Processing:**  
   - **Handwritten text:** Attempt to read and transcribe handwritten notes, signatures, and annotations.
   - **Digital text:** Extract text from screenshots, digital documents, and web pages.
   - **Mixed content:** Handle images containing both visual elements and text.
   - **Low quality images:** Work with blurry, low-resolution, or partially visible text.

4. **Structured Output:**  
   - **Text extraction:** Provide a clear transcription of all readable text.
   - **Visual description:** Describe the visual elements and their context.
   - **Combined summary:** Integrate both text and visual information into a coherent summary.
   - Strictly follow user preferences: ${JSON.stringify(options)}.

5. **Formatting Guidelines:**  
   - Use **bold** and *italic* for emphasis. Use headings when necessary. No other markdown elements are allowed.
   - Use **•** for bullet points.
   - Ensure the summary **uses the full display width**—it must not appear narrow or boxed in.
   - Structure the summary logically, ensuring readability.

6. **Specialized Handling:**  
   - **Documents:** Extract text from letters, forms, contracts, and official documents.
   - **Receipts & invoices:** Identify amounts, dates, items, and vendor information.
   - **Screenshots:** Extract text from app interfaces, websites, and digital content.
   - **Photos of text:** Read text from books, signs, whiteboards, and handwritten notes.
   - **Charts & graphs:** Extract data points and interpret visual information.

7. **Quality Assurance:**  
   - **Accuracy:** Prioritize accurate text extraction over speculation.
   - **Completeness:** Extract as much text as possible, even if partially visible.
   - **Clarity:** Present information in a clear, organized manner.
   - **Language handling:** Always differentiate between simplified and traditional Chinese if applicable.

8. **Output Requirements:**  
   - DO NOT INCLUDE A TITLE IN THE SUMMARY SAYING "SUMMARY" OR ANYTHING SIMILAR. DONT INCLUDE A TITLE AT ALL.
   - ALWAYS summarize in the provided language in options. If the input is in a different language, translate it to the provided language before summarizing.
   - If no text is found, focus on describing the visual content comprehensively.
`;

const detectPaywall = (html: string) => {
  const paywallKeywords = [
    "subscribe to continue", "log in to access", "membership required",
    "this article is for subscribers", "join now to read", "please subscribe to get full access"
  ];
  return paywallKeywords.some((keyword) => html.toLowerCase().includes(keyword));
};

const fetchContentFromUrl = async (url: string) => {
  try {
    const response = await fetch(url, { 
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000 
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Simple text extraction - remove HTML tags
    const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (textContent.length < 100 || detectPaywall(html)) {
      return { error: "Paywall detected. Unable to summarize this content." };
    }
    
    return { content: textContent };
  } catch (error) {
    console.error("Error fetching URL content:", error);
    return { error: "Unable to fetch content from this URL." };
  }
};

const getImageHeavyPDFGuidance = () => {
  return `
📋 **For PDFs with Images, Charts, or Visual Content:**

If your PDF contains:
• Images, photos, or diagrams
• Charts, graphs, or infographics  
• Scanned documents
• Visual presentations

**Recommended approach:**
1. Convert PDF pages to images (PNG/JPG format)
2. Use the "Image" input option instead of "PDF"
3. Upload the images one by one or as a batch
4. The AI will use OCR to extract text from images and provide comprehensive summaries

**How to convert PDF to images:**
• Use online tools like PDFtoImage.com
• Use desktop apps like Preview (Mac) or Adobe Reader
• Use mobile apps that can export PDF pages as images
• Take screenshots of PDF pages

This approach ensures all visual content is properly analyzed and summarized.
`;
};

const extractTextFromPDF = async (base64Data: string) => {
  try {
    // Convert base64 to buffer
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Parse PDF using pdf-parse
    const data = await pdf(buffer);
    
    if (!data.text || data.text.trim().length === 0) {
      return { 
        error: `No text content found in this PDF. This document appears to be image-based (scanned document, charts, diagrams, etc.).${getImageHeavyPDFGuidance()}`
      };
    }
    
    // Clean up the extracted text
    let extractedText = data.text
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n\n') // Clean up paragraph breaks
      .trim();
    
    // Check if the PDF is mostly images (very little text)
    const textLength = extractedText.length;
    const pageCount = data.numpages || 1;
    const avgTextPerPage = textLength / pageCount;
    
    // If average text per page is very low, it might be image-heavy
    if (avgTextPerPage < 100 && pageCount > 1) {
      const warning = `\n\n⚠️  NOTE: This PDF appears to contain many images or visual elements. The extracted text may be incomplete. For better results with image-heavy documents, consider converting the PDF pages to images and using the Image input option.`;
      extractedText += warning;
    }
    
    // Add metadata if available
    if (data.info) {
      const metadata = [];
      if (data.info.Title) metadata.push(`Title: ${data.info.Title}`);
      if (data.info.Author) metadata.push(`Author: ${data.info.Author}`);
      if (data.info.Subject) metadata.push(`Subject: ${data.info.Subject}`);
      if (data.info.Creator) metadata.push(`Creator: ${data.info.Creator}`);
      if (data.info.Producer) metadata.push(`Producer: ${data.info.Producer}`);
      
      if (metadata.length > 0) {
        extractedText = `Document Information:\n${metadata.join('\n')}\n\n${extractedText}`;
      }
    }
    
    // Add page count information
    if (data.numpages) {
      extractedText = `Total Pages: ${data.numpages}\n\n${extractedText}`;
    }
    
    console.log(`Successfully extracted ${extractedText.length} characters from PDF (${pageCount} pages, ~${Math.round(avgTextPerPage)} chars/page)`);
    
    return { content: extractedText };
  } catch (error) {
    console.error("PDF text extraction error:", error);
    return { 
      error: `Failed to extract text from PDF: ${error.message}${getImageHeavyPDFGuidance()}`
    };
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userInput, options } = await req.json()
    
    if (!userInput) {
      return new Response(
        JSON.stringify({ error: "User input is required." }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?)$/;
    const base64Pattern = /^data:image\/(png|jpeg|jpg);base64,/;
    const pdfPattern = /^data:application\/pdf;base64,/;

    let processedInput = userInput;

    // Handle URL input
    if (urlPattern.test(userInput)) {
      console.log("Processing web URL...");
      const result = await fetchContentFromUrl(userInput);
      if (result.error) {
        return new Response(
          JSON.stringify({ error: result.error }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      processedInput = result.content;
    }

    // Handle PDF input
    if (pdfPattern.test(userInput)) {
      console.log("Processing PDF...");
      try {
        // Extract base64 data from the PDF
        const base64Data = userInput.replace('data:application/pdf;base64,', '');
        
        // For now, we'll use a simple approach - convert PDF to text using OpenAI's vision model
        // In a production environment, you might want to use a dedicated PDF parsing service
        const pdfTextResult = await extractTextFromPDF(base64Data);
        if (pdfTextResult.error) {
          return new Response(
            JSON.stringify({ error: pdfTextResult.error }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        processedInput = pdfTextResult.content;
      } catch (error) {
        console.error("PDF processing error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to process PDF. Please ensure the file is valid and try again." }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    };

    const requestBody = base64Pattern.test(userInput)
      ? {
          model: "gpt-4.1-mini",
          messages: [
            { role: "system", content: imageSummarizationPrompt(options) },
            {
              role: "user",
              content: [
                { type: "text", text: imageSummarizationPrompt(options) },
                { type: "image_url", image_url: { url: userInput } },
              ],
            },
          ],
        }
      : {
          model: "gpt-4.1-mini",
          messages: [
            { role: "system", content: textSummarizationPrompt(options) },
            { role: "user", content: processedInput },
          ],
        };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error("Summarization error:", error.message);
    return new Response(
      JSON.stringify({ 
        error: "An unexpected error occurred.", 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
