"""Benchmark fixed scenarios and exactly enumerate a five-stop reference case."""
import itertools
import json
import platform
import ortools
from app.data import ROOT, presets, generate_scenario
from app.schema import Scenario
from app.solver import optimize
from app.validation import validate_plan


def exact_single_vehicle(scenario):
    if scenario.vehicles != 1 or len(scenario.orders) > 8:
        raise ValueError("Exact enumeration is restricted to one vehicle and at most eight orders.")
    best = None
    for permutation in itertools.permutations(order.id for order in scenario.orders):
        plan = validate_plan([list(permutation)], scenario)
        if plan["feasible"] and (best is None or plan["total_distance_meters"] < best["total_distance_meters"]):
            best = plan
    return best


def main():
    cases = [(entry["id"], Scenario.model_validate(entry["scenario"])) for entry in presets()]
    cases.extend((f"seed-{seed}", generate_scenario(seed, 18)) for seed in [7, 19, 61, 88, 103])
    records = []
    for name, scenario in cases:
        result = optimize(scenario)
        if name == "small":
            reference = exact_single_vehicle(scenario)
            result["exact_reference_meters"] = reference["total_distance_meters"]
            result["gap_to_exact_meters"] = (result["optimized"]["total_distance_meters"] - reference["total_distance_meters"]
                                             if result["optimized"] else None)
        records.append({"id": name, **result})
        print(name, result["status"], result["savings"], flush=True)
    comparable = [r for r in records if r["savings"] is not None]
    report = {"ortools_version": ortools.__version__, "python": platform.python_version(),
              "records": records, "summary": {"cases": len(records),
              "feasible": sum(r["status"] == "feasible" for r in records),
              "comparable": len(comparable),
              "mean_savings_percent": sum(r["savings"]["percent"] for r in comparable) / len(comparable) if comparable else None},
              "note": "Fixed synthetic benchmarks, not a train/test split. Results under a wall-clock search limit can vary."}
    (ROOT / "artifacts").mkdir(exist_ok=True)
    (ROOT / "artifacts/benchmark.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
