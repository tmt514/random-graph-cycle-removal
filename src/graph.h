#include <bits/stdc++.h>
using namespace std;

enum SimulationType {
  GNP,
  LAYERED_GRAPH,
};

class Config {
  public:
  SimulationType simulation_type;
  int repeat;
  int allowed_cycle_length;

  // used only in LAYERED_GRAPH mode
  vector<int> layers;

  // used only in GNP mode
  int n;
  double p;
  
};

class Graph {
  public:
  int n;
  shared_ptr<vector<pair<int, int>>> edges;
  void AddEdge(int u, int v);

  Graph();
  void Init(const vector<int>& layers);
  void PermuteEdges(mt19937 &rng);
  void Init(int n, double p, mt19937 &rng);
};

class DynamicForest {
  public:
  int n;
  vector<int> parent;

  DynamicForest(int n);
  int FindRoot(int x);
  void BecomeRoot(int x);
  void AddEdge(int x, int y);
  void RemovePath(int x, int y);
  int FindDistance(int x, int y);
};



class CycleRemovalSimulator {
  public:
  Config config;
  unique_ptr<Graph> graph;
  shared_ptr<mt19937> rng;

  CycleRemovalSimulator(const Config& config, int seed = 514);
  void Run();
};