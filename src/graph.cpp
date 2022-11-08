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

CycleRemovalSimulator::CycleRemovalSimulator(const Config& config) {
  this->config = config;
  this->graph = make_unique<Graph>();
  this->graph->Init(config.layers);
}

void CycleRemovalSimulator::Run(int seed) {
  mt19937 rng(seed);
  printf("Simulator: will repeat for %d times.\n", config.repeat);
  int not_inf_count = 0;
  for (int round = 0; round < config.repeat; round++) {
    
    auto forest = make_unique<DynamicForest>(graph->n);
    graph->PermuteEdges(rng);
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
        }
        
        break;
      }
      if (forest->FindRoot(u) != forest->FindRoot(v)) {
        forest->AddEdge(u, v);
      } else {
        forest->RemovePath(u, v);
      }
    }
  }
  double not_inf_ratio = not_inf_count / (double)(config.repeat);
  printf("not-inf-ratio = %.5f\n", not_inf_ratio);
}