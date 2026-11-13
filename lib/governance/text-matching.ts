export function findWholeWordMatches(
  content: string,
  phrase: string,
): Array<{ startOffset: number; endOffset: number }> {
  const normalizedPhrase = phrase.trim();
  if (!normalizedPhrase) {
    return [];
  }

  const escaped = normalizedPhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const expression = new RegExp(
    `(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`,
    "giu",
  );
  const matches: Array<{ startOffset: number; endOffset: number }> = [];
  for (const match of content.matchAll(expression)) {
    if (match.index !== undefined) {
      matches.push({
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      });
    }
  }
  return matches;
}

export function normalizeForExactComparison(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function extractStructuredValue(value: string): string | undefined {
  const withoutSource = value.split(/\s+\[Source:/i, 1)[0]?.trim();
  if (!withoutSource) {
    return undefined;
  }

  const separator = withoutSource.indexOf(":");
  if (separator < 0) {
    return undefined;
  }
  const structuredValue = withoutSource.slice(separator + 1).trim();
  return structuredValue || undefined;
}

export function extractSourceReference(
  value: string,
  fallbackSourceId: string | undefined,
  fallbackVersionId: string | undefined,
) {
  const source = value.match(
    /\[Source:\s*(.+?)\s+\(([^;()[\]]+);\s*([^;()[\]]+)(?:;\s*(?:page\s+\d+|section\s+.+?))?\)\]/i,
  );
  if (!source && (!fallbackSourceId || !fallbackVersionId)) {
    return undefined;
  }

  return {
    sourceId: source?.[2]?.trim() ?? fallbackSourceId!,
    sourceType: "approved_brand_knowledge",
    sourceTitle: source?.[1]?.trim() ?? "Approved brand knowledge",
    ...(source?.[3]?.trim() ?? fallbackVersionId
      ? { versionId: source?.[3]?.trim() ?? fallbackVersionId }
      : {}),
  };
}
