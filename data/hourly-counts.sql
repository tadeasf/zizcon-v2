-- SQLite
WITH hourly_counts AS (
  SELECT 
    api_source,
    strftime('%Y-%m-%d %H:00:00', timestamp) as hour,
    COUNT(DISTINCT id) as unique_count
  FROM api_calls
  GROUP BY api_source, strftime('%Y-%m-%d %H:00:00', timestamp)
),
sorted_counts AS (
  SELECT
    api_source,
    unique_count,
    ROW_NUMBER() OVER (PARTITION BY api_source ORDER BY unique_count) as row_num,
    COUNT(*) OVER (PARTITION BY api_source) as total_rows
  FROM hourly_counts
)
SELECT 
  api_source,
  AVG(unique_count) as median_hourly_unique_calls
FROM sorted_counts
WHERE 
  row_num IN ((total_rows + 1)/2, (total_rows + 2)/2)
GROUP BY api_source;
