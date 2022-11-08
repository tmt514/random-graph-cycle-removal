#include <bits/stdc++.h>
#include "graph.h"
using namespace std;



int main(int argc, char *argv[]) {

  int N = 1000;
  vector<int> layers = {1, 99, 100, 100, 100, 100, 100, 100, 100, 100, 99, 1};

  Config config;
  config.simulation_type = LAYERED_GRAPH;
  config.layers = layers;
  config.repeat = 1000;
  
  auto simulator = make_unique<CycleRemovalSimulator>(config);
  simulator->Run();
  return 0;
}