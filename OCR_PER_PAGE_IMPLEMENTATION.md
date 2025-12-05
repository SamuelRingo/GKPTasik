# OCR Per-Page Implementation Guide

## Problem & Solution

**Problem**: Cloudflare Worker vision model can't handle large PDF files directly - returned "Request is too large" (3006 error)

**Solution**: Convert PDF to PNG images per page and send each page image to the Worker for OCR processing

## Architecture Changes

### Before (Failed Approach)
```
PDF URL → Base64 Encode → Send entire PDF to Worker → Error: Too Large
```

### After (Working Approach)
```
PDF URL → Fetch as ArrayBuffer
         → Page 1 → Canvas → PNG → Send to Worker → Extract Text
         → Page 2 → Canvas → PNG → Send to Worker → Extract Text
         → Page N → Canvas → PNG → Send to Worker → Extract Text
         → Combine Results with Page Headers
```

## Implementation Details

### 1. Updated `src/hooks/usePdfOcr.ts`

**Key Changes**:
- Dynamic import of pdf.js to avoid SSR issues
- Added `loadPdfJs()` function with CDN worker source
- Changed from `fetchPdfAsBase64()` to `fetchPdfAsArrayBuffer()`
- Added `convertPdfPageToPng()` function that:
  - Creates canvas element
  - Renders PDF page at 2x scale for better OCR quality
  - Converts canvas to PNG base64 string
- Loop through all pages and process each individually
- Updated import: `sendPdfToCloudflareWorker` → `sendImageToCloudflareWorker`
- Results are combined with page headers: `--- HALAMAN {pageNum} ---`

**Key Function**:
```typescript
async function convertPdfPageToPng(
  pdfArrayBuffer: ArrayBuffer,
  pageNum: number,
  pdfjsLib: any
): Promise<string>
```

### 2. Updated `src/app/dashboard/arsip/ocr-actions.ts`

**Function**: `sendImageToCloudflareWorker()`
- Replaces `sendPdfToCloudflareWorker()`
- Accepts PNG image base64 instead of PDF base64
- Sends with MIME type: `image/png` (not `application/pdf`)
- FormData filename: `page-{pageNum}.png`
- Accepts pageNum and totalPages for logging
- Returns object: `{ success: boolean; text?: string; error?: string }`

**Benefits**:
- PNG images are much smaller than full PDFs
- Vision models handle images better than PDFs
- Each page processed independently = fault tolerance
- If one page fails, processing continues with next page

### 3. Export Update
```typescript
// OLD
export { sendPdfToCloudflareWorker, ... }

// NEW
export { sendImageToCloudflareWorker, ... }
```

## Progress Tracking

```
Loading PDF               : Progress 10-20%
Fetching PDF from URL     : Progress 20-30%
Converting pages to PNG   : Progress 30-90% (distributed per page)
Sending to Worker & OCR   : Progress 30-90% (interleaved with conversion)
Combining results         : Progress 90-100%
```

## Error Handling

- **Graceful Page Failures**: If one page fails to process, the loop continues with the next page
- **Environment Check**: Validates CLOUDFLARE_WORKER_URL and AUTH_TOKEN before processing
- **Worker Errors**: Returns detailed error messages from Worker (status code + response text)
- **Canvas Context Errors**: Properly checks for canvas context availability

## Status Messages

| Status | Meaning |
|--------|---------|
| `idle` | Not processing |
| `sending` | Downloading PDF from Storage |
| `processing` | Converting pages to PNG and sending to Worker |
| `completed` | All pages processed, results combined |
| `error` | An error occurred during processing |

## Result Format

```
--- HALAMAN 1 ---
[Extracted text from page 1]

--- HALAMAN 2 ---
[Extracted text from page 2]

--- HALAMAN N ---
[Extracted text from page N]
```

## Performance Notes

1. **Canvas Rendering Scale**: Set to 2x for better OCR quality
   - Larger = better quality but slower processing
   - Can be adjusted in `convertPdfPageToPng()` if needed

2. **Sequential Processing**: Pages are processed one at a time
   - Ensures stable memory usage
   - Prevents overwhelming the Worker with simultaneous requests

3. **Network Requests**: One request per page
   - 10-page PDF = 10 API calls to Worker
   - Each call is independent

## Testing Checklist

- [ ] PDF with single page processes correctly
- [ ] PDF with multiple pages processes all pages
- [ ] Results show page headers (--- HALAMAN 1 --- etc)
- [ ] Progress bar shows incremental updates
- [ ] Error handling works (Worker error, network error, invalid file)
- [ ] Results are saved to database
- [ ] Status is updated in real-time

## Future Optimizations

1. **Parallel Processing**: Process multiple pages simultaneously
   ```typescript
   await Promise.all(pagePromises) // Instead of for loop
   ```

2. **Batch Requests**: Group small pages into single requests
   - Combine multiple PNG images into one Worker request

3. **Compression**: Compress PNG files before sending
   - Reduce payload size by ~30-40%

4. **Caching**: Cache rendered pages temporarily
   - Avoid re-rendering if user retries

5. **Quality Adjustment**: Allow user to choose OCR quality level
   - Draft: scale 1.5x, Fast processing
   - Standard: scale 2.0x, Good quality
   - Premium: scale 3.0x, Highest quality

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Request is too large" | Already fixed - now uses per-page approach |
| "DOMMatrix not defined" | pdf.js uses dynamic import & CDN worker |
| Pages not processing | Check Worker URL and auth token in .env.local |
| Partial results | Check individual page failures in console |
| Slow processing | May be normal for large PDFs, check Worker rate limits |

## Files Modified

1. `src/hooks/usePdfOcr.ts` - Complete rewrite for per-page processing
2. `src/app/dashboard/arsip/ocr-actions.ts` - New `sendImageToCloudflareWorker()` function
3. `.env.local` - Added NEXT_PUBLIC_CLOUDFLARE_WORKER_AUTH_TOKEN

## Files NOT Changed

- `src/components/admin/OcrModal.tsx` - Works as-is with updated hook
- `src/components/admin/ArsipClient.tsx` - Works as-is with updated modal
- Database schema - No changes needed
