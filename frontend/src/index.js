import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import { InputArea } from "./InputArea";
import { OutputArea } from "./OutputArea";
import { Tooltip, Popover} from 'bootstrap'; // dont need to import in index.html
// could import only 'bootstrap/js/dist/tooltip.js' but would have to eject
import Bokeh from '@bokeh/bokehjs/build/js/bokeh.esm.min.js';
import './index.css';

class PlotArea extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      loading: true      
    };
  }  

  setLoading(value){
    this.setState({'loading' : value});
  }

  render() {
    return (
      <div id="plot-area">  
        <div className="spinner-border" role="status" hidden={!this.state.loading}>
          <span className="visually-hidden">Loading...</span>
        </div> 
        <div id="bokeh_plot" hidden={this.state.loading}>
        </div>   
      </div>
    )
  } 
  
}

// remember 'class' should be replaced by 'className' in JSX 'here'
class App extends Component {
  constructor(props) {
    super(props);
    this.formref = React.createRef(); // reference to form
    this.outputarea = React.createRef(); // reference to the DOM output text area 
    this.plotarea = React.createRef();
  }   

  FlaskConvert(e){
    e.preventDefault() // prevent reloading the page
    //console.log(formref.current)
    const data = new URLSearchParams();
    for (const pair of new FormData(this.formref.current)) {
        data.append(pair[0], pair[1]);
    }
    this.plotarea.current.setLoading(true); // set loading spinner
    fetch('/flask/convert', 
      {
        method: 'post',
        body: data        
      }
    ).then(response => response.json().then(data => {
          this.outputarea.current.setState({'textarea':data['data']});
          if(data['status']) // if succeeded
            this.PlotGraph();   
          else // if did not put back the previous plot
            this.plotarea.current.setLoading(false);
      }) 
    )   
  }

  PlotGraph(){
    fetch('/flask/plot', 
      {
        method: 'post',
        body: ''  
      }
    ).then(response => response.json().then(data => {         
        const myNode = document.getElementById("bokeh_plot");
        myNode.replaceChildren(); // clean previous plot
        Bokeh.embed.embed_item(data, "bokeh_plot");            
        this.plotarea.current.setLoading(false);
      }) 
    )      
  }

  // after App rendered 
  // react : componentDidMount -> classes | useEffect for functions
  // examples here https://www.codeply.com/p/IdzoX6osI2
  // https://dev.to/codeply/is-bootstrap-5-react-worthy-4493
  componentDidMount() { // instead of
    // Load all ToolTips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(
      function (tooltipTriggerEl) { 
        return new Tooltip(tooltipTriggerEl)
      }
    )   
    // Load all Popover
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
      return new Popover(popoverTriggerEl)
    })     
    // Load the first Plot    
    document.getElementById('btn-convert').click();
  }

  render(){
    return (        
      <div className="d-flex flex-column min-vh-100">      
      <div className="container" id="main-container">  
        <h2>Converte formato memorial</h2>
          <form method="post" encType="multipart/form-data" ref={this.formref}>                   
              <div className="row">    
                <div className="col">
                  <InputArea onSubmit={(e)=>this.FlaskConvert(e)}/>
                </div>
                <div className="col">        
                  <OutputArea ref={this.outputarea}/>
                </div>            
                <div className="col">                           
                  <PlotArea ref={this.plotarea}/>
                </div>      
              </div>
          </form>                     
      </div>           
      </div>    
    )
  }
}

// ========================================
 
ReactDOM.render(<App/>, document.getElementById("root-app"));



  


  