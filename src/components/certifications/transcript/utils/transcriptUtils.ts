
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
    .select('certification_type, score, level, completed_at')
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
  
  // Check if the attempt was completed properly
  if (!attemptData.completed_at || !attemptData.score) {
    console.error("🔴 Attempt was not properly completed:", attemptData);
    throw new Error('This test was not properly completed. The score or completion time is missing.');
  }

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
      throw new Error('No transcript found for this attempt. Make sure you completed the test by clicking the "End Test" button.');
    }
  }

  // Use the first transcript found
  const transcript = transcriptData[0];
  console.log("✅ Found transcript data:", transcript);

  // Validate transcript data
  if (!transcript.user_transcripts || !transcript.ai_responses) {
    console.error("🔴 Transcript data is incomplete:", transcript);
    throw new Error('The transcript data is incomplete or corrupted.');
  }

  try {
    // Ensure arrays are properly parsed
    const userTranscripts = Array.isArray(transcript.user_transcripts) 
      ? transcript.user_transcripts 
      : JSON.parse(transcript.user_transcripts as any);
      
    const aiResponses = Array.isArray(transcript.ai_responses)
      ? transcript.ai_responses
      : JSON.parse(transcript.ai_responses as any);

    return {
      userTranscripts: userTranscripts as string[],
      aiResponses: aiResponses as string[],
      analysisData: transcript.analysis_data,
      createdAt: transcript.created_at,
      certificationType: attemptData.certification_type,
      score: attemptData.score,
      level: attemptData.level
    };
  } catch (error) {
    console.error("🔴 Error parsing transcript data:", error);
    throw new Error('Error parsing transcript data. The format may be incorrect.');
  }
};
