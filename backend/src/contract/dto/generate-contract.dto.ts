import { IsString, MaxLength } from 'class-validator';

export class GenerateContractFromOcDto {
  @IsString()
  @MaxLength(50)
  confNo: string;
}
