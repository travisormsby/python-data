from pydantic import BaseModel


class County(BaseModel):
    name: str
    population: int


county1 = County(name="Aitkin", population=16252)
county2 = County(name="Anoka", population="381605")
county3 = County(name="Becker", population=35497.0)
county4 = County(name="Beltrami", population=47055.1)
