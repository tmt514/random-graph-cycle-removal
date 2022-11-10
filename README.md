# Experiments to Cycle Decomposition

```
$ make
$ make run
```

## Exp 1: Layered Graphs

* 10 layers and repeat 1000 times (default seed).

```cpp
vector<int> layers = {1, 99, 100, 100, 100, 100, 100, 100, 100, 100, 99, 1};
config.repeat = 1000;
```

Result:

```
not-inf-ratio = 0.01700, finite-avg = 27.00000
```

* 20 layers; each layer 80 vertices; repeat 1000 times (default seed).

```
not-inf-ratio = 0.00100, finite-avg = 55.00000
```


## Exp 2: GNP Graph

* n = 1000, p = 0.5

```
not-inf-ratio = 0.05800, finite-avg = 17.36207
```

* n = 1000, p = 0.3

```
not-inf-ratio = 0.05400, finite-avg = 18.40741
```

* n = 1000, p = 0.1

```
not-inf-ratio = 0.05300, finite-avg = 17.32075
```

* n = 1000, p = 0.9

```
not-inf-ratio = 0.06400, finite-avg = 16.23438
```

## Exp 3: Random Eliminating Edges with a Fixed Permutation

* add edges according to each layer -> always disconnected.

* shuffle edges randomly then random eliminate w.p. 0.5 ->

```
n = 1000, L = 10, 10 layers.
not-inf-ratio = 0.44600, finite-avg = 43.53812
```

* random layered constant degree graph
