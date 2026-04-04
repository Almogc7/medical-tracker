export function resolvePdfHref(pdfPath: string) {
  if (/^https?:\/\//i.test(pdfPath)) {
    return pdfPath;
  }

  return `/${pdfPath.replace(/^\/+/, "")}`;
}
