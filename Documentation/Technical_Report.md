# Technical Report — EcoBin Algorithmic Architecture & Verification

A deep-dive technical analysis of the mathematical formulations, machine learning regression models, constraint-programming routing solvers, and carbon accounting methodologies powering the EcoBin platform.

---

## 1. Machine Learning Time-Series Forecasting

### 1.1 Problem Formulation
Let $y_{i,t}$ denote the fill percentage of waste container $i \in \{1, \dots, N\}$ at hour $t$. The objective is to estimate $\hat{y}_{i, t+24}$ representing the fill level 24 hours into the future, conditioned on historical observations $\mathbf{x}_{i, \le t}$ and calendar features $\mathbf{c}_{t+24}$:

$$\hat{y}_{i, t+24} = f(\mathbf{x}_{i, \le t}, \mathbf{c}_{t+24}; \boldsymbol{\theta})$$

### 1.2 Feature Engineering Pipeline
The feature vector $\mathbf{x} \in \mathbb{R}^{31}$ incorporates:
- **Temporal & Calendar Features:** Hour of day $h \in [0, 23]$, day of week $d \in [0, 6]$, month $m \in [1, 12]$, weekend indicator $\mathbb{I}_{\text{weekend}}$, gazetted public holiday $\mathbb{I}_{\text{holiday}}$.
- **Lag Features:** Fill levels $y_{t-1}$, $y_{t-2}$, and historical 24h baseline $y_{t-24}$.
- **Rolling Statistics:** Rolling mean and sample standard deviation computed over 6h and 24h trailing horizons:
  $$\mu_{6h} = \frac{1}{6} \sum_{k=0}^{5} y_{t-k}, \quad \sigma_{6h} = \sqrt{\frac{1}{5} \sum_{k=0}^{5} (y_{t-k} - \mu_{6h})^2}$$
- **Weather Interactions:** Ambient temperature $T$, precipitation $R$, and non-linear interaction $T \times R$.
- **Spatial & Land-Use Encoded Variables:** One-hot categorical indicators for commercial, residential, market, industrial, school, and hospital zones.

### 1.3 Model Benchmarking & Statistical Evaluation
Trained over 290,000 hourly historical bin states:

| Model Architecture | MAE (%) | RMSE (%) | MAPE (%) | $R^2$ Score | Precision (Overflow) | Recall (Overflow) | F1-Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Baseline (Persistence $y_{t}$)** | 38.00% | 40.91% | 59.74% | -4.75 | 0.00% | 0.00% | 0.000 |
| **Ridge Regression ($\alpha=1.0$)** | 4.09% | 5.18% | 6.60% | 0.908 | 90.46% | 24.04% | 0.380 |
| **XGBoost Regressor (Tuned)** | **1.72%** | **2.38%** | **2.82%** | **0.981** | **87.94%** | **84.02%** | **0.859** |

---

## 2. Dynamic Routing & Capacitated VRP Optimization

### 2.1 Mathematical Formulation
The collection routing is modeled as a **Capacitated Vehicle Routing Problem (CVRP)** defined over an undirected graph $G = (V, E)$, where $V = \{0\} \cup V_c$:
- Vertex $0$: Central municipal depot / waste transfer station.
- Vertices $V_c = \{1, \dots, M\}$: Subset of candidate bins identified for collection based on priority score:
  $$\text{Priority}_i = 0.60 \times \hat{y}_{i, t+24} + 0.25 \times P(\text{Overflow}_i) + 0.15 \times \text{AreaWeight}_i$$
  where overflow probability is evaluated using the Gaussian error distribution:
  $$P(y_{i, t+24} \ge 80\%) = 1 - \Phi\left(\frac{80 - \hat{y}_{i, t+24}}{\text{RMSE}}\right)$$

### 2.2 Objective Function
Minimize total fleet travel distance subject to vehicle payload capacities:
$$\min \sum_{k \in K} \sum_{i \in V} \sum_{j \in V} c_{ij} x_{ijk}$$

**Subject to:**
1. **Visit Conservation:** $\sum_{k \in K} \sum_{j \in V} x_{ijk} = 1 \quad \forall i \in V_c$
2. **Depot Flow Balance:** $\sum_{j \in V_c} x_{0jk} = \sum_{i \in V_c} x_{i0k} \le 1 \quad \forall k \in K$
3. **Payload Capacity Constraint:** $\sum_{i \in V_c} q_i \sum_{j \in V} x_{ijk} \le Q_k \quad \forall k \in K$
4. **Subtour Elimination:** standard Miller-Tucker-Zemlin (MTZ) formulation.

### 2.3 Solver Performance Comparison
Benchmarked on 25 high-priority bins in Greater Hyderabad:

| Algorithm Rank | Solver Implementation | Total Distance | Execution Time | Fuel Burn | Efficiency vs Baseline |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **Rank #1** | **Google OR-Tools CVRP (Guided Local Search)** | **34.20 km** | **45.2 ms** | **10.26 L** | **+27.4%** |
| **Rank #2** | **Genetic Algorithm (GA - Order Crossover)** | 38.60 km | 112.0 ms | 11.58 L | +18.1% |
| **Rank #3** | **Simulated Annealing (Geometric Cooling)** | 41.00 km | 84.2 ms | 12.30 L | +12.9% |
| **Rank #4** | **Nearest Neighbor (Greedy Baseline)** | 47.10 km | 4.1 ms | 14.13 L | 0.0% (Baseline) |

---

## 3. Environmental & Financial Impact Accounting

### Carbon & Fuel Accounting Equations:
1. **Fuel Consumption Reduction:**
   $$\Delta \text{Fuel (Liters)} = \text{Fuel}_{\text{Fixed}} - \text{Fuel}_{\text{AI}} = (\text{Dist}_{\text{Fixed}} - \text{Dist}_{\text{AI}}) \times 0.285\text{ L/km}$$
2. **GHG Scope 1 CO₂ Offset:**
   $$\text{CO}_2\text{ Offset (kg)} = \Delta \text{Fuel (Liters)} \times 2.68\text{ kg CO}_2/\text{L diesel}$$
3. **Mature Tree Equivalent:**
   $$\text{Tree Equivalent} = \frac{\text{CO}_2\text{ Offset (kg)}}{21.77\text{ kg CO}_2/\text{tree-year}}$$
4. **Municipal Operating Cost Savings:**
   $$\text{Financial Savings (INR)} = \Delta \text{Fuel (Liters)} \times ₹98.50/\text{L diesel}$$
