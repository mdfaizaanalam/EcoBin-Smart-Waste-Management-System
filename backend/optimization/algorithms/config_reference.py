import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'smart-waste-collection-key'
    
    # Optimization parameters
    GENETIC_ALGORITHM = {
        'population_size': 100,
        'generations': 200,
        'mutation_rate': 0.15,
        'crossover_rate': 0.8,
        'elite_size': 20
    }
    
    SIMULATED_ANNEALING = {
        'initial_temp': 10000,
        'cooling_rate': 0.995,
        'min_temp': 1
    }
    
    # Truck specifications
    TRUCK_CAPACITY = 10000  # kg
    TRUCK_SPEED = 40  # km/h
    FUEL_CONSUMPTION = 0.35  # liters per km
    CO2_PER_LITER = 2.63  # kg CO2 per liter
    
    # Cost parameters
    FUEL_COST_PER_LITER = 1.5  # USD
    DRIVER_COST_PER_HOUR = 25  # USD