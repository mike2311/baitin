import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

/**
 * Generate SO Document DTO
 *
 * Original Logic Reference:
 * - Legacy Form: pso (Print Shipping Order)
 * - Documentation: docs/source/04-forms-and-screens/shipping-order-forms.md
 * - Business Rules:
 *   - Generate SO document from selected SO numbers
 *   - Apply customer-specific format (zsoformat)
 *   - Support single or multiple SO printing
 *
 * Reference: Phase 3 - SO Document Generation
 */
export class GenerateSoDocumentDto {
  @IsNotEmpty({ message: 'At least one SO number is required' })
  @IsArray()
  @IsString({ each: true })
  soNos: string[]; // SO numbers to include in document

  @IsOptional()
  @IsString()
  formatKey?: string; // Format key from zsoformat (defaults to customer format or standard)

  @IsOptional()
  @IsString()
  outputFormat?: 'pdf' | 'excel' | 'html'; // Output format

  @IsOptional()
  @IsString()
  fileName?: string; // Custom file name

  @IsOptional()
  @IsString()
  addressType?: 'shipping' | 'loading'; // Address type (saddr vs laddr from zpara)
}