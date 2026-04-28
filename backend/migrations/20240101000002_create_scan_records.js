// FILE: backend/migrations/20240101000002_create_scan_records.js

export function up(knex) {
    return knex.schema.createTable('scan_records', (table) => {
        table.string('id', 36).primary();
        table.integer('user_id').unsigned().notNullable();
        table.string('image_path', 500).nullable();
        table.integer('kalori').defaultTo(0);
        table.integer('gula').defaultTo(0);
        table.integer('garam').defaultTo(0);
        table.integer('lemak').defaultTo(0);
        table.integer('karbo').defaultTo(0);
        table.integer('protein').defaultTo(0);
        table.integer('serat').defaultTo(0);
        table.integer('serving').defaultTo(1);
        table.integer('takaran_satuan').defaultTo(0);
        table.string('nutri_score', 1).notNullable();
        table.json('raw_ocr_data').nullable();
        table.timestamp('scanned_at').defaultTo(knex.fn.now());

        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.index('user_id', 'idx_user_id');
        table.index('nutri_score', 'idx_nutri_score');
        table.index('scanned_at', 'idx_scanned_at');
    });
}

export function down(knex) {
    return knex.schema.dropTableIfExists('scan_records');
}
