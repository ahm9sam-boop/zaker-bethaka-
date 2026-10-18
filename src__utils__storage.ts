/**
 * Safe LocalStorage utility with QuotaExceededError protection and automatic payload sanitization.
 */

export function safeStorageGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[SafeStorage] Error reading key "${key}":`, err);
    return fallback;
  }
}

export function safeStorageSet<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (err: any) {
    console.warn(`[SafeStorage] Failed to write key "${key}" (possible quota exceeded):`, err);

    // If quota exceeded, attempt to prune old or bulky items
    if (
      err &&
      (err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err.code === 22 ||
        err.code === 1014)
    ) {
      try {
        if (Array.isArray(value)) {
          // Keep at most 10 recent items and truncate bulky text fields
          const trimmed = (value as any[]).slice(0, 10).map((item) => {
            if (item && typeof item === 'object') {
              const copy = { ...item };
              if (copy.content && typeof copy.content === 'object') {
                const contentCopy = { ...copy.content };
                // Truncate any long text properties
                for (const prop of Object.keys(contentCopy)) {
                  if (typeof contentCopy[prop] === 'string' && contentCopy[prop].length > 4000) {
                    contentCopy[prop] = contentCopy[prop].slice(0, 4000) + '... (تم اقتطاع النص لتوفير مساحة التخزين)';
                  }
                }
                copy.content = contentCopy;
              }
              return copy;
            }
            return item;
          });
          localStorage.setItem(key, JSON.stringify(trimmed));
          return true;
        }
      } catch (pruneErr) {
        console.error('[SafeStorage] Failed even after pruning:', pruneErr);
      }
    }
    return false;
  }
}

/**
 * Sanitizes a material before persisting to prevent blowing up the 5MB origin storage limit.
 */
export function sanitizeMaterialForStorage<T extends { content?: any }>(item: T): T {
  if (!item || !item.content) return item;

  const copy = { ...item };

  if (typeof copy.content === 'string') {
    if (copy.content.length > 8000) {
      copy.content = copy.content.slice(0, 8000) + '\n... (تم حفظ أول 8,000 حرف لتوفير مساحة التخزين المحلية)';
    }
  } else if (typeof copy.content === 'object' && copy.content !== null) {
    const sanitizedContent = { ...copy.content };
    if (typeof sanitizedContent.text === 'string' && sanitizedContent.text.length > 8000) {
      sanitizedContent.text = sanitizedContent.text.slice(0, 8000) + '\n... (تم حفظ ملخص للمحتوى)';
    }
    if (typeof sanitizedContent.transcription === 'string' && sanitizedContent.transcription.length > 8000) {
      sanitizedContent.transcription = sanitizedContent.transcription.slice(0, 8000) + '\n... (تم حفظ مقتطف من التفريغ)';
    }
    copy.content = sanitizedContent;
  }

  return copy;
}
