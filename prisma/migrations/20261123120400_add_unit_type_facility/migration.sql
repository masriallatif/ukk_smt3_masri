CREATE TABLE `tbl_type_unit` (
    `id_unit_type` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_type_unit` VARCHAR(191) NOT NULL,
    `branch_id` INTEGER NOT NULL,
    `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_unit_type`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `tbl_facility` (
    `kode_facility` VARCHAR(191) NOT NULL,
    `nama_facility` VARCHAR(191) NOT NULL,
    `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`kode_facility`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `tbl_type_unit_facility` (
    `id_unit_type` INTEGER NOT NULL,
    `kode_facility` VARCHAR(191) NOT NULL,

    INDEX `tbl_type_unit_facility_kode_facility_idx`(`kode_facility`),
    PRIMARY KEY (`id_unit_type`, `kode_facility`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `tbl_type_unit_facility`
    ADD CONSTRAINT `tbl_type_unit_facility_id_unit_type_fkey`
    FOREIGN KEY (`id_unit_type`) REFERENCES `tbl_type_unit`(`id_unit_type`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `tbl_type_unit_facility`
    ADD CONSTRAINT `tbl_type_unit_facility_kode_facility_fkey`
    FOREIGN KEY (`kode_facility`) REFERENCES `tbl_facility`(`kode_facility`)
    ON DELETE CASCADE ON UPDATE CASCADE;
