DROP SCHEMA IF EXISTS `pad_oba_1_dev`;
​
CREATE SCHEMA IF NOT EXISTS `pad_oba_1_dev` ;
​
DROP TABLE IF EXISTS `pad_oba_1_dev`.`user`;
​
CREATE TABLE IF NOT EXISTS `pad_oba_1_dev`.`user` (
                                                      `id` INT NOT NULL AUTO_INCREMENT,
                                                      `username` VARCHAR(45) NULL,
                                                      `password` VARCHAR(100) NULL,
                                                      PRIMARY KEY (`id`));
CREATE UNIQUE INDEX `username_UNIQUE` ON `pad_oba_1_dev`.`user`
    (`username` ASC);
​
DROP TABLE IF EXISTS `pad_oba_1_dev`.`room_example`;
​
CREATE TABLE IF NOT EXISTS `pad_oba_1_dev`.`room_example` (
                                                              `id` INT NOT NULL,
                                                              `surface` INT NULL,
                                                              PRIMARY KEY (`id`));
​
​
USE `pad_oba_1_dev` ;
​
INSERT INTO user(`username`, `password`) VALUES('test', 'test');
INSERT INTO room_example(`id`, `surface`) VALUES(1256, 200);