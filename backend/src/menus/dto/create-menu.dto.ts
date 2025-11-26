import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateMenuDto {
  // Decorator ini WAJIB ada agar 'name' diakui sebagai properti valid
  @IsString()
  @IsNotEmpty()
  name: string;

  // Decorator ini juga WAJIB agar 'parentId' diakui
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
