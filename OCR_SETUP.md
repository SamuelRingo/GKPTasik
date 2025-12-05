# Setup OCR dengan Cloudflare Workers AI

## 1. Environment Variables

Tambahkan variabel berikut ke file `.env.local`:

```env
CLOUDFLARE_ACCOUNT_ID=<your-cloudflare-account-id>
CLOUDFLARE_API_TOKEN=<your-cloudflare-api-token>
```

### Cara Mendapatkan Credentials:

1. **Cloudflare Account ID:**
   - Buka [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Pilih domain atau akun Anda
   - Klik "Overview" di sidebar kiri
   - Scroll ke bawah, cari "API" section
   - Copy "Account ID"

2. **Cloudflare API Token:**
   - Buka [API Tokens Page](https://dash.cloudflare.com/profile/api-tokens)
   - Klik "Create Token"
   - Gunakan template "Edit Cloudflare Workers" atau "Create Custom Token"
   - Pastikan permissions mencakup:
     - `account:read`
     - `workers:write` (atau lebih tinggi)
   - Copy token yang dihasilkan

## 2. Fitur OCR

### Komponen Utama:

1. **`usePdfOcr` Hook** (`src/hooks/usePdfOcr.ts`)
   - Mengkonversi PDF ke gambar PNG per halaman (client-side)
   - Mengirim setiap gambar ke Cloudflare Workers AI secara streaming
   - Mengumpulkan hasil OCR dan merge menjadi satu text

2. **`OcrModal` Component** (`src/components/admin/OcrModal.tsx`)
   - Modal UI untuk upload PDF dan menampilkan progress
   - Menampilkan hasil OCR setelah selesai

3. **`ocr-actions` Server Actions** (`src/app/dashboard/arsip/ocr-actions.ts`)
   - `updateArsipWithOcr()` - Menyimpan hasil OCR ke database
   - `setOcrProcessing()` - Set status OCR menjadi "processing"
   - `sendImageToCloudflareAI()` - Send image ke Cloudflare AI

4. **API Route** (`src/app/api/ocr/route.ts`)
   - Forward request ke Cloudflare Workers AI API
   - Handle error handling dan response formatting

### Integrasi dengan Arsip Feature:

- Button OCR hanya muncul untuk dokumen dengan kategori "Warta"
- Hasil OCR disimpan di kolom `hasil_ocr` tabel `arsip`
- Status OCR tracked di kolom `status_ocr` (values: 'pending', 'processing', 'completed', 'error')

## 3. Flow Diagram

```
User Upload PDF
  ↓
[AddArsipButton] → Save file to Supabase Storage
  ↓
[ArsipActions] → Click OCR button
  ↓
[OcrModal] → Upload PDF file
  ↓
[usePdfOcr] → Convert PDF to PNG per page
  ↓
[usePdfOcr] → Send each PNG to API route (streaming)
  ↓
[/api/ocr] → Forward to Cloudflare Workers AI
  ↓
[Cloudflare AI] → Extract text from image
  ↓
[usePdfOcr] → Merge all page results
  ↓
[ocr-actions] → Save hasil_ocr to database
  ↓
[OcrModal] → Display results to user
```

## 4. Penggunaan

### Upload Dokumen dengan OCR (Optional):

1. Klik tombol "Upload Dokumen"
2. Isi nama dan kategori
3. Upload file PDF
4. Di halaman arsip, click tombol OCR (icon dokumen) pada dokumen yang ingin di-OCR
5. Upload PDF lagi di modal OCR
6. Tunggu proses selesai (convert → AI processing)
7. Hasil akan ditampilkan dan otomatis tersimpan di database

## 5. Database Schema

Tabel `arsip` memiliki kolom tambahan:

```sql
-- Kolom yang sudah ada:
- id (uuid, pk)
- nama_dokumen (text)
- kategori (text)
- url_file (text)
- created_at (timestamp)

-- Kolom baru untuk OCR:
- hasil_ocr (text) -- Menyimpan hasil ekstraksi teks
- status_ocr (enum: 'pending', 'processing', 'completed', 'error') -- Status OCR
```

## 6. Performance Notes

- **PDF Conversion:** Dilakukan client-side menggunakan `pdf.js`
- **Streaming:** Setiap halaman dikirim terpisah ke Cloudflare AI (bukan batch) untuk efficiency memory
- **File Size Limit:** Tergantung `next.config.ts` (default 10MB)
- **Rate Limiting:** Ada delay 500ms antar halaman untuk avoid API rate limit

## 7. Error Handling

- Jika satu halaman gagal, system akan skip halaman tersebut dan lanjut ke halaman berikutnya
- Error message ditampilkan di modal
- Status OCR di database set ke "error" jika terjadi kesalahan
- User bisa retry dengan klik button OCR lagi

## 8. Troubleshooting

### Error: "Cloudflare credentials not configured"
- Pastikan `CLOUDFLARE_ACCOUNT_ID` dan `CLOUDFLARE_API_TOKEN` ada di `.env.local`
- Restart dev server (`npm run dev`)

### Error: "Failed to extract text from page X"
- Cloudflare AI mungkin rate limit, coba lagi dalam beberapa menit
- Image quality mungkin terlalu rendah, coba PDF dengan resolusi lebih tinggi

### OCR Result Tidak Tersimpan
- Pastikan user sudah login (session valid)
- Check database kolom `hasil_ocr` sudah ada

## 9. Dependencies

```json
{
  "pdfjs-dist": "^4.x.x" - PDF parsing & rendering
}
```

Semua dependencies lainnya sudah ada di project.
