import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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

    // Fungsi helper untuk sort recursive berdasarkan 'order'
    const sortRecursive = (nodes: Menu[]) => {
      nodes.sort((a, b) => a.order - b.order);
      nodes.forEach((node) => {
        if (node.children) sortRecursive(node.children);
      });
    };

    sortRecursive(trees);
    return trees;
  }

  // FIND by ID
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

    // Update Name
    if (updateMenuDto.name) {
      menu.name = updateMenuDto.name;
    }

    // Update Parent (Move Menu)
    if (updateMenuDto.parentId !== undefined) {
      // Jika parentId null, berarti jadikan root
      if (updateMenuDto.parentId === null) {
        menu.parent = null;
      } else {
        const parent = await this.menuRepository.findOne({
          where: { id: updateMenuDto.parentId },
        });

        if (!parent) throw new NotFoundException('Parent not found');

        // Validasi: Cegah menu menjadi parent dirinya sendiri
        if (parent.id === menu.id) {
          throw new BadRequestException('Cannot set menu as its own parent');
        }

        menu.parent = parent;
      }
    }

    return this.menuRepository.save(menu);
  }

  // 5. REMOVE
  async remove(id: string) {
    const menu = await this.findOne(id);
    return this.menuRepository.remove(menu);
  }

  // 6. REORDER (Bonus Feature)
  async reorder(id: string, newOrder: number) {
    const menu = await this.findOne(id);
    let siblings: Menu[] = [];

    // Ambil siblings (saudara satu level)
    if (menu.parent) {
      const parent = await this.menuRepository.findOne({
        where: { id: menu.parent.id },
        relations: ['children'],
      });
      siblings = parent?.children || [];
    } else {
      siblings = await this.menuRepository.findRoots();
    }

    // Sortir siblings berdasarkan order saat ini
    siblings.sort((a, b) => a.order - b.order);

    // Hapus item yang mau dipindahkan dari array sementara
    const filtered = siblings.filter((s) => s.id !== id);

    // Validasi range order
    if (newOrder < 0) newOrder = 0;
    if (newOrder > filtered.length) newOrder = filtered.length;

    // Masukkan item ke posisi baru
    filtered.splice(newOrder, 0, menu);

    // Simpan ulang semua siblings dengan order baru
    for (let i = 0; i < filtered.length; i++) {
      // Update hanya jika order berubah untuk efisiensi
      if (filtered[i].order !== i) {
        filtered[i].order = i;
        await this.menuRepository.save(filtered[i]);
      }
    }

    return { message: 'Reorder success', order: newOrder };
  }
}
