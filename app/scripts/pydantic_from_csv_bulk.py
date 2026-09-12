from csv import DictReader

from pydantic import BaseModel


class County(BaseModel):
    name: str
    population: int


class State(BaseModel):
    name: str
    counties: list[County] = []


with open("data/mn_counties.csv") as f:
    rows = DictReader(f)
    state_data = {"name": "Minnesota", "counties": rows}
    state = State.model_validate(state_data)

print(state)
