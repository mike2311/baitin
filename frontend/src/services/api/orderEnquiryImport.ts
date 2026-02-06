import apiClient from './client';

/**
 * Order Enquiry Import API Service
 *
 * Handles Excel/CSV file import for Order Enquiry.
 *
 * Reference: Task 06 - Main Import Page
 */

export enum OrderEnquiryImportFormat {
  STANDARD = 'STANDARD',
  WALMART = 'WALMART',
  CSV_2013 = 'CSV_2013',
  XLS_2013 = 'XLS_2013',
  MULTI_ITEM_BLOCK = 'MULTI_ITEM_BLOCK',
  NEW_FORMAT = 'NEW_FORMAT',
}

export interface ImportOrderEnquiryDto {
  companyCode: string;
  format?: OrderEnquiryImportFormat;
}

export interface ImportResponse {
  format: string;
  companyCode: string;
  importedOes: number;
  created: Array<{ oeNo: string; lines: number }>;
}

/**
 * Import Order Enquiry from Excel/CSV file
 *
 * @param file - The Excel or CSV file to import
 * @param dto - Import parameters (companyCode, optional format)
 * @returns Import response with results
 */
export async function importOrderEnquiry(
  file: File,
  dto: ImportOrderEnquiryDto,
): Promise<ImportResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('companyCode', dto.companyCode);
  if (dto.format) {
    formData.append('format', dto.format);
  }

  const response = await apiClient.post<ImportResponse>(
    '/order-enquiry/import',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
}
