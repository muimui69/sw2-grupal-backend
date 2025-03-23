import * as Joi from 'joi';

export const envSchema = Joi.object({
  // DATABASE_URL: Joi.string().required(),
  PORT: Joi.number().default(3000),
  SECRET_KEY_JWT: Joi.string().required(),
  // CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  // CLOUDINARY_API_KEY: Joi.string().required(),
  // CLOUDINARY_API_SECRET: Joi.string().required(),
  // BLOCKCHAIN_URL: Joi.string().required(),
  // WALLET_PRIVATE_KEY: Joi.string().required(),
  // HARDHAT_MICROSERVICE_URL: Joi.string().required(),
  // PINATA_API_KEY: Joi.string().required(),
  // PINATA_API_SECRET: Joi.string().required(),
  // AWS_ACCESS_KEY_ID: Joi.string().required(),
  // AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  // AWS_REGION: Joi.string().required(),
  // COHERE_API_KEY: Joi.string().required(),
})