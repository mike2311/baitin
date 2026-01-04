import { ArrayMinSize, IsArray, IsString, MaxLength } from 'class-validator';

export class PostOeToOcDto {
  @IsString()
  @MaxLength(10)
  companyCode: string; // HT, BAT, INSP, HFW

  @IsArray()
  @ArrayMinSize(1)
  oeNos: string[];
}
