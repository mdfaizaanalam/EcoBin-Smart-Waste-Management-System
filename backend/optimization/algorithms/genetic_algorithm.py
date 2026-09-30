import random

class GeneticAlgorithm:
    def __init__(
        self,
        distance_func,
        n_bins,
        population_size=100,
        generations=200,
        mutation_rate=0.15,
        crossover_rate=0.8,
        elite_size=20
    ):
        self.distance_func = distance_func
        self.n_bins = n_bins
        self.population_size = population_size
        self.generations = generations
        self.mutation_rate = mutation_rate
        self.crossover_rate = crossover_rate
        self.elite_size = elite_size

    def create_individual(self):
        individual = list(range(self.n_bins))
        random.shuffle(individual)
        return individual

    def create_population(self):
        return [self.create_individual() for _ in range(self.population_size)]

    def fitness(self, individual):
        return self.distance_func(individual)

    def selection(self, population):
        k = min(5, len(population))
        selected = random.sample(population, k)
        selected.sort(key=self.fitness)
        return selected[0]

    def crossover(self, parent1, parent2):
        size = len(parent1)

        # 🔒 HARD SAFETY
        if size < 2:
            return parent1[:], parent2[:]

        start, end = sorted(random.sample(range(size), 2))

        def ox(p1, p2):
            child = [-1] * size
            child[start:end] = p1[start:end]
            fill = end
            for gene in p2:
                if gene not in child:
                    if fill >= size:
                        fill = 0
                    child[fill] = gene
                    fill += 1
            return child

        return ox(parent1, parent2), ox(parent2, parent1)

    def mutate(self, individual):
        size = len(individual)
        if size < 2:
            return individual

        if random.random() < self.mutation_rate:
            i, j = random.sample(range(size), 2)
            individual[i], individual[j] = individual[j], individual[i]
        return individual

    def optimize(self):
        # 🔒 ABSOLUTE EDGE CASE HANDLING
        if self.n_bins < 2:
            route = list(range(self.n_bins))
            return route, self.distance_func(route), []

        population = self.create_population()
        history = []

        for _ in range(self.generations):
            population.sort(key=self.fitness)
            new_population = population[:self.elite_size]

            while len(new_population) < self.population_size:
                p1 = self.selection(population)
                p2 = self.selection(population)

                if random.random() < self.crossover_rate:
                    c1, c2 = self.crossover(p1, p2)
                else:
                    c1, c2 = p1[:], p2[:]

                new_population.append(self.mutate(c1))
                if len(new_population) < self.population_size:
                    new_population.append(self.mutate(c2))

            population = new_population
            history.append(self.fitness(population[0]))

        best = population[0]
        return best, self.fitness(best), history
