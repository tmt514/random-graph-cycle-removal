all: bin/code

bin/code: src/code.cpp src/graph.cpp
	g++-12 -std=c++20 -O2 -c -o bin/graph.o src/graph.cpp
	g++-12 -std=c++20 -O2 bin/graph.o -o bin/code src/code.cpp

run: bin/code
	./bin/code

clear:
	rm bin/code
	rm bin/graph.o