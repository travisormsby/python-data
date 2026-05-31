from pydantic import BaseModel
from csv import DictReader


class County(BaseModel):
    name: str
    population: int


counties = []
with open("data/example.csv") as f:
    reader = DictReader(f)
    for row in reader:
        counties.append(County.model_validate(row))

print(counties)
