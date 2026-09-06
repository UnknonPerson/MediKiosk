import { v2 as cloudinary } from 'cloudinary';
import env from './env.js';

if (env.cloudinary.configured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

export function isCloudinaryConfigured() {
  return env.cloudinary.configured;
}

export default cloudinary;
