export function getOptimizedImage(url) {
  if (!url || typeof url !== "string") {
    return url;
  }

  if (!url.includes("/media/") || url.includes("/media/resize/")) {
    return url;
  }

  return url.replace("/media/", "/media/resize/640/-/");
}
