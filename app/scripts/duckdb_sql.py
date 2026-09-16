import duckdb

with duckdb.connect() as con:
    rel = con.sql("""
        SELECT name, population, region
        FROM 'data/mn_counties/**/*.parquet'
        WHERE population > 100000
        ORDER BY population DESC
    """)

    rel.show()
