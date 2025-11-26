import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateMenuDto } from './create-menu.dto';
import { IsOptional, IsUUID, ValidateIf } from 'class-validator';

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @ValidateIf((object, value) => value !== null)
  @IsUUID()
  parentId?: string | null;
}
