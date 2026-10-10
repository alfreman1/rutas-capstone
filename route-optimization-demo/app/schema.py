"""Validate input before creating a routing problem."""
from pydantic import BaseModel, ConfigDict, Field, model_validator


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)


class Order(StrictModel):
    id: int = Field(ge=1, le=999)
    x: int = Field(ge=0, le=20)
    y: int = Field(ge=0, le=20)
    demand: int = Field(ge=1, le=60)
    service_minutes: int = Field(default=5, ge=0, le=30)


class Scenario(StrictModel):
    orders: list[Order] = Field(min_length=1, max_length=30)
    vehicles: int = Field(default=3, ge=1, le=6)
    capacity: int = Field(default=24, ge=1, le=60)
    max_minutes: int = Field(default=150, ge=10, le=480)
    speed_kmh: int = Field(default=30, ge=10, le=60)

    @model_validator(mode="after")
    def unique_ids(self):
        ids = [order.id for order in self.orders]
        if len(ids) != len(set(ids)):
            raise ValueError("Order IDs must be unique.")
        return self


class GenerateInput(StrictModel):
    seed: int = Field(default=42, ge=0, le=9999)
    order_count: int = Field(default=18, ge=3, le=30)
