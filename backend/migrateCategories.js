// migrateAllData.js
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false, // Desabilitar logs para ficar mais limpo
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

// Função auxiliar para ler JSON
async function readJsonFile(filename) {
  const jsonPath = path.join(__dirname, 'src/data', filename);
  const jsonData = await fs.readFile(jsonPath, 'utf-8');
  return JSON.parse(jsonData);
}

// Migrar Categorias e Subcategorias
async function migrateCategories() {
  console.log('\n📂 Migrando Categorias e Subcategorias...');
  
  const data = await readJsonFile('categories.json');
  const categoriesToInsert = [];
  const subcategoriesToInsert = [];

  data.categories.forEach(category => {
    categoriesToInsert.push({
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      created_at: new Date(),
      updated_at: new Date()
    });

    if (category.subcategories) {
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
  for (const category of categoriesToInsert) {
    await sequelize.query(
      `INSERT INTO categories (id, name, slug, icon, created_at, updated_at) 
       VALUES (:id, :name, :slug, :icon, :created_at, :updated_at)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         slug = EXCLUDED.slug,
         icon = EXCLUDED.icon,
         updated_at = EXCLUDED.updated_at`,
      { replacements: category, type: Sequelize.QueryTypes.INSERT }
    );
  }
  console.log(`   ✅ ${categoriesToInsert.length} categorias inseridas`);

  // Inserir subcategorias
  for (const subcategory of subcategoriesToInsert) {
    await sequelize.query(
      `INSERT INTO subcategories (id, name, slug, category_id, created_at, updated_at) 
       VALUES (:id, :name, :slug, :category_id, :created_at, :updated_at)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         slug = EXCLUDED.slug,
         category_id = EXCLUDED.category_id,
         updated_at = EXCLUDED.updated_at`,
      { replacements: subcategory, type: Sequelize.QueryTypes.INSERT }
    );
  }
  console.log(`   ✅ ${subcategoriesToInsert.length} subcategorias inseridas`);
}

// Migrar Cidades
async function migrateCities() {
  console.log('\n🏙️ Migrando Cidades...');
  
  const data = await readJsonFile('cities.json');
  const citiesToInsert = data.cities.map(city => ({
    id: city.id,
    name: city.name,
    state: city.state,
    state_name: city.stateName,
    slug: city.slug,
    active: city.active,
    created_at: new Date(),
    updated_at: new Date()
  }));

  for (const city of citiesToInsert) {
    await sequelize.query(
      `INSERT INTO cities (id, name, state, state_name, slug, active, created_at, updated_at) 
       VALUES (:id, :name, :state, :state_name, :slug, :active, :created_at, :updated_at)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         state = EXCLUDED.state,
         state_name = EXCLUDED.state_name,
         slug = EXCLUDED.slug,
         active = EXCLUDED.active,
         updated_at = EXCLUDED.updated_at`,
      { replacements: city, type: Sequelize.QueryTypes.INSERT }
    );
  }
  console.log(`   ✅ ${citiesToInsert.length} cidades inseridas`);
}

// Migrar Profissionais
async function migrateProfessionals() {
  console.log('\n👷 Migrando Profissionais...');
  
  const data = await readJsonFile('professionals.json');
  
  // Primeiro inserir os profissionais básicos
  for (const prof of data.professionals) {
    // Preparar o objeto social_media como JSON
    const socialMedia = {
      instagram: prof.socialMedia?.instagram || null,
      linkedin: prof.socialMedia?.linkedin || null,
      youtube: prof.socialMedia?.youtube || null,
      website: prof.socialMedia?.website || null
    };

    // Preparar tags como array JSON
    const tags = prof.tags || [];

    const professional = {
      id: prof.id,
      name: prof.name,
      email: prof.email,
      profile_photo: prof.profilePhoto || null,
      category_id: prof.id_category,
      city_id: prof.city === 'Goiânia' ? 'city-goiania' : 
               prof.city === 'Aparecida de Goiânia' ? 'city-aparecida-goiania' : 
               'city-senador-canedo',
      city: prof.city,
      state: prof.state,
      education: prof.education || null,
      experience: prof.experience || null,
      tags: JSON.stringify(tags),
      social_media: JSON.stringify(socialMedia),
      whatsapp: prof.whatsapp || null,
      business_address: prof.businessAddress || null,
      google_maps_link: prof.googleMapsLink || null,
      is_active: prof.isActive !== undefined ? prof.isActive : true,
      created_at: prof.createdAt ? new Date(prof.createdAt) : new Date(),
      updated_at: new Date()
    };

    await sequelize.query(
      `INSERT INTO professionals (
        id, name, email, profile_photo, category_id, city_id, city, state,
        education, experience, tags, social_media, whatsapp, 
        business_address, google_maps_link, is_active, created_at, updated_at
      ) VALUES (
        :id, :name, :email, :profile_photo, :category_id, :city_id, :city, :state,
        :education, :experience, :tags, :social_media, :whatsapp,
        :business_address, :google_maps_link, :is_active, :created_at, :updated_at
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        profile_photo = EXCLUDED.profile_photo,
        category_id = EXCLUDED.category_id,
        city_id = EXCLUDED.city_id,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        education = EXCLUDED.education,
        experience = EXCLUDED.experience,
        tags = EXCLUDED.tags,
        social_media = EXCLUDED.social_media,
        whatsapp = EXCLUDED.whatsapp,
        business_address = EXCLUDED.business_address,
        google_maps_link = EXCLUDED.google_maps_link,
        is_active = EXCLUDED.is_active,
        updated_at = EXCLUDED.updated_at`,
      { replacements: professional, type: Sequelize.QueryTypes.INSERT }
    );
  }
  console.log(`   ✅ ${data.professionals.length} profissionais inseridos`);

  // Inserir relacionamentos profissional-subcategorias
  console.log('\n🔗 Vinculando profissionais às subcategorias...');
  let relationshipCount = 0;
  for (const prof of data.professionals) {
    if (prof.subcategories && prof.subcategories.length > 0) {
      for (const subcatId of prof.subcategories) {
        await sequelize.query(
          `INSERT INTO professional_subcategories (professional_id, subcategory_id, created_at, updated_at)
           VALUES (:professional_id, :subcategory_id, :created_at, :updated_at)
           ON CONFLICT (professional_id, subcategory_id) DO NOTHING`,
          {
            replacements: {
              professional_id: prof.id,
              subcategory_id: subcatId,
              created_at: new Date(),
              updated_at: new Date()
            },
            type: Sequelize.QueryTypes.INSERT
          }
        );
        relationshipCount++;
      }
    }
  }
  console.log(`   ✅ ${relationshipCount} relacionamentos profissional-subcategorias criados`);

  // Inserir itens do portfólio
  console.log('\n🎨 Inserindo itens de portfólio...');
  let portfolioCount = 0;
  for (const prof of data.professionals) {
    if (prof.portfolio && prof.portfolio.length > 0) {
      for (const item of prof.portfolio) {
        const portfolioItem = {
          id: item.id,
          professional_id: prof.id,
          title: item.title,
          description: item.description,
          images: JSON.stringify(item.images || []),
          completed_at: item.completedAt ? new Date(item.completedAt) : null,
          project_type: item.projectType || null,
          area: item.area || null,
          duration: item.duration || null,
          tags: JSON.stringify(item.tags || []),
          created_at: new Date(),
          updated_at: new Date()
        };

        await sequelize.query(
          `INSERT INTO portfolio_items (
            id, professional_id, title, description, images,
            completed_at, project_type, area, duration, tags,
            created_at, updated_at
          ) VALUES (
            :id, :professional_id, :title, :description, :images,
            :completed_at, :project_type, :area, :duration, :tags,
            :created_at, :updated_at
          )
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            images = EXCLUDED.images,
            completed_at = EXCLUDED.completed_at,
            project_type = EXCLUDED.project_type,
            area = EXCLUDED.area,
            duration = EXCLUDED.duration,
            tags = EXCLUDED.tags,
            updated_at = EXCLUDED.updated_at`,
          { replacements: portfolioItem, type: Sequelize.QueryTypes.INSERT }
        );
        portfolioCount++;
      }
    }
  }
  console.log(`   ✅ ${portfolioCount} itens de portfólio inseridos`);

  // Inserir indicações
  console.log('\n🤝 Inserindo indicações...');
let indicationCount = 0;
for (const prof of data.professionals) {
  if (prof.indicationsReceived && prof.indicationsReceived.length > 0) {
    for (const indication of prof.indicationsReceived) {
      const indicationData = {
        id: `ind-${indication.professionalId}-${prof.id}`,
        from_professional_id: indication.professionalId,
        to_professional_id: prof.id,
        // Removendo status e message que não existem na tabela
        date: indication.date ? new Date(indication.date) : new Date(),
        created_at: new Date(),
        updated_at: new Date()
      };

      await sequelize.query(
        `INSERT INTO indications (
          id, from_professional_id, to_professional_id, date,
          created_at, updated_at
        ) VALUES (
          :id, :from_professional_id, :to_professional_id, :date,
          :created_at, :updated_at
        )
        ON CONFLICT (id) DO UPDATE SET
          date = EXCLUDED.date,
          updated_at = EXCLUDED.updated_at`,
        { replacements: indicationData, type: Sequelize.QueryTypes.INSERT }
      );
      indicationCount++;
    }
  }
}
console.log(`   ✅ ${indicationCount} indicações inseridas`);
}

// Função principal
async function migrateAllData() {
  try {
    console.log('🚀 Iniciando migração completa dos dados...\n');
    
    await sequelize.authenticate();
    console.log('✅ Conectado ao Supabase com sucesso!');

    // Executar migrações em ordem
    await migrateCategories();
    await migrateCities();
    await migrateProfessionals();

    // Estatísticas finais
    console.log('\n📊 RESUMO DA MIGRAÇÃO:');
    console.log('=' .repeat(50));
    
    const [catCount] = await sequelize.query('SELECT COUNT(*) as total FROM categories');
    const [subCount] = await sequelize.query('SELECT COUNT(*) as total FROM subcategories');
    const [cityCount] = await sequelize.query('SELECT COUNT(*) as total FROM cities');
    const [profCount] = await sequelize.query('SELECT COUNT(*) as total FROM professionals');
    const [portfolioCount] = await sequelize.query('SELECT COUNT(*) as total FROM portfolio_items');
    const [indicationCount] = await sequelize.query('SELECT COUNT(*) as total FROM indications');
    
    console.log(`✅ Categorias: ${catCount[0].total}`);
    console.log(`✅ Subcategorias: ${subCount[0].total}`);
    console.log(`✅ Cidades: ${cityCount[0].total}`);
    console.log(`✅ Profissionais: ${profCount[0].total}`);
    console.log(`✅ Itens de Portfólio: ${portfolioCount[0].total}`);
    console.log(`✅ Indicações: ${indicationCount[0].total}`);
    
    console.log('=' .repeat(50));
    console.log('\n🎉 Migração concluída com sucesso!');

  } catch (error) {
    console.error('\n❌ Erro na migração:', error.message);
    console.error('Detalhes:', error);
  } finally {
    await sequelize.close();
  }
}

// Executar migração
migrateAllData();