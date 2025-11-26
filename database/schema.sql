-- File: database/schema.sql

-- 1. Tabel Utama Menu
CREATE TABLE `menu` (
  `id` varchar(36) NOT NULL, 
  `name` varchar(255) NOT NULL, 
  `order` int NOT NULL DEFAULT '0', 
  `parentId` varchar(36) DEFAULT NULL, 
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Tabel Closure (Otomatis dibuat TypeORM untuk struktur Tree)
CREATE TABLE `menu_closure` (
  `id_ancestor` varchar(36) NOT NULL, 
  `id_descendant` varchar(36) NOT NULL, 
  PRIMARY KEY (`id_ancestor`, `id_descendant`),
  KEY `IDX_...` (`id_descendant`), 
  KEY `IDX_...` (`id_ancestor`),
  CONSTRAINT `FK_ancestor` FOREIGN KEY (`id_ancestor`) REFERENCES `menu` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_descendant` FOREIGN KEY (`id_descendant`) REFERENCES `menu` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Relasi Parent-Child
ALTER TABLE `menu` 
ADD CONSTRAINT `FK_menu_parent` 
FOREIGN KEY (`parentId`) REFERENCES `menu` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;