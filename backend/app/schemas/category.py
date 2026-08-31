from pydantic import BaseModel


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    group: str
    icon: str
    is_popular: bool

    model_config = {"from_attributes": True}


class CategoryGroupOut(BaseModel):
    group: str
    icon: str
    categories: list[CategoryOut]
