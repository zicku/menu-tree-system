import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Perbaikan 1: Import TypeOrmModule
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';
import { Menu } from './entities/menu.entity'; // Perbaikan 2: Import Menu

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu]), // Perbaikan 3: Daftarkan Menu di sini
  ],
  controllers: [MenusController],
  providers: [MenusService],
})
export class MenusModule {}
