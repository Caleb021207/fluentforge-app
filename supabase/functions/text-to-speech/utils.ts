
import { MAX_CHUNK_SIZE } from "./config.ts";

/**
 * Split text into manageable chunks at sentence boundaries
 * Only used for very long texts
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
    let splitPoint = -1;
    const sentenceEnders = ['. ', '! ', '? '];
    
    // Try to find sentence endings first
    for (const ender of sentenceEnders) {
      const lastIndex = remainingText.lastIndexOf(ender, maxChunkSize);
      if (lastIndex > splitPoint) {
        splitPoint = lastIndex + 2; // Include the punctuation mark and space
      }
    }
    
    // If no sentence break found, try commas
    if (splitPoint === -1) {
      splitPoint = remainingText.lastIndexOf(', ', maxChunkSize);
      if (splitPoint !== -1) splitPoint += 2;
    }

    // If still no good breaking point, just split at maxChunkSize
    if (splitPoint === -1) {
      splitPoint = maxChunkSize;
    }

    chunks.push(remainingText.substring(0, splitPoint));
    remainingText = remainingText.substring(splitPoint);
  }

  return chunks;
}

/**
 * Efficiently process audio to base64
 */
export function processAudioToBase64(arrayBuffer: ArrayBuffer): string {
  // Convert array buffer to base64 in one go
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  const chunkSize = 10000; // Process in chunks to avoid call stack issues
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, [...chunk]);
  }
  
  return btoa(binary);
}

/**
 * We don't need this function anymore as we're processing audio in a single step
 * This significantly reduces processing overhead
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
