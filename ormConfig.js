var dbConfig = {
  synchronize: false,
  migrations: ['migrations/*.js'],
  cli: {
    migrationsDir: 'migrations',
  },
};

switch (process.env.NODE_ENV) {
  case 'development':
    Object.assign(dbConfig, {
      type: 'sqlite',
      database: 'db.sqlite',
      entities: ['**/*.entity.js'],
      synchronize: true,
    });
    break;
  case 'production':
    Object.assign(dbConfig, {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: ['**/*.entity.js'],
      synchronize: false,
      ssl: {
        rejectUnauthorized: false,
      },
    });
    break;
  case 'test':
    Object.assign(dbConfig, {
      type: 'sqlite',
      database: 'test.sqlite',
      entities: ['**/*.entity.ts'],
      synchronize: true,
      // migrationsRun: true,
    });
    break;
  default:
    throw new Error('Unknown environment');
}

module.exports = dbConfig;
