import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({ example: 'Profile', description: 'Nama menu' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    description: 'ID Parent (UUID) atau null jika root',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string | null;
}
