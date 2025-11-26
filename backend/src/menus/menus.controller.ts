import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put, // 1. Kita Import PUT
  Param,
  Delete,
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  // 1. GET ALL (Sesuai)
  @Get()
  findAll() {
    return this.menusService.findAll();
  }

  // 2. GET ONE (Sesuai)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menusService.findOne(id);
  }

  // 3. CREATE (Sesuai)
  @Post()
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(createMenuDto);
  }

  // 4. UPDATE -> DIBUAT JADI PUT (Agar Sesuai Syarat: PUT /api/menus/:id)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menusService.update(id, updateMenuDto);
  }

  // 5. DELETE (Sesuai)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menusService.remove(id);
  }

  // 6. MOVE (Sesuai Syarat: PATCH /api/menus/:id/move)
  @Patch(':id/move')
  moveMenu(@Param('id') id: string, @Body('parentId') parentId: string) {
    return this.menusService.update(id, { parentId: parentId });
  }

  // 7. REORDER (Sesuai Syarat: PATCH /api/menus/:id/reorder)
  // BONUS: Pastikan Anda sudah update Service & Entity untuk fitur ini
  @Patch(':id/reorder')
  reorderMenu(@Param('id') id: string, @Body('order') order: number) {
    // Pastikan fungsi reorder sudah ada di service Anda
    // Jika belum ada, hapus bagian ini atau update service.ts dulu
    if (this.menusService.reorder) {
      return this.menusService.reorder(id, order);
    } else {
      return { message: 'Fitur reorder belum diaktifkan di Service' };
    }
  }
}
