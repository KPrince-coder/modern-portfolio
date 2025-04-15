-- Create RPC function for updating blog post time spent
CREATE OR REPLACE FUNCTION portfolio.update_blog_post_time_spent(post_id UUID, time_spent INTEGER)
RETURNS VOID AS $$
BEGIN
  -- Check if analytics record exists for this post
  IF EXISTS (SELECT 1 FROM portfolio.blog_post_analytics WHERE post_id = $1) THEN
    -- Update existing record
    UPDATE portfolio.blog_post_analytics
    SET 
      total_time_spent = total_time_spent + $2,
      view_count_for_time = view_count_for_time + 1,
      avg_time_spent = (total_time_spent + $2) / (view_count_for_time + 1)
    WHERE post_id = $1;
  ELSE
    -- Create new record
    INSERT INTO portfolio.blog_post_analytics (
      post_id, 
      avg_time_spent, 
      total_time_spent, 
      view_count_for_time,
      views
    )
    VALUES (
      $1, 
      $2, 
      $2, 
      1,
      1
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON FUNCTION portfolio.update_blog_post_time_spent IS 'Updates the time spent metrics for a blog post';
