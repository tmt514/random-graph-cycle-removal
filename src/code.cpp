#include <bits/stdc++.h>
#include "graph.h"
using namespace std;



int main(int argc, char *argv[]) {

  // int N = 1000;
  vector<int> layers = {1, 99, 100, 100, 100, 100, 100, 100, 100, 100, 99, 1};
  
  // int N = 80, L = 20;
  // vector<int> layers;
  // layers.push_back(1);
  // for (int i=0;i<L;i++) layers.push_back(N);
  // layers.push_back(1);

  Config config;
  config.simulation_type = LAYERED_CONSTANT_DEGREE_GRAPH;
  config.downdeg = 10;
  config.layers = layers;
  config.repeat = 1000;
  config.allowed_cycle_length = 10;

  // Config config;
  // config.simulation_type = GNP;
  // config.n = 1000;
  // config.p = 0.9;
  // config.repeat = 1000;
  // config.allowed_cycle_length = 20;
  
  auto simulator = make_unique<CycleRemovalSimulator>(config);
  simulator->RunRandomEliminateEdges(0.5);
  return 0;
}