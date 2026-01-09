-- Add work_type column to projects table

ALTER TABLE public.projects 
ADD COLUMN work_type text NOT NULL DEFAULT 'office';

-- Add comment for clarity
COMMENT ON COLUMN public.projects.work_type IS 'Work type: remote, hybrid, or office';