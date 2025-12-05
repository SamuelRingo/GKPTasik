# OCR Implementation Guide - Gereja Cloud

## Overview
This implementation adds PDF OCR (Optical Character Recognition) functionality to the Arsip (Archive) module using Cloudflare Workers AI. The system processes PDF files stored in Supabase Storage and extracts text using Cloudflare's AI capabilities.

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 + React 19 (TypeScript)
- **Backend**: Next.js Server Actions
- **Database**: Supabase (PostgreSQL)
- **OCR Service**: Cloudflare Workers AI
- **File Storage**: Supabase Storage

### Flow Diagram
```
User clicks OCR button in Arsip table
    ↓
OcrModal opens with PDF URL
    ↓
usePdfOcr hook fetches PDF from Supabase Storage
    ↓
Converts PDF to base64 → Blob → FormData
    ↓
Sends FormData to Cloudflare Worker with Bearer token auth
    ↓
Cloudflare Worker processes PDF and extracts text
    ↓
Returns OCR result to client
    ↓
updateArsipWithOcr saves hasil_ocr to database
    ↓
Modal displays results with copy-to-clipboard button
```

## Setup Instructions

### 1. Environment Variables
Add these to `.env.local`:

```env
# Cloudflare Worker Configuration
NEXT_PUBLIC_CLOUDFLARE_WORKER_URL=https://your-worker-url.workers.dev
CLOUDFLARE_WORKER_AUTH_TOKEN=your-auth-token
```

Get these values from your Cloudflare Worker deployment (see test.html for reference).

### 2. Database Schema
The `arsip` table should have these columns (already created):
- `id` (uuid, primary key)
- `nama_dokumen` (text) - Document name
- `kategori` (text) - Category (e.g., 'Warta')
- `url_file` (text) - URL to PDF in Supabase Storage
- `created_at` (timestamp)
- `hasil_ocr` (text) - OCR results (NULL until processed)
- `status_ocr` (enum: 'pending', 'processing', 'completed', 'error')

### 3. Required Supabase Setup
- **Storage Bucket**: `arsip` bucket with public PDFs
- **Columns**: hasil_ocr and status_ocr (already exists)
- **Server Client**: Configured in `src/utils/supabase/server.ts`

## Usage

### For Users
1. Navigate to **Dashboard → Arsip**
2. Find a PDF document in the table
3. Click the **OCR button** (document icon) in the Actions column
4. Wait for processing (shows status: "Mengirim PDF ke Worker..." → "Memproses OCR..." → "OCR Selesai!")
5. Click **Copy** to copy results to clipboard
6. Close the modal to view updated database

### For Developers

#### Main Components

**1. Hook: `usePdfOcr` (src/hooks/usePdfOcr.ts)**
```typescript
const { processPdfOcrFromUrl, isProcessing, progress, error, status } = usePdfOcr();

// status: 'idle' | 'sending' | 'processing' | 'completed' | 'error'
// isProcessing: boolean
// progress: 0-100
// error: string | null

const result = await processPdfOcrFromUrl(pdfUrl);
// Returns: { success: boolean, text: string | null, error?: string }
```

**2. Server Action: `updateArsipWithOcr` (src/app/dashboard/arsip/ocr-actions.ts)**
```typescript
const result = await updateArsipWithOcr(arsipId, hasilOcr, status);
// Updates: hasil_ocr column and status_ocr column in arsip table
// Returns: { success: boolean }
```

**3. Component: `OcrModal` (src/components/admin/OcrModal.tsx)**
```typescript
<OcrModal 
  isOpen={isOpen}
  onClose={handleClose}
  onSuccess={handleSuccess}
  arsipId={arsipId}
  fileUrl={fileUrl}
  namaDokumen={namaDokumen}
/>
```

#### Key Implementation Details

