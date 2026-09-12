import duckdb

with duckdb.connect() as con:
    rel = con.sql("""
        SELECT region, COUNT(name) AS num_counties_over_100k_pop 
        FROM 'data/mn_counties/**/*.parquet'
        WHERE population > 100000
        GROUP BY region
        ORDER BY num_counties_over_100k_pop DESC
    """)

    rel.show()
