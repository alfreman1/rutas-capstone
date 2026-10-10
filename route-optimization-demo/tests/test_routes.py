"""Check distances, full-service feasibility and honest comparison outcomes."""
import json
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError
from app.baseline import build_baseline
from app.data import generate_scenario, presets, ROOT, DEPOT
from app.evaluate import exact_single_vehicle
from app.main import app, solve_lock
from app.network import distance_meters, travel_seconds, matrices
from app.schema import Scenario, Order
from app.solver import optimize
from app.validation import route_details, validate_plan, infeasibility_reasons


def case(name):
    return Scenario.model_validate(next(item['scenario'] for item in presets() if item['id'] == name))


def tiny(**changes):
    data = {'orders': [Order(id=1,x=12,y=10,demand=5)], 'vehicles':1, 'capacity':10, 'max_minutes':30}
    return Scenario(**{**data, **changes})


def test_distance_time_and_service_by_hand():
    scenario = tiny()
    detail = route_details([1], scenario, 1)
    assert distance_meters(DEPOT, scenario.orders[0].model_dump()) == 1000
    assert detail['distance_meters'] == 2000
    assert detail['duration_seconds'] == 540
    assert detail['stops'][0]['arrival_seconds'] == 120
    assert detail['stops'][0]['departure_seconds'] == 420
    assert detail['load'] == 5


def test_empty_vehicle_has_zero_time_and_distance():
    detail=route_details([], tiny(), 1)
    assert detail['distance_meters'] == detail['duration_seconds'] == detail['load'] == 0


def test_matrices_match_independent_route_duration():
    scenario=case('small')
    nodes, distance, duration=matrices(scenario)
    indices=[0,1,3,2,5,4,0]
    details=route_details([nodes[index]['id'] for index in indices[1:-1]],scenario,1)
    assert sum(duration[a][b] for a,b in zip(indices,indices[1:])) == details['duration_seconds']
    assert sum(distance[a][b] for a,b in zip(indices,indices[1:])) == details['distance_meters']
    for a in range(len(nodes)):
        assert distance[a][a] == 0
        for b in range(len(nodes)):
            assert distance[a][b] == distance[b][a]


def test_trip_seconds_round_up():
    assert travel_seconds({'x':0,'y':0},{'x':1,'y':0},17) == 106


def test_same_seed_reproduces_orders():
    assert generate_scenario(42).model_dump()==generate_scenario(42).model_dump()
    assert generate_scenario(42).orders!=generate_scenario(43).orders


@pytest.mark.parametrize('updates',[{'vehicles':0},{'vehicles':7},{'capacity':0},{'speed_kmh':0},
                                    {'max_minutes':5},{'vehicles':True},{'capacity':10.5},{'speed_kmh':'30'},
                                    {'orders':[]},{'unexpected':1}])
def test_invalid_scenarios_are_rejected(updates):
    with pytest.raises(ValidationError):
        Scenario.model_validate({**tiny().model_dump(),**updates})


def test_duplicate_ids_and_coordinates_bounds():
    with pytest.raises(ValidationError):
        tiny(orders=[Order(id=1,x=1,y=1,demand=1),Order(id=1,x=2,y=2,demand=1)])
    with pytest.raises(ValidationError):
        Order(id=1,x=21,y=2,demand=1)


@pytest.mark.parametrize('routes',[[[]],[[1,1]],[[999]],[[0,1]],[[1],[]]])
def test_bad_plans_are_not_feasible(routes):
    assert not validate_plan(routes,tiny())['feasible']


def test_capacity_and_duration_are_hard_constraints():
    assert not validate_plan([[1]],tiny(capacity=4))['feasible']
    scenario=tiny(speed_kmh=10,max_minutes=10)
    assert not validate_plan([[1]],scenario)['feasible']


def test_return_trip_and_service_count_toward_turn():
    scenario=tiny(speed_kmh=10,max_minutes=10)
    assert route_details([1],scenario,1)['duration_seconds']==1020
    assert infeasibility_reasons(scenario)


def test_known_infeasible_scenarios():
    for name in ['shortage','tight']:
        result=optimize(case(name),0.05)
        assert result['status']=='proven_infeasible'
        assert result['optimized'] is None and result['savings'] is None
        assert result['reasons']


