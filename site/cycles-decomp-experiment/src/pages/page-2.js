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
      sum_finite_dist: 0,
      num_layers: 10,
      allowed_cycle_length: 10,
      smallcyclesdetected: 0,
      shuffleEdgesBeforeStart: true,
      
      graph_type: "layered_complete_bipartite",
      // for "layered_complete_bipartite"
      layer_width: 100,
      downdegree: 101,
      // for "square_grid",
      grid_width: 100,
    };
    this.numLayersInput = React.createRef();
    this.cycleLengthInput = React.createRef();
    
    this.shouldReset = true;
    this.layers = [];
    this.edgeList = [];
  }

  componentDidMount() {
    setTimeout(this.prepareAndStartSimulation.bind(this), 50);
  }

  componentWillUnmount() {
  }

  addTrialResult(conn, dist, callback) {
    var currentState = {...this.state};
    currentState.trials += 1;
    currentState.conn_count += conn;
    currentState.sum_finite_dist += dist;
    // if (conn === 1) console.log(dist, currentState.sum_finite_dist);
    this.setState(currentState, () => setTimeout(callback, 10));
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
    this.setState(state, this.prepareAndStartSimulation.bind(this));
  }

  updateCycleLength() {
    this.shouldReset = true;
    var state = {...this.state};
    state.allowed_cycle_length = this.cycleLengthInput.current.value;
    this.setState(state, this.prepareAndStartSimulation.bind(this));
  }

  updateShuffleEdges(event) {
    this.shouldReset = true;
    var state = {...this.state};
    state.shuffleEdgesBeforeStart = (event.target.value === "true");
    this.setState(state, this.prepareAndStartSimulation.bind(this));
  }

  onChangeGraphType(event) {
    this.shouldReset = true;
    var val = event.target.value;
    val = val.replace(/\s+/g, '');
    var state = {...this.state};
    var changed = false;
    if (val === "layered_complete_bipartite") {
      state.graph_type = val;
      changed = true;
    } else if (val === "square_grid") {
      state.graph_type = val;
      changed = true;
    }
    
    if (changed) {
      console.log("Change Graph Type to ", val);
      this.setState(state, this.prepareAndStartSimulation.bind(this));
    }
  }
  onChangeLayerBipartite(event) {
    this.shouldReset = true;
    var val = parseInt(event.target.value);
    console.log(val);
    var state = {...this.state};
    state.layer_width = val;

    this.setState(state, this.prepareAndStartSimulation.bind(this));
  }
  onChangeDownDegree(event) {
    this.shouldReset = true;
    var val = parseInt(event.target.value);
    console.log(val);
    var state = {...this.state};
    state.downdegree = val;

    this.setState(state, this.prepareAndStartSimulation.bind(this));
  }
  

  onChangeGridWidth(event) {
    this.shouldReset = true;
    var val = parseInt(event.target.value);
    var state = {...this.state};
    state.grid_width = val;
    
    this.setState(state, this.prepareAndStartSimulation.bind(this));
  }
    // <div>
    //           <label>
    //             <input type="radio"
    //             value="square_grid"
    //             defaultChecked={this.state.graph_type === "square_grid"}
    //             name="graph_type"
    //             /> Square Grid
    //           </label>
    //           (Grid Width: <input defaultValue={100} onChange={this.onChangeGridWidth.bind(this)} 
    //           disabled={this.state.graph_type !== "square_grid"}
    //           />)
    //         </div>


  render() {
    return (
      <div>
        <h2>Simulation Result:</h2>
        <div style={{padding: "10px", backgroundColor: "#EEE"}}>
          <fieldset onChange={this.onChangeGraphType.bind(this)}>
            <legend>Graph Type</legend>
            <div>
              <label>
                <input type="radio"
                value="layered_complete_bipartite"
                defaultChecked={this.state.graph_type === "layered_complete_bipartite"} 
                name="graph_type"
                /> Layered Complete Bipartite 
              </label>
              <div style={{paddingLeft: "40pt"}}>
              Layer Width: <input defaultValue={100} onChange={this.onChangeLayerBipartite.bind(this)} disabled={this.state.graph_type !== "layered_complete_bipartite"} />
              </div>
              <div style={{paddingLeft: "40pt"}}>
              Random Down Degree: <input defaultValue={101} onChange={this.onChangeDownDegree.bind(this)} disabled={this.state.graph_type !== "layered_complete_bipartite"} />
              </div>
              <div style={{paddingLeft: "40pt"}}>
              Number Layers: <input id="num_layers" defaultValue={10} ref={this.numLayersInput} onChange={this.updateLayers.bind(this)} />
              </div>
            </div>
          </fieldset>

        
        Cycle Length: <input id="cycle_length" defaultValue={10} ref={this.cycleLengthInput} onChange={this.updateCycleLength.bind(this)} /><br />
        <div onChange={this.updateShuffleEdges.bind(this)}>
          <input type="radio" id="shuffle_edges_true" value="true" name="shuffle_edges"
          defaultChecked={this.state.shuffleEdgesBeforeStart} /><label htmlFor="shuffle_edges_true"> Shuffle Edge</label>
          <input type="radio" value="false"
          name="shuffle_edges"  id="shuffle_edges_false" 
          defaultChecked={this.state.shuffleEdgesBeforeStart === false}
          /><label htmlFor="shuffle_edges_false"> No Shuffle</label>
        </div>
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
    if (this.shouldReset === false) return;

    this.L = this.state.allowed_cycle_length;

    if (this.state.graph_type === "layered_complete_bipartite") {
      this.n = 0;
      this.layers = [1];
      for (var i = 0; i < this.state.num_layers; i++)
        this.layers.push(this.state.layer_width);
      this.layers.push(1);
      this.edgeList = [];

      // add estimate.
      var edge_list_estimate = 0;
      for (var i = 0; i+1 < this.layers.length; i++) {
        edge_list_estimate += this.layers[i] * Math.min(this.state.downdegree, this.layers[i+1]);
      }
      if (edge_list_estimate >= 1000000) {
        console.error("Too many edges!");
        return;
      }

      for (var i = 0; i+1 < this.layers.length; i++) {
        var le=0, re=0;
        le = this.n;
        re = this.n + this.layers[i];
        this.n += this.layers[i];
        
        if (i !== 0 && i+1 !== this.layers.length-1 && this.layers[i+1] >= this.state.downdegree) {
          var arr = [];
          for(var y=0;y<this.layers[i+1];y++) arr.push(re+y);

          for(var x=0;x<this.layers[i];x++) {
            var nbrs = [];
            for(var cidx = 0; cidx < this.state.downdegree; cidx++) {
              var ridx = Math.floor(Math.random() * (arr.length - cidx)) + cidx;
              [arr[cidx], arr[ridx]] = [arr[ridx], arr[cidx]];
              nbrs.push(arr[cidx]);
              // this.edgeList.push([le+x, arr[cidx]]);
            }
            nbrs.sort();
            for(var v of nbrs) {
              this.edgeList.push([le+x, v]);
            }
          }
        } else {
        for(var x=0;x<this.layers[i];x++)
          for(var y=0;y<this.layers[i+1];y++)
          this.edgeList.push([le+x, re+y]);
        }
      }
      
      this.n += this.layers[this.layers.length - 1];
    } else if (this.state.graph_type === "square_grid") {

      var side = parseInt(this.state.grid_width);

      this.n = side * side;
      this.edgeList = [];

      var enc = (i, j) => i*side+j;

      for (var i = 0; i < side; i++) {
        for (var j = 0; j < side; j++) {
          if (j+1 < side)
            this.edgeList.push([enc(i, j), enc(i, j+1)]);
          if (i+1 < side)
            this.edgeList.push([enc(i, j), enc(i+1, j)]);
        }
      }

    }

    // shuffle edge
    if (this.state.shuffleEdgesBeforeStart)
      for(var cidx = 0; cidx < this.edgeList.length; cidx++) {
        var ridx = Math.floor(Math.random() * (this.edgeList.length - cidx)) + cidx;
        [this.edgeList[cidx], this.edgeList[ridx]] = 
        [this.edgeList[ridx], this.edgeList[cidx]];
      }

    this.shouldReset = false;
    this.resetTrialResult(((seq) => this.run(seq)).bind(this, this.state.seq+1));
  }

  run(seq) {
    console.log("seq=", seq, " state=", this.state.seq);
    if (this.shouldReset === true) {
      return;
    }
    if (seq !== this.state.seq) {
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
      this.addTrialResult(1, tree.findDistance(0, this.n-1), this.run.bind(this, seq));
    } else {
      this.addTrialResult(0, 0, this.run.bind(this, seq));
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
