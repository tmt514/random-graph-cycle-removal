#include <bits/stdc++.h>
using namespace std;

enum SimulationType {
  GNP,
  LAYERED_GRAPH,
};

class Config {
  public:
  SimulationType simulation_type;
  vector<int> layers;
  double p;
  int repeat;
};

class Graph {
  public:
  int n;
  shared_ptr<vector<pair<int, int>>> edges;
  void AddEdge(int u, int v);

  Graph();
  void Init(const vector<int>& layers);
  void PermuteEdges(mt19937 &rng);
  // void Init(int n);
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

  CycleRemovalSimulator(const Config& config);
  void Run(int seed = 514);
};