from csv import DictReader

from pydantic import BaseModel


class County(BaseModel):
    name: str
    population: int


with open("data/mn_counties.csv") as f:
    rows = DictReader(f)
    for row in rows:
        county = County.model_validate(row)
        print(county)
