import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1790198215298 implements MigrationInterface {
  name = 'InitialSchema1790198215298';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(254) NOT NULL, \`username\` varchar(30) NOT NULL, \`passwordHash\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`post_votes\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(36) NOT NULL, \`postId\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_74c47fd124434b6ae3684a074f\` (\`postId\`), UNIQUE INDEX \`uq_post_votes_user_post\` (\`userId\`, \`postId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`posts\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(300) NOT NULL, \`url\` varchar(2048) NULL, \`body\` text NULL, \`userId\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_ae05faaa55c866130abef6e1fe\` (\`userId\`), INDEX \`IDX_46bc204f43827b6f25e0133dbf\` (\`createdAt\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`comment_votes\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(36) NOT NULL, \`commentId\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_db0f40562fcbaec17222882574\` (\`commentId\`), UNIQUE INDEX \`uq_comment_votes_user_comment\` (\`userId\`, \`commentId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`comments\` (\`id\` varchar(36) NOT NULL, \`body\` text NOT NULL, \`postId\` varchar(36) NOT NULL, \`parentId\` varchar(36) NULL, \`deletedAt\` datetime(6) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NOT NULL, INDEX \`IDX_e44ddaaa6d058cb4092f83ad61\` (\`postId\`), INDEX \`IDX_8770bd9030a3d13c5f79a7d2e8\` (\`parentId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`post_votes\` ADD CONSTRAINT \`FK_d6e4623a4f86aaaa06605a003cd\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`post_votes\` ADD CONSTRAINT \`FK_74c47fd124434b6ae3684a074f2\` FOREIGN KEY (\`postId\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_ae05faaa55c866130abef6e1fee\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comment_votes\` ADD CONSTRAINT \`FK_c70cad98b28ff8502621ad0e6f3\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comment_votes\` ADD CONSTRAINT \`FK_db0f40562fcbaec17222882574b\` FOREIGN KEY (\`commentId\`) REFERENCES \`comments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_e44ddaaa6d058cb4092f83ad61f\` FOREIGN KEY (\`postId\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_7e8d7c49f218ebb14314fdb3749\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_8770bd9030a3d13c5f79a7d2e81\` FOREIGN KEY (\`parentId\`) REFERENCES \`comments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_8770bd9030a3d13c5f79a7d2e81\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_7e8d7c49f218ebb14314fdb3749\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_e44ddaaa6d058cb4092f83ad61f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`comment_votes\` DROP FOREIGN KEY \`FK_db0f40562fcbaec17222882574b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`comment_votes\` DROP FOREIGN KEY \`FK_c70cad98b28ff8502621ad0e6f3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_ae05faaa55c866130abef6e1fee\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`post_votes\` DROP FOREIGN KEY \`FK_74c47fd124434b6ae3684a074f2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`post_votes\` DROP FOREIGN KEY \`FK_d6e4623a4f86aaaa06605a003cd\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_8770bd9030a3d13c5f79a7d2e8\` ON \`comments\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_e44ddaaa6d058cb4092f83ad61\` ON \`comments\``,
    );
    await queryRunner.query(`DROP TABLE \`comments\``);
    await queryRunner.query(
      `DROP INDEX \`uq_comment_votes_user_comment\` ON \`comment_votes\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_db0f40562fcbaec17222882574\` ON \`comment_votes\``,
    );
    await queryRunner.query(`DROP TABLE \`comment_votes\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_46bc204f43827b6f25e0133dbf\` ON \`posts\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_ae05faaa55c866130abef6e1fe\` ON \`posts\``,
    );
    await queryRunner.query(`DROP TABLE \`posts\``);
    await queryRunner.query(
      `DROP INDEX \`uq_post_votes_user_post\` ON \`post_votes\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_74c47fd124434b6ae3684a074f\` ON \`post_votes\``,
    );
    await queryRunner.query(`DROP TABLE \`post_votes\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\` ON \`users\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
