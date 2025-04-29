
# AWS Polly Integration for Voice Chat

This document explains how to set up the AWS Polly integration for the voice chat feature.

## Overview

The application uses AWS Polly for text-to-speech synthesis, supporting 96 language/locale combinations with over 400 voice options. This provides a wide range of languages for users to practice with, significantly expanding language coverage compared to other TTS services.

## Setup Instructions

### 1. Configure AWS Credentials in Supabase

You'll need to set the following environment variables in your Supabase project settings:

- `AWS_ACCESS_KEY_ID`: Your AWS access key with Polly permissions
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key
- `AWS_REGION`: The AWS region to use (default: us-east-1)

### 2. Deploy the Polly Edge Function

The `polly-tts` Edge Function needs to be deployed to your Supabase project. You can do this with the Supabase CLI:

```bash
supabase functions deploy polly-tts
```

### 3. Update Edge Function Code

The Edge Function code (`supabase/functions/polly-tts/index.ts`) needs to be updated with proper AWS Signature V4 authentication. The current version contains placeholder code.

## Supported Languages

AWS Polly supports a vast array of languages including:

- English (multiple variants: US, UK, Australian, etc.)
- Spanish (multiple variants)
- French, German, Italian, Portuguese
- Chinese (Mandarin, Cantonese)
- Japanese, Korean, Hindi, Arabic
- Russian, Ukrainian, Polish
- Vietnamese, Indonesian, Thai
- And many more

## Voice Selection

The application automatically selects appropriate voices based on the user's interface language, but users can also manually select from available voices for their language.

## Implementation Notes

- The text-to-speech functionality is abstracted in `pollyTtsUtils.ts`
- Voice settings can be configured in the `PollyTTSSettings` component
- Each language has default voice mappings

## Resources

- [AWS Polly Documentation](https://docs.aws.amazon.com/polly/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
