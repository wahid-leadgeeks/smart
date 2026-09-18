export interface GoogleSheetsMetadata {
  spreadsheetId: string;
  title: string;
  sheets: Array<{
    sheetId: number;
    title: string;
    rowCount?: number;
    columnCount?: number;
  }>;
}

export interface UpdateCellResult {
  updatedRange: string;
  updatedRows: number;
  updatedColumns: number;
  updatedCells: number;
}

/**
 * Fetches Google Spreadsheet metadata (spreadsheet title, list of sheets, dimensions)
 */
export async function fetchGoogleSheetMetadata(
  spreadsheetId: string,
  accessToken: string
): Promise<GoogleSheetsMetadata> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId
  )}?fields=properties.title,sheets.properties`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    let detail = errText;
    try {
      const parsed = JSON.parse(errText);
      if (parsed?.error?.message) detail = parsed.error.message;
    } catch {
      // Use raw text
    }
    throw new Error(`Google Sheets API metadata request failed (${res.status}): ${detail}`);
  }

  interface GoogleMetaResponse {
    properties?: { title?: string };
    sheets?: Array<{
      properties?: {
        sheetId?: number;
        title?: string;
        gridProperties?: { rowCount?: number; columnCount?: number };
      };
    }>;
  }

  const data = (await res.json()) as GoogleMetaResponse;
  const docTitle = data.properties?.title || 'Google Spreadsheet';
  const sheets = (data.sheets || []).map((s) => ({
    sheetId: s.properties?.sheetId || 0,
    title: s.properties?.title || '',
    rowCount: s.properties?.gridProperties?.rowCount,
    columnCount: s.properties?.gridProperties?.columnCount,
  }));

  return {
    spreadsheetId,
    title: docTitle,
    sheets,
  };
}

/**
 * Downloads the entire Google Spreadsheet as an Excel (.xlsx) file buffer using Google Drive/Docs export
 */
export async function fetchGoogleSpreadsheetBuffer(
  spreadsheetId: string,
  accessToken: string
): Promise<Buffer> {
  const exportUrl = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
    spreadsheetId
  )}/export?format=xlsx`;

  const res = await fetch(exportUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(
      `Failed to export Google Sheet as Excel (${res.status}): ${errText.slice(0, 200)}`
    );
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Reads cell values from a specific range using Google Sheets API v4
 */
export async function getGoogleSheetRange(
  spreadsheetId: string,
  range: string,
  accessToken: string
): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId
  )}/values/${encodeURIComponent(range)}?valueRenderOption=FORMATTED_VALUE`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Failed to read range ${range} (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as { values?: string[][] };
  return data.values || [];
}

/**
 * Updates a range of cells in a Google Spreadsheet via Google Sheets API v4
 */
export async function updateGoogleSheetRange(
  spreadsheetId: string,
  range: string,
  values: string[][],
  accessToken: string
): Promise<UpdateCellResult> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId
  )}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    let detail = errText;
    try {
      const parsed = JSON.parse(errText);
      if (parsed?.error?.message) detail = parsed.error.message;
    } catch {
      // raw
    }
    throw new Error(`Google Sheets API update failed (${res.status}): ${detail}`);
  }

  const data = (await res.json()) as {
    updatedRange?: string;
    updatedRows?: number;
    updatedColumns?: number;
    updatedCells?: number;
  };

  return {
    updatedRange: data.updatedRange || range,
    updatedRows: data.updatedRows || values.length,
    updatedColumns: data.updatedColumns || (values[0]?.length ?? 1),
    updatedCells: data.updatedCells || values.reduce((acc, row) => acc + row.length, 0),
  };
}
