"""Reproducible fictional stops on a 500-metre city grid."""
import json
import random
from pathlib import Path
from app.schema import Order, Scenario

ROOT = Path(__file__).resolve().parent.parent
DEPOT = {"id": 0, "x": 10, "y": 10, "demand": 0, "service_minutes": 0}


def generate_scenario(seed=42, order_count=18):
    rng = random.Random(seed)
    positions = [(x, y) for x in range(1, 20) for y in range(1, 20) if (x, y) != (10, 10)]
    selected = rng.sample(positions, order_count)
    orders = [Order(id=i + 1, x=x, y=y, demand=rng.randint(2, 5), service_minutes=5)
              for i, (x, y) in enumerate(selected)]
    return Scenario(orders=orders)


def presets():
    normal = generate_scenario()
    busy = generate_scenario(17, 26).model_copy(update={"vehicles": 4})
    shortage = normal.model_copy(update={"vehicles": 1, "capacity": 12})
    tight = normal.model_copy(update={"max_minutes": 15})
    small = Scenario(orders=[Order(id=i+1, x=x, y=y, demand=2) for i, (x,y) in
                              enumerate([(4,5), (15,4), (18,12), (12,18), (3,15)])],
                     vehicles=1, capacity=20, max_minutes=240)
    trap = Scenario(orders=[Order(id=i+1, x=11+i, y=11, demand=demand)
                             for i, demand in enumerate([4, 4, 6, 6])], vehicles=2, capacity=10)
    return [{"id": name, "label": label, "scenario": case.model_dump()}
            for name, label, case in [("regular", "Jornada habitual", normal),
                                      ("busy", "Más entregas", busy),
                                      ("shortage", "Capacidad insuficiente", shortage),
                                      ("tight", "Turno demasiado corto", tight),
                                      ("small", "Caso pequeño verificable", small),
                                      ("greedy_trap", "La regla inicial se atasca", trap)]]


def main():
    (ROOT / "data").mkdir(exist_ok=True)
    (ROOT / "data/scenarios.json").write_text(json.dumps(presets(), ensure_ascii=False, indent=2) + "\n")
    print("Saved six reproducible synthetic scenarios.")


if __name__ == "__main__":
    main()
