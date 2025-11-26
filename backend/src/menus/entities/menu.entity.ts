import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';

@Entity()
@Tree('closure-table')
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // --- TAMBAHAN BARU: KOLOM URUTAN ---
  @Column({ default: 0 })
  order: number;
  // ------------------------------------

  @TreeChildren()
  children: Menu[];

  @TreeParent()
  parent: Menu;
}
