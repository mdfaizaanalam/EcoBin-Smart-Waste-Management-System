class NearestNeighbor:
    def __init__(self, distance_func, n_bins, distance_matrix):
        self.distance_func = distance_func
        self.n_bins = n_bins
        self.distance_matrix = distance_matrix
        
    def optimize(self):
        """Greedy nearest neighbor algorithm"""
        unvisited = set(range(self.n_bins))
        route = []
        current = 0  # Start at depot (index 0)
        
        while unvisited:
            # Find nearest unvisited bin
            nearest = min(unvisited, 
                         key=lambda x: self.distance_matrix[current][x + 1])
            route.append(nearest)
            unvisited.remove(nearest)
            current = nearest + 1  # +1 for depot offset
        
        distance = self.distance_func(route)
        
        return route, distance, []