import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const imagesToVerify = [
  '66fbc7d32c54ed89b3c8945b_test_pgrla9',
  '673f0082162ae4c34630870d_Fles.DoosTEST_olznsb'
  // Voeg hier andere image IDs toe
];

async function verifyCloudinarySetup() {
  console.log('Checking Cloudinary configuration...');
  console.log('Cloud name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
  
  for (const imageId of imagesToVerify) {
    try {
      const result = await cloudinary.api.resource(imageId);
      console.log(`✅ Image ${imageId} exists:`, result.secure_url);
    } catch (error) {
      console.error(`❌ Image ${imageId} not found:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

verifyCloudinarySetup();