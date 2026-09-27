import { JSONFieldMap, KnowledgeRecord } from '@hola-ai/shared';

export interface ParsedIngestionResult {
  records: Omit<KnowledgeRecord, 'id' | 'orgId' | 'sourceId' | 'createdAt'>[];
  detectedFieldMap?: JSONFieldMap;
  recordCount: number;
  errorMessage?: string;
}

export class IngestionService {
  public static processJson(
    rawJson: string,
    fieldMap?: JSONFieldMap
  ): ParsedIngestionResult {
    try {
      let parsed = JSON.parse(rawJson);
      if (!Array.isArray(parsed)) {
        if (typeof parsed === 'object' && parsed !== null) {
          parsed = [parsed];
        } else {
          return { records: [], recordCount: 0, errorMessage: 'Invalid JSON: Expected an array or object of records.' };
        }
      }

      if (parsed.length === 0) {
        return { records: [], recordCount: 0, errorMessage: 'JSON array is empty.' };
      }

      const sample = parsed[0];
      const keys = Object.keys(sample);

      const detectedMap: JSONFieldMap = fieldMap || {
        titleField: keys.find(k => /name|title|product|label|subject/i.test(k)) || keys[0],
        contentFields: keys.filter(k => /desc|content|body|info|specs|details|text|price|stock/i.test(k)),
        categoryField: keys.find(k => /category|tag|type|group|topic/i.test(k)),
        priceField: keys.find(k => /price|cost|amount/i.test(k)),
      };

      if (detectedMap.contentFields.length === 0) {
        detectedMap.contentFields = keys;
      }

      const records = parsed.map((item: any, idx: number) => {
        const title = item[detectedMap.titleField || ''] || `Record #${idx + 1}`;
        const category = detectedMap.categoryField ? String(item[detectedMap.categoryField] || '') : undefined;

        const contentParts: string[] = [];
        for (const field of detectedMap.contentFields) {
          if (item[field] !== undefined && item[field] !== null) {
            contentParts.push(`${field.replace(/_/g, ' ')}: ${typeof item[field] === 'object' ? JSON.stringify(item[field]) : item[field]}`);
          }
        }

        return {
          title: String(title),
          content: contentParts.join('. ') || JSON.stringify(item),
          category,
          metadata: item,
        };
      });

      return {
        records,
        detectedFieldMap: detectedMap,
        recordCount: records.length,
      };
    } catch (err: any) {
      return { records: [], recordCount: 0, errorMessage: `JSON Parsing Error: ${err.message}` };
    }
  }

  public static processCsv(rawCsv: string): ParsedIngestionResult {
    const lines = rawCsv.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      return { records: [], recordCount: 0, errorMessage: 'CSV requires a header row and at least one data row.' };
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const titleIdx = headers.findIndex(h => /name|title|subject|header/i.test(h));
    const titleHeader = titleIdx >= 0 ? headers[titleIdx] : headers[0];

    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const rowVals = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h] = rowVals[idx] || '';
      });

      const title = obj[titleHeader] || `Row #${i}`;
      const content = Object.entries(obj)
        .map(([k, v]) => `${k}: ${v}`)
        .join('. ');

      records.push({
        title,
        content,
        category: 'CSV Document',
        metadata: obj,
      });
    }

    return { records, recordCount: records.length };
  }

  public static processText(rawText: string, docName: string): ParsedIngestionResult {
    const paragraphs = rawText.split(/\n\n+/).filter(p => p.trim().length > 20);
    if (paragraphs.length === 0) {
      return {
        records: [{ title: docName, content: rawText, category: 'Document', metadata: {} }],
        recordCount: 1,
      };
    }

    const records = paragraphs.map((para, idx) => ({
      title: `${docName} (Section ${idx + 1})`,
      content: para.trim(),
      category: 'Document Section',
      metadata: { sectionIndex: idx + 1 },
    }));

    return { records, recordCount: records.length };
  }
}
