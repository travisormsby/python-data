from pydantic import TypeAdapter
from typing import NamedTuple
from csv import DictReader


class County(NamedTuple):
    name: int
    population: int


adapter = TypeAdapter(list[County])
with open("data/example.csv") as f:
    reader = DictReader(f)
    counties = adapter.validate_python(list(reader))

print(counties[1])
