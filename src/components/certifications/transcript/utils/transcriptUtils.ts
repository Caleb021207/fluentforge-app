
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export const formatCreatedAt = (dateString: string) => {
  try {
    return format(new Date(dateString), 'PPpp');
  } catch (err) {
    return dateString;
  }
};

export const fetchTranscriptData = async (attemptId: string) => {
  console.log("⭐ Starting transcript fetch for attempt:", attemptId);

  // Get the current user to verify that we're authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    console.error("🔴 Auth error:", authError);
    throw new Error(`Authentication error: ${authError.message}`);
  }
  
  if (!user) {
    console.error("🔴 No authenticated user found");
    throw new Error('You must be logged in to view transcripts');
  }
  
  console.log("✅ Authenticated as user:", user.id);

  // First, get the attempt details to know certification type
  const { data: attemptData, error: attemptError } = await supabase
    .from('certification_attempts')
    .select('certification_type, score, level')
    .eq('id', attemptId)
    .single();

  if (attemptError) {
    console.error("🔴 Error fetching attempt data:", attemptError);
    throw new Error(`Error fetching attempt data: ${attemptError.message}`);
  }

  if (!attemptData) {
    console.error("🔴 No attempt data found for ID:", attemptId);
    throw new Error('Attempt not found');
  }

  console.log("✅ Found attempt data:", attemptData);

  // Then get the transcript data with explicit column selection
  console.log("⭐ Fetching transcript with params:", { 
    attempt_id: attemptId,
    user_id: user.id
  });
  
  // Try first without the user_id filter to see if any records exist
  const { data: allTranscripts, error: allTranscriptsError } = await supabase
    .from('certification_transcripts')
    .select('id, user_id, attempt_id, user_transcripts, ai_responses, analysis_data, created_at');
    
  console.log("✅ All transcripts in system:", { 
    count: allTranscripts?.length || 0,
    data: allTranscripts,
    error: allTranscriptsError
  });
  
  // Now try with the filters
  const { data: transcriptData, error: transcriptError } = await supabase
    .from('certification_transcripts')
    .select('id, user_id, attempt_id, user_transcripts, ai_responses, analysis_data, created_at')
    .eq('attempt_id', attemptId)
    .eq('user_id', user.id);

  console.log("🔍 Transcript query result:", { 
    count: transcriptData?.length || 0,
    data: transcriptData, 
    error: transcriptError,
    filters: {
      attempt_id: attemptId,
      user_id: user.id
    }
  });

  if (transcriptError) {
    console.error("🔴 Error fetching transcript:", transcriptError);
    throw new Error(`Error fetching transcript: ${transcriptError.message}`);
  }

  if (!transcriptData || transcriptData.length === 0) {
    // Check if transcript exists for the attempt but with a different user_id
    const { data: attemptTranscripts } = await supabase
      .from('certification_transcripts')
      .select('id, user_id')
      .eq('attempt_id', attemptId);
      
    console.log("🔍 Transcripts for this attempt with any user:", attemptTranscripts);
    
    if (attemptTranscripts && attemptTranscripts.length > 0) {
      console.error("🔶 Found transcript but for a different user:", {
        foundForUsers: attemptTranscripts.map(t => t.user_id),
        requestingUser: user.id
      });
      throw new Error('You do not have permission to view this transcript');
    } else {
      console.error("🔴 No transcript found for attempt:", attemptId);
      throw new Error('No transcript found for this attempt');
    }
  }

  // Use the first transcript found
  const transcript = transcriptData[0];
  console.log("✅ Found transcript data:", transcript);

  return {
    userTranscripts: transcript.user_transcripts as string[],
    aiResponses: transcript.ai_responses as string[],
    analysisData: transcript.analysis_data,
    createdAt: transcript.created_at,
    certificationType: attemptData.certification_type,
    score: attemptData.score,
    level: attemptData.level
  };
};
