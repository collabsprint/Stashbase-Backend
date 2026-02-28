import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'cloudname',
  api_key: process.env.CLOUDINARY_API_KEY || 'apikey',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'apisecret',
  secure: true,
});

export { cloudinary };