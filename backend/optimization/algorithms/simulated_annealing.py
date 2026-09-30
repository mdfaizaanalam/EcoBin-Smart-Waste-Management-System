import numpy as np
import random
import math

class SimulatedAnnealing:
    def __init__(self, distance_func, n_bins, initial_temp=10000, 
                 cooling_rate=0.995, min_temp=1):
        self.distance_func = distance_func
        self.n_bins = n_bins
        self.initial_temp = initial_temp
        self.cooling_rate = cooling_rate
        self.min_temp = min_temp
        
    def create_initial_solution(self):
        """Create random initial solution"""
        return list(np.random.permutation(self.n_bins))
    
    def get_neighbor(self, solution):
        """Generate neighbor by swapping two random positions"""
        neighbor = solution.copy()
        idx1, idx2 = random.sample(range(len(neighbor)), 2)
        neighbor[idx1], neighbor[idx2] = neighbor[idx2], neighbor[idx1]
        return neighbor
    
    def acceptance_probability(self, current_cost, new_cost, temperature):
        """Calculate acceptance probability"""
        if new_cost < current_cost:
            return 1.0
        return math.exp((current_cost - new_cost) / temperature)
    
    def optimize(self):
        """Run simulated annealing"""
        # Initialize
        current_solution = self.create_initial_solution()
        current_cost = self.distance_func(current_solution)
        
        best_solution = current_solution.copy()
        best_cost = current_cost
        
        temperature = self.initial_temp
        history = []
        iteration = 0
        
        while temperature > self.min_temp:
            # Generate neighbor
            new_solution = self.get_neighbor(current_solution)
            new_cost = self.distance_func(new_solution)
            
            # Decide whether to accept
            if self.acceptance_probability(current_cost, new_cost, temperature) > random.random():
                current_solution = new_solution
                current_cost = new_cost
                
                # Update best
                if current_cost < best_cost:
                    best_solution = current_solution.copy()
                    best_cost = current_cost
            
            # Record history every 100 iterations
            if iteration % 100 == 0:
                history.append({
                    'iteration': iteration,
                    'temperature': temperature,
                    'current_cost': current_cost,
                    'best_cost': best_cost
                })
            
            # Cool down
            temperature *= self.cooling_rate
            iteration += 1
        
        return best_solution, best_cost, history