"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Fungsi untuk mencatat log aktivitas
async function logActivity(aktivitas: string, status: "Sukses" | "Gagal") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      user_name: user.email,
      aktivitas,
      status,
    });
  }
}

// Type untuk hasil OCR per halaman
type OcrPageResult = {
  page: number;
  text: string;
};

// Helper: Merge semua hasil OCR dari multiple pages
function mergeOcrResults(results: OcrPageResult[]): string {
  return results
    .sort((a, b) => a.page - b.page)
    .map((result) => `--- HALAMAN ${result.page} ---\n${result.text}`)
    .join("\n\n");
}

// API call ke Cloudflare Worker dengan image (PNG dari PDF page)
async function sendImageToCloudflareWorker(
  imageBase64: string,
  workerUrl: string,
  authToken: string,
  pageNum: number,
  totalPages: number
): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    // Convert base64 to blob
    const binaryString = atob(imageBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/png' });

    // Create FormData - sama seperti test.html tapi dengan image
    const formData = new FormData();
    formData.append('file', blob, `page-${pageNum}.png`);

    // Send ke Worker
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });

    if (response.status === 401) {
      throw new Error('Authentication failed: Invalid auth token');
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Worker error: ${response.status} - ${errText}`);
    }

    const result = await response.json();
    
    // Debug: log the actual response
    console.log(`Worker response for page ${pageNum}:`, JSON.stringify(result, null, 2));
    
    // Extract text - try multiple possible response formats
    let extractedText = '';
    if (result.response) {
      // New format: { response: "text...", tool_calls: [...], usage: {...} }
      extractedText = result.response;
    } else if (result.result?.description) {
      extractedText = result.result.description;
    } else if (result.text) {
      extractedText = result.text;
    } else if (result.success && result.data) {
      extractedText = result.data;
    } else if (typeof result === 'string') {
      extractedText = result;
    }
    
    // If still empty, return error
    if (!extractedText || extractedText.trim() === '') {
      console.warn(`No text extracted from page ${pageNum}. Response:`, result);
      return {
        success: false,
        error: 'No text extracted from Worker response',
      };
    }

    return {
      success: true,
      text: extractedText,
    };
  } catch (error) {
    console.error(`Failed to send image (page ${pageNum}/${totalPages}) to Worker:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Server action: Update arsip dengan hasil OCR
export async function updateArsipWithOcr(
  arsipId: string,
  hasilOcr: string,
  status: "completed" | "error" = "completed"
) {
  const supabase = await createClient();

  const updateData: Record<string, any> = {
    status_ocr: status,
  };

  if (status === "completed") {
    updateData.hasil_ocr = hasilOcr;
  }

  const { error } = await supabase
    .from("arsip")
    .update(updateData)
    .eq("id", arsipId);

  if (error) {
    await logActivity(
      `Gagal menyimpan hasil OCR untuk arsip ${arsipId}`,
      "Gagal"
    );
    console.error("Database error:", error.message);
    return { success: false, error: error.message };
  }

  await logActivity(
    `OCR berhasil disimpan untuk arsip ${arsipId}`,
    "Sukses"
  );
  revalidatePath("/dashboard/arsip");
  return { success: true };
}

// Server action: Set status OCR ke 'processing'
export async function setOcrProcessing(arsipId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("arsip")
    .update({ status_ocr: "processing" })
    .eq("id", arsipId);

  if (error) {
    console.error("Failed to set OCR processing status:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Export helper untuk client-side usage
export { sendImageToCloudflareWorker, mergeOcrResults, type OcrPageResult };
