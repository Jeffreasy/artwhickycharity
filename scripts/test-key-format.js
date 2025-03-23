/**
 * Utility script to test private key formatting for Google Analytics
 * Run with: node scripts/test-key-format.js
 */

// Method 1: Paste your raw private key here (with or without BEGIN/END markers)
const rawPrivateKey = `YOUR_PRIVATE_KEY_HERE`;

// Method 2: Paste your entire JSON service account key file here
const jsonKeyFile = `{
  "type": "service_account",
  "project_id": "your-project",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n",
  "client_email": "service-account@project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/service-account%40project.iam.gserviceaccount.com"
}`;

function formatPrivateKey(key) {
  if (!key) return '';
  
  try {
    // Remove any surrounding quotes if present
    let formattedKey = key.trim();
    if ((formattedKey.startsWith('"') && formattedKey.endsWith('"')) || 
        (formattedKey.startsWith("'") && formattedKey.endsWith("'"))) {
      formattedKey = formattedKey.substring(1, formattedKey.length - 1);
    }
    
    // Replace escaped newlines with actual newlines
    formattedKey = formattedKey.replace(/\\n/g, '\n');
    
    // If the key is base64 without headers, add them
    if (!formattedKey.includes('-----BEGIN')) {
      // Clean the key: remove spaces and ensure no linebreaks in the base64 content
      formattedKey = formattedKey.replace(/\s/g, '');
      
      // Add proper PEM format with linebreaks for proper parsing
      formattedKey = '-----BEGIN PRIVATE KEY-----\n' + 
                     formattedKey.match(/.{1,64}/g)?.join('\n') + 
                     '\n-----END PRIVATE KEY-----';
    } else {
      // If the key already has headers but potentially incorrect formatting
      // Extract the base64 content between the headers
      const base64Content = formattedKey
        .replace('-----BEGIN PRIVATE KEY-----', '')
        .replace('-----END PRIVATE KEY-----', '')
        .replace(/\s/g, '');
      
      // Re-format with proper line breaks (PEM requires lines of max 64 chars)
      formattedKey = '-----BEGIN PRIVATE KEY-----\n' + 
                     base64Content.match(/.{1,64}/g)?.join('\n') + 
                     '\n-----END PRIVATE KEY-----';
    }
    
    // Log details for debugging
    console.log('Private key format check: Has header:', formattedKey.includes('-----BEGIN PRIVATE KEY-----'));
    console.log('Private key format check: Has footer:', formattedKey.includes('-----END PRIVATE KEY-----'));
    console.log('Private key format check: Number of lines:', formattedKey.split('\n').length);
    console.log('Private key format check: Has newlines:', formattedKey.includes('\n'));
    
    return formattedKey;
  } catch (error) {
    console.error('Error formatting private key:', error);
    return key || '';
  }
}

function extractCredentialsFromJson(jsonStr) {
  try {
    const keyData = JSON.parse(jsonStr);
    const clientEmail = keyData.client_email;
    const privateKey = keyData.private_key;
    const projectId = keyData.project_id;
    
    console.log('\n--- Service Account Details ---');
    console.log('Client Email:', clientEmail);
    console.log('Project ID:', projectId);
    
    return { clientEmail, privateKey, projectId };
  } catch (error) {
    console.error('Error parsing JSON key file:', error);
    return { clientEmail: null, privateKey: null, projectId: null };
  }
}

// Process JSON key file if provided
if (jsonKeyFile && jsonKeyFile !== `{
  "type": "service_account",
  "project_id": "your-project",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n",
  "client_email": "service-account@project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/service-account%40project.iam.gserviceaccount.com"
}`) {
  console.log('Processing JSON key file...');
  const { clientEmail, privateKey, projectId } = extractCredentialsFromJson(jsonKeyFile);
  
  if (privateKey) {
    console.log('\n--- Private Key Formatting ---');
    const formattedKey = formatPrivateKey(privateKey);
    
    console.log('\n=== Environment Variables for Vercel ===');
    console.log('GA_CLIENT_EMAIL:', clientEmail);
    console.log('GA_PRIVATE_KEY:');
    console.log(formattedKey);
    
    console.log('\n=== For .env.local ===');
    console.log(`GA_CLIENT_EMAIL=${clientEmail}`);
    console.log('GA_PRIVATE_KEY="' + formattedKey.replace(/\n/g, '\\n') + '"');
  }
} 
// Process raw private key if provided
else if (rawPrivateKey && rawPrivateKey !== 'YOUR_PRIVATE_KEY_HERE') {
  console.log('Processing raw private key...');
  const formattedKey = formatPrivateKey(rawPrivateKey);
  
  console.log('\n=== Formatted Private Key for Vercel ===');
  console.log(formattedKey);
  
  console.log('\n=== For .env.local ===');
  console.log('GA_PRIVATE_KEY="' + formattedKey.replace(/\n/g, '\\n') + '"');
} else {
  console.log('Please replace either the rawPrivateKey or jsonKeyFile with your actual key data.');
  console.log('Instructions:');
  console.log('1. Create a service account in Google Cloud Console');
  console.log('2. Generate a JSON key file');
  console.log('3. Paste either the private_key value or the entire JSON file content into this script');
  console.log('4. Run with: node scripts/test-key-format.js');
} 