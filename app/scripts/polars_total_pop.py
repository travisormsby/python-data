import polars as pl

total_pop = pl.col("population").sum()

frame = (
    pl.read_csv("data/mn_counties.csv")
    .filter(pl.col("region") == "Twin Cities")
    .select(total_pop)
)

print(frame)
