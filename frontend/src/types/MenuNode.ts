// src/types/MenuNode.ts
export interface MenuNode {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
  children: MenuNode[];
}
