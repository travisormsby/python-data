import polars as pl

density = (pl.col("population") / pl.col("area_km2")).alias("density")

frame = (
    pl.read_csv("data/mn_counties.csv")
    .select(pl.col("name"), density)
    .sort(pl.col("density"))
    .tail(1)
)

print(frame)
