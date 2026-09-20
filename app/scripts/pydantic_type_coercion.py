from pydantic import BaseModel, ValidationError


class County(BaseModel):
    name: str
    population: int


try:
    county1 = County(name="Aitkin", population="16252")
    print(county1)
    county2 = County(name="Anoka", population=381605.0)
    print(county2)
    county3 = County(name="Becker", population=True)
    print(county3)
    county4 = County(name="Beltrami", population=47055.1)
    print(county4)
except ValidationError as e:
    print(e)
