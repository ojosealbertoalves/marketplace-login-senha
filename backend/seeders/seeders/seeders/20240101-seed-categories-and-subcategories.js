// seeders/20240101-seed-categories-and-subcategories.js
'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Ler o arquivo JSON
      const jsonPath = path.join(__dirname, '../src/data/categories.json');
      const jsonData = fs.readFileSync(jsonPath, 'utf-8');
      const data = JSON.parse(jsonData);

      // Preparar arrays para inserção
      const categoriesToInsert = [];
      const subcategoriesToInsert = [];

      // Processar os dados do JSON
      data.categories.forEach(category => {
        // Adicionar categoria
        categoriesToInsert.push({
          id: category.id,
          name: category.name,
          slug: category.slug,
          icon: category.icon,
          created_at: new Date(),
          updated_at: new Date()
        });

        // Adicionar subcategorias
        if (category.subcategories && category.subcategories.length > 0) {
          category.subcategories.forEach(subcategory => {
            subcategoriesToInsert.push({
              id: subcategory.id,
              name: subcategory.name,
              slug: subcategory.slug,
              category_id: category.id,
              created_at: new Date(),
              updated_at: new Date()
            });
          });
        }
      });

      // Inserir categorias
      console.log(`\n📝 Inserindo ${categoriesToInsert.length} categorias...`);
      await queryInterface.bulkInsert('categories', categoriesToInsert, { transaction });
      console.log('✅ Categorias inseridas com sucesso!');

      // Inserir subcategorias
      console.log(`\n📝 Inserindo ${subcategoriesToInsert.length} subcategorias...`);
      await queryInterface.bulkInsert('subcategories', subcategoriesToInsert, { transaction });
      console.log('✅ Subcategorias inseridas com sucesso!');

      // Confirmar transação
      await transaction.commit();
      
      console.log('\n🎉 Seed executado com sucesso!');
      console.log(`   Total de categorias: ${categoriesToInsert.length}`);
      console.log(`   Total de subcategorias: ${subcategoriesToInsert.length}`);
      
      return true;
      
    } catch (error) {
      // Reverter em caso de erro
      await transaction.rollback();
      console.error('❌ Erro ao executar seed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Deletar subcategorias primeiro (por causa da foreign key)
      await queryInterface.bulkDelete('subcategories', null, { transaction });
      console.log('✅ Subcategorias removidas');
      
      // Depois deletar categorias
      await queryInterface.bulkDelete('categories', null, { transaction });
      console.log('✅ Categorias removidas');
      
      await transaction.commit();
      return true;
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro ao reverter seed:', error);
      throw error;
    }
  }
};