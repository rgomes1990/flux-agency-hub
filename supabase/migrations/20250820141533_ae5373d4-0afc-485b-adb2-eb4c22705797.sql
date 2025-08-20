-- Fix existing tasks to be global (set user_id to NULL)
-- This will make them visible to the current loading logic which only loads global tasks
UPDATE tasks_data SET user_id = NULL WHERE user_id IS NOT NULL;