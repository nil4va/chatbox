USE `VUL JE SCHEMA HIER IN`;

CREATE TABLE IF NOT EXISTS `user`
(
    `id`       INT          NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(45)  NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE UNIQUE INDEX `username_UNIQUE` ON `user`
    (`username` ASC);

CREATE TABLE IF NOT EXISTS `room_example`
(
    `id`      INT NOT NULL,
    `surface` INT NULL,
    PRIMARY KEY (`id`)
);

INSERT INTO `user` (`username`, `password`) VALUES ('test', 'test');
INSERT INTO room_example(`id`, `surface`) VALUES (1256, 200);