#include "graph.h"

Graph::Graph() {
  n = 0;
  edges = make_shared<vector<pair<int, int>>>();
}

void Graph::AddEdge(int u, int v) {
  edges->push_back({u, v});
}

void Graph::Init(const vector<int>& layers) {
  n = 0;
  edges->clear();
  vector<vector<int>> node_ids(layers.size());
  for(int i=0;i<layers.size();i++) {
    node_ids[i].resize(layers[i]);
    iota(node_ids[i].begin(), node_ids[i].end(), n);
    n += layers[i];
  }
  for(int i=1;i<layers.size();i++) {
    for(int x : node_ids[i-1])
      for(int y : node_ids[i])
        AddEdge(x, y);
  }
  AddEdge(0, n-1);
}

void Graph::Init(int n, double p, mt19937& rng) {
  assert(0.0 < p && p < 1.0);
  // must add 0, n-1;
  this-> n = n;
  edges->clear();
  for (int i = 0; i < n; i++)
    for (int j = i+1; j < n; j++) {
      if (i == 0 && j == n-1) AddEdge(i, j);
      else if (uniform_real_distribution<double>(0, 1)(rng) <= p) {
        AddEdge(i, j);
      }
    }
}

void Graph::PermuteEdges(mt19937& rng) {
  shuffle(edges->begin(), edges->end(), rng);
}


DynamicForest::DynamicForest(int n) {
  this->n = n;
  this->parent.resize(n);
  for(int i=0;i<n;i++) this->parent[i] = i;
}

int DynamicForest::FindRoot(int x) {
  while (x != parent[x]) x = parent[x];
  return x;
}

void DynamicForest::BecomeRoot(int x) {
  vector<int> l;
  while (x != parent[x]) {
    l.push_back(x);
    x = parent[x];
  }
  while (!l.empty()) {
    parent[x] = l.back();
    x = l.back();
    l.pop_back();
  }
  parent[x] = x;
}

void DynamicForest::AddEdge(int x, int y) {
  BecomeRoot(x);
  BecomeRoot(y);

  // fprintf(stderr, "Add Edge (%d, %d); find root = %d, %d\n", x, y, FindRoot(x), FindRoot(y));
  // Make sure that x and y are in different tree.
  assert(parent[x] == x);
  parent[x] = y;
}

void DynamicForest::RemovePath(int x, int y) {
  // fprintf(stderr, "Remove Path: (%d, %d)\n", x, y);
  BecomeRoot(x);
  while (parent[y] != y) {
    int tmp = parent[y];
    parent[y] = y;
    y = tmp;
  }
  // Make sure that x and y are in the same tree.
  assert(y == x);
}

int DynamicForest::FindDistance(int x, int y) {
  BecomeRoot(x);
  int t = 0;
  while (y != parent[y]) { ++t; y = parent[y]; }
  if (y == x) return t;
  return -1;
}

CycleRemovalSimulator::CycleRemovalSimulator(const Config& config, int seed) {
  this->config = config;
  this->graph = make_unique<Graph>();
  this->rng = make_shared<mt19937>(seed);

  if (config.simulation_type == LAYERED_GRAPH)
    this->graph->Init(config.layers);
  else if (config.simulation_type == GNP)
    this->graph->Init(config.n, config.p, *rng);
}

void CycleRemovalSimulator::Run() {
  printf("Simulator: will repeat for %d times.\n", config.repeat);
  int not_inf_count = 0;
  vector<double> finite_distances;
  for (int round = 0; round < config.repeat; round++) {
    
    auto forest = make_unique<DynamicForest>(graph->n);
    graph->PermuteEdges(*rng);
    // only simulate until the (0, n-1) edge is presented.
    for (int i = 0; i < (int)graph->edges->size(); i++) {
      auto [u, v] = graph->edges->at(i);
      // terminal condition
      if ((u == 0 && v == graph->n-1) || (u == graph->n-1 && v == 0)) {
        int dist = forest->FindDistance(u, v);

        if (dist != -1) {
          not_inf_count ++;
          double not_inf_ratio = not_inf_count / (double)(round + 1);
          printf("round(%d): phi(e) = %d, dist = %d [not-inf-ratio=%.5f]\n", round, i, dist, not_inf_ratio);
          finite_distances.push_back(dist);
        }
        
        break;
      }
      if (forest->FindRoot(u) != forest->FindRoot(v)) {
        forest->AddEdge(u, v);
      } else if (forest->FindDistance(u, v) <= config.allowed_cycle_length) {
        forest->RemovePath(u, v);
      } else {
        /* do nothing */
      }
    }
  }
  double not_inf_ratio = not_inf_count / (double)(config.repeat);
  double finite_avg = accumulate(finite_distances.begin(), finite_distances.end(), 0.0);
  if (finite_distances.size() > 0) finite_avg /= (double)finite_distances.size();
  printf("not-inf-ratio = %.5f, finite-avg = %.5f\n", not_inf_ratio, finite_avg);
}
