import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"


class DynamicTree {
  constructor(_n) {
    this.n = _n;
    this.g = Array.from(Array(this.n).keys());
  }
  findRoot(x) {
    while(this.g[x] !== x) x = this.g[x];
    return x;
  }
  exposeRoot(x) {
    var p = [];
    while(this.g[x] !== x) {
      p.push(x);
      x = this.g[x];
    }
    while (p.length > 0) {
      this.g[x] = p[p.length-1];
      x = p[p.length-1];
      p.pop();
    }
    this.g[x] = x;
  }
  connectEdge(u, v) {
    this.exposeRoot(u);
    this.exposeRoot(v);
    this.g[u] = v;
  }
  findDistance(u, v) {
    this.exposeRoot(u);
    var dist = 1;
    while (v !== u) {
      dist++;
      v = this.g[v];
    }
    return dist;
  }
  removePath(u, v) {
    this.exposeRoot(u);
    while (v !== u) {
      var tmp = this.g[v];
      this.g[v] = v;
      v = tmp;
    }
  }
}

class Simulator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
      seq: 0,
      trials: 0,
      conn_count: 0,
      downdegree: 101,
      sum_finite_dist: 0,
      num_layers: 10,
      allowed_cycle_length: 10,
      smallcyclesdetected: 0,
      shuffleEdgesBeforeStart: true,
    };
    this.numLayersInput = React.createRef();
    this.shouldReset = false;
    this.layers = [];
    this.edgeList = [];
  }

  componentDidMount() {
    setTimeout(() => this.prepareAndStartSimulation(), 50);
  }

  componentWillUnmount() {
  }

  addTrialResult(conn, dist) {
    var currentState = {...this.state};
    currentState.trials += 1;
    currentState.conn_count += conn;
    currentState.sum_finite_dist += dist;
    if (conn === 1) console.log(dist, currentState.sum_finite_dist);
    this.setState(currentState, () => {
      setTimeout(() => this.run(), 10);
    });
  }

  resetTrialResult(callback) {
    var currentState = {...this.state};
    currentState.trials = 0;
    currentState.conn_count = 0;
    currentState.sum_finite_dist = 0;
    currentState.seq += 1;
    this.setState(currentState, callback);
  }

  updateLayers() {
    this.shouldReset = true;
    var state = {...this.state};
    state.num_layers = this.numLayersInput.current.value;
    console.log("Set layers to be " + state.num_layers);
    this.setState(state);
    setTimeout(() => this.prepareAndStartSimulation(), 50);
  }

  render() {
    return (
      <div>
        <h2>Simulation Result:</h2>
        <div style={{padding: "10px", backgroundColor: "#EEE"}}>
        Number Layers: <input id="num_layers" defaultValue={10} ref={this.numLayersInput} onChange={this.updateLayers.bind(this)} /><br />
        </div>
        <p>
        Graph size: {this.n} vertices.<br />
        Edge List Length: {this.edgeList !== undefined? this.edgeList.length: 0} <br />
        Layers: {this.layers !== undefined? this.layers.length-2 : 0}.<br />
        Cycle Length: {this.L}.<br />
        Number of Simulations: {this.state.trials}<br />
        Connected: {this.state.conn_count}/{this.state.trials} ({(this.state.conn_count/this.state.trials*100).toFixed(2)}%)<br />
        Avg Finite Dist: {this.state.sum_finite_dist/this.state.conn_count}</p>
        </div>
    );
  }

  prepareAndStartSimulation() {
    this.n = 0;
    this.L = this.state.allowed_cycle_length;
    this.layers = [1];
    for (var i = 0; i < this.state.num_layers; i++)
      this.layers.push(100);
    this.layers.push(1);
    this.edgeList = [];
    for (var i = 0; i+1 < this.layers.length; i++) {
      var le=0, re=0;
      le = this.n;
      re = this.n + this.layers[i];
      this.n += this.layers[i];
      
      if (i !== 0 && i+1 !== this.layers.length-1 && this.layers[i+1] >= this.state.downdegree) {
        var arr = [];
        for(var y=0;y<this.layers[i+1];y++) arr.push(re+y);

        for(var x=0;x<this.layers[i];x++) {
          for(var cidx = 0; cidx < this.state.downdegree; cidx++) {
            var ridx = Math.floor(Math.random() * (arr.length - cidx)) + cidx;
            [arr[cidx], arr[ridx]] = [arr[ridx], arr[cidx]];
            this.edgeList.push([le+x, arr[cidx]]);
          }
        }
      } else {
      for(var x=0;x<this.layers[i];x++)
        for(var y=0;y<this.layers[i+1];y++)
        this.edgeList.push([le+x, re+y]);
      }
    }
    if (this.state.shuffleEdgesBeforeStart)
    for(var cidx = 0; cidx < this.edgeList.length; cidx++) {
      var ridx = Math.floor(Math.random() * (this.edgeList.length - cidx)) + cidx;
      [this.edgeList[cidx], this.edgeList[ridx]] = 
      [this.edgeList[ridx], this.edgeList[cidx]];
    }
    this.n += this.layers[this.layers.length - 1];
    this.shouldReset = false;
    this.resetTrialResult(() => {
      setTimeout(() => this.run(), 10);
    });
  }

  run() {

    if (this.shouldReset === true) {
      return;
    }

    // target edge (0, n-1)
    var tree = new DynamicTree(this.n);
    for (var e of this.edgeList) {
      var x = e[0], y = e[1];
      if (Math.random() <= 0.5) continue;
      if (tree.findRoot(x) !== tree.findRoot(y)) {
        tree.connectEdge(x, y);
      } else if (tree.findDistance(x, y) <= this.L) {
        tree.removePath(x, y);
      }
    }
    if (tree.findRoot(0) === tree.findRoot(this.n-1)) {
      this.addTrialResult(1, tree.findDistance(0, this.n-1));
    } else {
      this.addTrialResult(0, 0);
    }
    
  }
}

const SecondPage = () => (
  <Layout>
    <h1>Hi from the second page</h1>
    <p>Welcome to page 2</p>
    <Simulator></Simulator>
    <Link to="/">Go back to the homepage</Link>
  </Layout>
)

export const Head = () => <Seo title="Page two" />

export default SecondPage