**FormData Binary Transport (ocr-actions.ts)**
```typescript
// Convert base64 PDF to Blob
const binaryString = atob(pdfBase64);
const bytes = new Uint8Array(binaryString.length);
for (let i = 0; i < binaryString.length; i++) {
  bytes[i] = binaryString.charCodeAt(i);
}
const blob = new Blob([bytes], { type: 'application/pdf' });

// Create FormData and send to Worker
const formData = new FormData();
formData.append('file', blob, 'document.pdf');
const response = await fetch(workerUrl, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${authToken}` },
  body: formData,
});
```

**Status Transitions**
- **idle** → Modal not open or ready
- **sending** → Uploading PDF to Cloudflare Worker
- **processing** → Worker extracting text from PDF
- **completed** → OCR finished, results available
- **error** → OCR failed, error message displayed

## Error Handling

### Common Errors

1. **"DOMMatrix is not defined"**
   - ❌ Old approach: Using pdf.js with dynamic worker loading
   - ✅ New approach: Direct FormData to Cloudflare Worker (eliminates pdf.js)

2. **"Cannot fetch PDF from Storage"**
   - Check: Supabase Storage bucket is public or has valid access tokens
   - Check: `url_file` in database is a valid, accessible URL

3. **"Worker returned error"**
   - Check: `NEXT_PUBLIC_CLOUDFLARE_WORKER_URL` is correct
   - Check: `CLOUDFLARE_WORKER_AUTH_TOKEN` is correct
   - Check: Cloudflare Worker is deployed and running
   - Check: Worker has AI binding configured

4. **"Database save failed"**
   - Check: User is authenticated (session exists)
   - Check: User has permission to update arsip table
   - Check: `hasil_ocr` and `status_ocr` columns exist

## Testing

### Local Testing
```bash
# 1. Start dev server
npm run dev

# 2. Navigate to Dashboard → Arsip
# 3. Click OCR button on any PDF document
# 4. Verify: 
#    - Modal shows progress
#    - Results display after processing
#    - Database updated (hasil_ocr and status_ocr)
```

### Verification Checklist
- [ ] Build succeeds: `npm run build`
- [ ] `.env.local` has CLOUDFLARE_WORKER_URL and AUTH_TOKEN
- [ ] Cloudflare Worker is deployed and accessible
- [ ] Supabase Storage bucket contains test PDFs
- [ ] OCR button appears in Arsip table for Warta category
- [ ] Modal opens without errors
- [ ] OCR processes and displays results
- [ ] Results are saved to database

## File Structure

```
src/
├── components/admin/
│   ├── OcrModal.tsx          # OCR progress & results display modal
│   └── ArsipClient.tsx        # Table with OCR button added
├── hooks/
│   └── usePdfOcr.ts          # PDF fetch, convert, send to Worker
├── app/dashboard/arsip/
│   ├── page.tsx              # Main Arsip page
│   ├── actions.ts            # Upload actions
│   └── ocr-actions.ts        # Database updates, Worker communication
├── utils/supabase/
│   └── server.ts             # Supabase client
└── app/api/
    └── ocr/ (DEPRECATED)     # No longer used (Worker direct approach)

.env.local                     # Environment variables (not in git)
.env.local.example             # Template with examples
```

## Troubleshooting

### Build Errors
```bash
# Clear build cache and rebuild
rm -rf .next
npm run build
```

### TypeScript Errors
```bash
# Check for type issues
npx tsc --noEmit
```

### Runtime Errors
```bash
# Check browser console for detailed errors
# Check Network tab to see FormData being sent to Worker
# Verify Worker URL and Auth token in .env.local
```

## References

- **Test Reference**: `test.html` - Shows working Cloudflare Worker integration pattern
- **Cloudflare AI Docs**: https://developers.cloudflare.com/workers-ai/
- **Supabase Storage**: https://supabase.com/docs/guides/storage
- **FormData API**: https://developer.mozilla.org/en-US/docs/Web/API/FormData

## Future Improvements

1. **Batch Processing**: Process multiple PDFs in queue
2. **Text Cleaning**: Post-process OCR results to fix common errors
3. **Language Detection**: Support multiple language PDFs
4. **Cost Optimization**: Cache OCR results for identical PDFs
5. **Progress Tracking**: Show detailed processing status in database
6. **Retry Logic**: Automatic retry on transient failures
