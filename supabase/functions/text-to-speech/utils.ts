
import { MAX_CHUNK_SIZE, MAX_RETRIES, RETRY_DELAY } from "./config.ts";

/**
 * Split text into manageable chunks at sentence boundaries
 */
export function splitTextIntoChunks(text: string, maxChunkSize: number = MAX_CHUNK_SIZE): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let remainingText = text;

  while (remainingText.length > 0) {
    if (remainingText.length <= maxChunkSize) {
      chunks.push(remainingText);
      break;
    }

    // Find a good splitting point (end of sentence)
    let splitPoint = remainingText.lastIndexOf('. ', maxChunkSize);
    
    if (splitPoint === -1) {
      // If no period found, try other sentence endings
      splitPoint = remainingText.lastIndexOf('! ', maxChunkSize);
    }
    
    if (splitPoint === -1) {
      splitPoint = remainingText.lastIndexOf('? ', maxChunkSize);
    }
    
    if (splitPoint === -1) {
      // If no sentence break found, look for commas
      splitPoint = remainingText.lastIndexOf(', ', maxChunkSize);
    }

    if (splitPoint === -1) {
      // If no good breaking point, just split at maxChunkSize
      splitPoint = maxChunkSize;
    } else {
      // Include the punctuation mark and space
      splitPoint += 2;
    }

    chunks.push(remainingText.substring(0, splitPoint));
    remainingText = remainingText.substring(splitPoint);
  }

  return chunks;
}

/**
 * Function to retry API calls with exponential backoff
 */
export async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorData}`);
    }
    return response;
  } catch (error) {
    if (retries > 0 && (error.name === 'NetworkError' || error.name === 'TypeError' || error.message.includes('429') || error.message.includes('500'))) {
      console.log(`Retrying due to ${error.message}... (${retries} attempts left)`);
      await new Promise(r => setTimeout(r, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

/**
 * Efficiently process a chunk to base64
 */
export function processAudioToBase64(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer);
  const CHUNK_SIZE = 4096;
  let result = '';
  
  // Process in smaller chunks to prevent memory issues
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.slice(i, Math.min(i + CHUNK_SIZE, bytes.length));
    result += String.fromCharCode.apply(null, [...chunk]);
  }
  
  return btoa(result);
}

/**
 * Concatenate audio streams (MP3 format)
 */
export async function concatenateAudioStreams(audioStreams: ArrayBuffer[]): Promise<ArrayBuffer> {
  if (audioStreams.length === 1) {
    return audioStreams[0];
  }
  
  // For MP3, we can simply concatenate the data
  const totalLength = audioStreams.reduce((acc, buffer) => acc + buffer.byteLength, 0);
  const result = new Uint8Array(totalLength);
  
  let offset = 0;
  for (const buffer of audioStreams) {
    result.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }
  
  return result.buffer;
}
