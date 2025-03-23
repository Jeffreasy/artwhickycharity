/**
 * Utility script to test private key formatting
 * Run with: node scripts/test-key-format.js
 */

// Paste your key here to test formatting
const sampleKey = `YOUR_PRIVATE_KEY_HERE`;

function formatPrivateKey(key) {
  if (!key) return '';
  
  try {
    // Remove any surrounding quotes if present
    let formattedKey = key.trim();
    if ((formattedKey.startsWith('"') && formattedKey.endsWith('"')) || 
        (formattedKey.startsWith("'") && formattedKey.endsWith("'"))) {
      formattedKey = formattedKey.substring(1, formattedKey.length - 1);
    }
    
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

// Test the formatting function
const formattedKey = formatPrivateKey(sampleKey);
console.log('\nFormatted key:');
console.log(formattedKey);
console.log('\nThis is what should be set in Vercel environment variable GA_PRIVATE_KEY'); 