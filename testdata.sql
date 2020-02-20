CREATE SCHEMA `pad_oba_1_dev` ;

CREATE TABLE `pad_oba_1_dev`.`user` (
                                        `id` INT NOT NULL AUTO_INCREMENT,
                                        `username` VARCHAR(45) NULL,
                                        `password` VARCHAR(100) NULL,
                                        PRIMARY KEY (`id`),
                                        UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE);

INSERT INTO pad_oba_1_dev.user(username, password) VALUES('test', 'test');

CREATE TABLE `pad_oba_1_dev`.`room_example` (
                                                `id` INT NOT NULL,
                                                `surface` INT NULL,
                                                PRIMARY KEY (`id`));

INSERT INTO pad_oba_1_dev.room_example VALUES(1256, 200);