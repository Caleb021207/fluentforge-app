
-- Enable Row Level Security on certification_transcripts table
ALTER TABLE certification_transcripts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own transcripts
CREATE POLICY "Users can read their own transcripts" 
ON certification_transcripts 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own transcripts
CREATE POLICY "Users can insert their own transcripts" 
ON certification_transcripts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own transcripts
CREATE POLICY "Users can update their own transcripts" 
ON certification_transcripts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own transcripts
CREATE POLICY "Users can delete their own transcripts" 
ON certification_transcripts 
FOR DELETE 
USING (auth.uid() = user_id);
