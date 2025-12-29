-- Update the completed submission to 100% score and 100 XP
UPDATE assignment_submissions 
SET ai_score = 100, xp_awarded = 100, status = 'completed'
WHERE id = '8c7bce32-9728-42d8-a782-c952d5821b79';

-- Update user's total XP (add 24 more to get from 76 to 100)
UPDATE user_progression 
SET total_xp = total_xp + 24
WHERE user_id = '19b70a50-b038-43a0-89f2-0cdf440ca2f6';