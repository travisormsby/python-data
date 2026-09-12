import polars as pl

regional_area = pl.col("area_km2").sum()

frame = (
    pl.read_csv("data/mn_counties.csv")
    .group_by(pl.col("region"))
    .agg(regional_area)
)

print(frame)
