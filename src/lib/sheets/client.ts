export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  size?: string;
}

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
 * Extracts a Google Spreadsheet / File ID from various URL formats or raw ID string.
 * Supports:
 * - https://docs.google.com/spreadsheets/d/<ID>/...
 * - https://drive.google.com/file/d/<ID>/...
 * - ?id=<ID>
 * - Raw ID string
 */
export function extractGoogleFileId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();

  const pathMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (pathMatch) return pathMatch[1];

  const queryMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (queryMatch) return queryMatch[1];

  return trimmed;
}

/**
 * Builds a direct web URL to view the Google Spreadsheet.
 */
export function buildGoogleSpreadsheetUrl(spreadsheetId: string): string {
  const cleanId = extractGoogleFileId(spreadsheetId);
  return `https://docs.google.com/spreadsheets/d/${cleanId}`;
}

export const DEFAULT_SPREADSHEET_ID =
  process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID ||
  process.env.GOOGLE_SHEETS_ID ||
  '1vWFuIU_LxCqyQ7Bn5N2K4gBDcIcnmogYA_ALiucWxbo';

export const DEFAULT_SPREADSHEET_URL =
  process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL ||
  process.env.GOOGLE_SHEETS_URL ||
  `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}`;

export function getActiveSpreadsheetUrl(explicitUrl?: string, explicitId?: string): string {
  if (explicitUrl) return explicitUrl;
  if (explicitId) return buildGoogleSpreadsheetUrl(explicitId);
  return DEFAULT_SPREADSHEET_URL;
}

export function getActiveSpreadsheetId(explicitId?: string): string {
  if (explicitId) return extractGoogleFileId(explicitId);
  return DEFAULT_SPREADSHEET_ID;
}

/**
 * Lists Google Sheets and Excel files available in the authenticated user's Google Drive.
 */
export async function listDriveSpreadsheets(accessToken: string): Promise<GoogleDriveFile[]> {
  const query = encodeURIComponent(
    "(mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' or name contains '.xlsx') and trashed = false"
  );
  const fields = encodeURIComponent('files(id,name,mimeType,modifiedTime,webViewLink,iconLink,size)');
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=modifiedTime%20desc&pageSize=25`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn('Google Drive files list warning:', res.status, errText);
      return [];
    }

    const data = (await res.json()) as { files?: GoogleDriveFile[] };
    return data.files || [];
  } catch (err) {
    console.error('Failed to list Google Drive spreadsheets:', err);
    return [];
  }
}

/**
 * Fetches Google Spreadsheet metadata (spreadsheet title, list of sheets, dimensions)
 */
export async function fetchGoogleSheetMetadata(
  spreadsheetId: string,
  accessToken: string
): Promise<GoogleSheetsMetadata> {
  const cleanId = extractGoogleFileId(spreadsheetId);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    cleanId
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
    spreadsheetId: cleanId,
    title: docTitle,
    sheets,
  };
}

/**
 * Downloads a spreadsheet or Excel file from Google (Drive or Sheets) as a binary Buffer.
 * Supports:
 * - Native Google Sheets (exported to .xlsx)
 * - Binary Excel (.xlsx) files stored on Google Drive (downloaded via alt=media)
 */
export async function downloadSpreadsheetBufferFromGoogle(
  fileOrSpreadsheetId: string,
  accessToken: string
): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
  const fileId = extractGoogleFileId(fileOrSpreadsheetId);

  // 1. Inspect Drive metadata to check file type
  let driveMeta: { name?: string; mimeType?: string } | null = null;
  try {
    const metaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      }
    );
    if (metaRes.ok) {
      driveMeta = await metaRes.json();
    }
  } catch {
    // Ignore Drive metadata lookup failure and attempt direct export
  }

  const fileName = driveMeta?.name || 'Google_Spreadsheet.xlsx';
  const mimeType = driveMeta?.mimeType || 'application/vnd.google-apps.spreadsheet';

  // 2. If it's a binary Excel file (.xlsx) stored in Google Drive, download directly
  if (mimeType.includes('openxmlformats') || fileName.toLowerCase().endsWith('.xlsx')) {
    const dlUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`;
    const dlRes = await fetch(dlUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (dlRes.ok) {
      const arr = await dlRes.arrayBuffer();
      return { buffer: Buffer.from(arr), fileName, mimeType };
    }
  }

  // 3. For Google Sheets: export via Google Docs export endpoint
  const exportUrl = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(fileId)}/export?format=xlsx`;
  const res = await fetch(exportUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (res.ok) {
    const arrayBuffer = await res.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), fileName, mimeType };
  }

  // 4. Drive API v3 export fallback
  const driveExportUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
    fileId
  )}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;
  const driveExpRes = await fetch(driveExportUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (driveExpRes.ok) {
    const arr = await driveExpRes.arrayBuffer();
    return { buffer: Buffer.from(arr), fileName, mimeType };
  }

  const errText = await res.text().catch(() => '');
  throw new Error(`Failed to export Google Sheet as Excel (${res.status}): ${errText.slice(0, 200)}`);
}

/**
 * Backward-compatible helper to download Google Spreadsheet as an Excel (.xlsx) Buffer.
 */
export async function fetchGoogleSpreadsheetBuffer(
  spreadsheetId: string,
  accessToken: string
): Promise<Buffer> {
  const result = await downloadSpreadsheetBufferFromGoogle(spreadsheetId, accessToken);
  return result.buffer;
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
