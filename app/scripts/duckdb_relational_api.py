import duckdb

with duckdb.connect() as con:
    rel = (
        con.read_parquet("data/mn_counties/", hive_partitioning=True)
        .filter("region = 'Twin Cities'")
        .select("name", "population", "area_km2")
        .order("area_km2 desc")
    )

    rel.show()
