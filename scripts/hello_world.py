import duckdb
import sys

rel = duckdb.read_csv("data/example.csv")
rel.show()

print(sys.version_info)
