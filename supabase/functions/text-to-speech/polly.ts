
/**
 * AWS Polly TTS service implementation
 */
export async function textToSpeechPolly(text: string, voiceName: string): Promise<ArrayBuffer> {
  const AWS_REGION = Deno.env.get('AWS_REGION') || 'us-east-1';
  const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID');
  const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');
  
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials are not configured');
  }

  // AWS Signature V4 process
  const host = `polly.${AWS_REGION}.amazonaws.com`;
  const endpoint = `https://${host}/v1/speech`;
  const service = 'polly';
  const method = 'POST';
  
  const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const datestamp = timestamp.slice(0, 8);

  // Request body
  const body = JSON.stringify({
    Text: text,
    OutputFormat: 'mp3',
    VoiceId: voiceName,
    Engine: 'neural'
  });

  // Create canonical request
  const canonicalHeaders = `content-type:application/json\nhost:${host}\nx-amz-date:${timestamp}\n`;
  const signedHeaders = 'content-type;host;x-amz-date';
  
  const payloadHash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(body)
  ).then(hash => Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  );
  
  const canonicalRequest = [
    method,
    '/',
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');
  
  // Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${datestamp}/${AWS_REGION}/${service}/aws4_request`;
  
  const canonicalRequestHash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(canonicalRequest)
  ).then(hash => Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  );
  
  const stringToSign = [
    algorithm,
    timestamp,
    credentialScope,
    canonicalRequestHash
  ].join('\n');
  
  // Calculate signature
  async function hmacSha256(key: ArrayBuffer, message: string): Promise<ArrayBuffer> {
    const keyObj = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: { name: 'SHA-256' } },
      false,
      ['sign']
    );
    return await crypto.subtle.sign(
      'HMAC',
      keyObj,
      new TextEncoder().encode(message)
    );
  }
  
  const kDate = await hmacSha256(
    new TextEncoder().encode(`AWS4${AWS_SECRET_ACCESS_KEY}`),
    datestamp
  );
  const kRegion = await hmacSha256(kDate, AWS_REGION);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, 'aws4_request');
  
  const signature = await hmacSha256(kSigning, stringToSign).then(
    hash => Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  );
  
  // Create authorization header
  const authorizationHeader = [
    `${algorithm} Credential=${AWS_ACCESS_KEY_ID}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`
  ].join(', ');
  
  // Send request
  const response = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Amz-Date': timestamp,
      'Authorization': authorizationHeader
    },
    body
  });
  
  if (!response.ok) {
    throw new Error(`Polly TTS failed: ${await response.text()}`);
  }
  
  return await response.arrayBuffer();
}
