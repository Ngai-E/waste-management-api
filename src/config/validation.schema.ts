import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api/v1'),
  
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
  
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
  
  MAX_FILE_SIZE: Joi.number().default(5242880),
  UPLOAD_DESTINATION: Joi.string().default('./uploads'),
  FILE_STORAGE_PROVIDER: Joi.string()
    .valid('local', 's3', 'cloudinary')
    .default('local'),
});
