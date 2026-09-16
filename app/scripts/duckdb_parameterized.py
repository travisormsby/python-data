import duckdb

pop_threshold = 200000

with duckdb.connect() as con:
    query = """
        SELECT name, population, region
        FROM 'data/mn_counties/**/*.parquet'
        WHERE population > $pop_threshold
        ORDER BY population DESC
    """

    params = {"pop_threshold": pop_threshold}

    con.execute(query, parameters=params)

    df = con.pl()

print(df)