def test_total_capacity_is_not_a_sufficient_proof():
    scenario=Scenario(orders=[Order(id=i+1,x=i+1,y=1,demand=6) for i in range(3)], vehicles=2,capacity=10)
    assert not infeasibility_reasons(scenario)
    result=optimize(scenario,0.05)
    assert result['status']=='no_solution_found'
    assert result['optimized'] is None


def test_no_solver_solution_is_not_claimed_impossible(monkeypatch):
    monkeypatch.setattr('app.solver.solve_routes',lambda *args:(None,4))
    result=optimize(case('greedy_trap'),0.05)
    assert result['status']=='no_solution_found' and not result['reasons']


def test_keep_feasible_baseline_if_search_fails(monkeypatch):
    monkeypatch.setattr('app.solver.solve_routes',lambda *args:(None,4))
    result=optimize(tiny(),0.05)
    assert result['status']=='feasible'
    assert result['solution_source']=='baseline_retained'
    assert result['savings']['meters']==0


def test_greedy_failure_does_not_imply_problem_infeasibility():
    scenario=case('greedy_trap')
    assert not build_baseline(scenario)['feasible']
    result=optimize(scenario,0.2)
    assert result['optimized']['feasible']
    assert result['optimized']['served_orders']==4
    assert result['savings'] is None


def test_small_solver_matches_exact_reference():
    scenario=case('small')
    exact=exact_single_vehicle(scenario)
    result=optimize(scenario,0.2)
    assert result['optimized']['total_distance_meters']==exact['total_distance_meters']
    assert result['optimality_proven'] is False


@pytest.mark.parametrize('seed',[7,42,88])
def test_real_solver_returns_valid_nonworse_plan(seed):
    scenario=generate_scenario(seed)
    result=optimize(scenario,0.2)
    plan=result['optimized']
    assert plan['feasible']
    routes=[route['order_ids'] for route in plan['routes']]
    assert validate_plan(routes,scenario)==plan
    if result['baseline']['feasible']:
        assert plan['total_distance_meters']<=result['baseline']['total_distance_meters']


def test_nonsequential_ids_are_mapped_correctly():
    scenario=tiny(orders=[Order(id=77,x=11,y=10,demand=1),Order(id=12,x=12,y=12,demand=1)])
    result=optimize(scenario,0.1)
    assert set(result['optimized']['routes'][0]['order_ids'])=={12,77}


def test_colocated_order_zero_distance_does_not_divide_by_zero():
    result=optimize(tiny(orders=[Order(id=1,x=10,y=10,demand=1)]),0.05)
    assert result['optimized']['total_distance_meters']==0
    assert result['optimized']['total_duration_seconds']==300
    assert result['savings']['percent']==0


def test_api_routes_and_validation():
    with TestClient(app) as client:
        for path in ['/','/static/app.js','/static/styles.css','/api/health','/api/scenarios','/api/benchmark']:
            assert client.get(path).status_code==200
        assert client.post('/api/generate',json={'seed':3,'order_count':5}).status_code==200
        assert client.post('/api/generate',json={'seed':3,'order_count':31}).status_code==422
        assert client.post('/api/optimize',json={}).status_code==422
        result=client.post('/api/optimize',json=case('shortage').model_dump())
        assert result.status_code==200 and result.json()['status']=='proven_infeasible'


def test_api_uses_real_solver():
    with TestClient(app) as client:
        response=client.post('/api/optimize',json=tiny().model_dump())
        assert response.status_code==200
        assert response.json()['optimized']['total_distance_meters']==2000


def test_api_concurrency_guard():
    with TestClient(app) as client:
        solve_lock.acquire()
        try:
            assert client.post('/api/optimize',json=tiny().model_dump()).status_code==429
        finally:
            solve_lock.release()


def test_benchmark_claims_match_route_recomputation():
    report=json.loads((ROOT/'artifacts/benchmark.json').read_text())
    for record in report['records']:
        scenario=Scenario.model_validate(record['scenario'])
        if record['optimized']:
            routes=[r['order_ids'] for r in record['optimized']['routes']]
            assert validate_plan(routes,scenario)==record['optimized']
        if record['savings']:
            assert record['baseline']['feasible'] and record['optimized']['feasible']
