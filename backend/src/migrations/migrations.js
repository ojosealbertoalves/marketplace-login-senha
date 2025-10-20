// backend/src/migrations/YYYYMMDDHHMMSS-add-client-user-type.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar 'client' ao enum user_type
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_users_user_type" ADD VALUE IF NOT EXISTS 'client';
    `);

    console.log('✅ Tipo "client" adicionado ao enum user_type');
  },

  async down(queryInterface, Sequelize) {
    // Nota: Remover valores de ENUM no PostgreSQL é complexo
    // Requer recriar o enum completamente
    console.log('⚠️  Rollback não suportado para ENUMs no PostgreSQL');
    console.log('Para reverter, você precisaria:');
    console.log('1. Remover todos os usuários com user_type = "client"');
    console.log('2. Recriar o ENUM sem o valor "client"');
  }
};