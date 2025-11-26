import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { TreeRepository } from 'typeorm';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: TreeRepository<Menu>,
  ) {}

  // CREATE
  async create(createMenuDto: CreateMenuDto) {
    const menu = new Menu();
    menu.name = createMenuDto.name;
    menu.order = 0;

    if (createMenuDto.parentId) {
      const parent = await this.menuRepository.findOneBy({
        id: createMenuDto.parentId,
      });
      if (!parent) throw new NotFoundException('Parent not found');
      menu.parent = parent;
    }

    return this.menuRepository.save(menu);
  }

  // FIND ALL
  async findAll() {
    const trees = await this.menuRepository.findTrees();

    // Sort manual recursive
    const sortRecursive = (nodes: Menu[]) => {
      nodes.sort((a, b) => a.order - b.order);
      nodes.forEach((node) => {
        if (node.children) sortRecursive(node.children);
      });
    };

    sortRecursive(trees);
    return trees;
  }

  // FIND ONE
  async findOne(id: string) {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!menu) throw new NotFoundException(`Menu #${id} not found`);
    return menu;
  }

  // UPDATE
  async update(id: string, updateMenuDto: UpdateMenuDto | any) {
    const menu = await this.findOne(id);

    if (updateMenuDto.name) menu.name = updateMenuDto.name;

    if (updateMenuDto.parentId) {
      const parent = await this.menuRepository.findOneBy({
        id: updateMenuDto.parentId,
      });
      if (parent) menu.parent = parent;
    }

    return this.menuRepository.save(menu);
  }

  // REMOVE
  async remove(id: string) {
    const menu = await this.findOne(id);
    return this.menuRepository.remove(menu);
  }

  // REORDER
  async reorder(id: string, newOrder: number) {
    const menu = await this.findOne(id);

    let siblings: Menu[] = [];

    if (menu.parent) {
      const parent = await this.menuRepository.findOne({
        where: { id: menu.parent.id },
        relations: ['children'],
      });

      siblings = parent?.children || [];
    } else {
      siblings = await this.menuRepository.findRoots();
    }

    // Sortir berdasarkan order lama
    siblings.sort((a, b) => a.order - b.order);

    const filtered = siblings.filter((s) => s.id !== id);
    if (newOrder < 0) newOrder = 0;
    if (newOrder > filtered.length) newOrder = filtered.length;

    filtered.splice(newOrder, 0, menu);

    // Simpan urutan baru
    for (let i = 0; i < filtered.length; i++) {
      filtered[i].order = i;
      await this.menuRepository.save(filtered[i]);
    }

    return { message: 'Reorder success' };
  }
}
