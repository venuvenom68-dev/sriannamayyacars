// Photo OCR ("scan car details from a photo to auto-fill the form") is disabled
// in production: it relied on tesseract.js, which is too heavy for small shared
// hosting (512 MB). The admin can still type the details in manually.
//
// This keeps the /api/cars/scan route working without crashing — it simply
// reports that nothing was auto-detected. If we later move to a bigger server,
// the OCR version can be restored.
export async function scanImage(_buffer) {
  return { fields: {}, textFound: false, matched: 0 };
}
