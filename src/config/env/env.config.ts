

export const envConfig = () => ({
  enviroment: process.env.NODE_ENV || 'dev',
  port: +process.env.PORT || 3000,
  db_port: +process.env.DB_PORT || 5432,
  db_host: process.env.DB_HOST,
  db_name: process.env.DB_NAME,
  db_user: process.env.DB_USER,
  db_password: process.env.DB_PASSWORD,
  secret_key_jwt: process.env.SECRET_KEY_JWT,
  stripe_key: process.env.STRIPE_KEY,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  // blockchain_url: process.env.BLOCKCHAIN_URL,
  // wallet_private_key: process.env.WALLET_PRIVATE_KEY,
  // hardhat_microservice_url: process.env.HARDHAT_MICROSERVICE_URL,
  // pinata_api_key: process.env.PINATA_API_KEY,
  // pinata_api_secret: process.env.PINATA_API_SECRET,
  // aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
  // aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
  // aws_region: process.env.AWS_REGION,
  // cohere_api_key: process.env.COHERE_API_KEY
})