import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { useState, useEffect } from 'react';
import InputArea from "./InputArea";
import OutputArea from "./OutputArea";
import { Tooltip, Popover} from 'bootstrap'; // dont need to import in index.html
// could import only 'bootstrap/js/dist/tooltip.js' but would have to eject
import Plot from 'react-plotly.js';
import reportWebVitals from './reportWebVitals';


function PlotArea({loading_state, plotData}){

  function PlotData() {
    if (!plotData) {
      return <></>;
    }
    return (
      <div id="plotly_figure" hidden={loading_state}>
      <Plot data={plotData['data']} layout={plotData['layout']} />
      </div>
    );
  }

  return (
    <div id="plot-area">
      <div className="spinner-border" role="status" hidden={!loading_state}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <PlotData />
    </div>
  );

}



export default function App() {
  const [outputtext, setOutputText] = useState('carregando...');
  const [loading, setLoading] = useState(true);
  const [plotdata, setPlotData] = useState(null);

  function clickConvert(){
    document.getElementById('btn-convert').click();
  }

  function ConvertInputButton(e) {
    if(e){
      e.preventDefault(); // prevent reloading the page      
      const formData = new FormData(e.target.closest('form')); // Access form data from event object
      const data = new URLSearchParams(formData); // Convert FormData to URLSearchParams      
      for (const pair of formData) {
        data.append(pair[0], pair[1]);
      }
      setLoading(true); // set loading spinner
      fetch('/flask/convert', {
        method: 'post',
        body: data
      }).then(response => response.json().then(data => {
        setOutputText(data['data']);
        if (data['status']) // if succeeded
          PlotGraph();
        else // if did not put back the previous plot
          setLoading(false);
      })).catch((error) => {
        setOutputText("Error connecting to backend server - error: " + toString(error));
      });
    }
  }

  function PlotGraph(){
    fetch('/flask/plot', {
      method: 'post',
      body: ''
    }).then(response => response.json().then(data => {
      setLoading(false);
      setPlotData(data);      
    })).catch((error) => {
      setOutputText( "Error connecting to backend server - error: " + toString(error) );
    });
  }


  useEffect(() => {
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
    clickConvert();
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="container" id="main-container">
        <h2>Converte formato memorial</h2>
        <form method="post" encType="multipart/form-data" >
          <div className="row">
            <div className="col">
              <InputArea onSubmit={(e) => ConvertInputButton(e)} />
            </div>
            <div className="col">
              <OutputArea textarea={outputtext} radioChanged={ () => clickConvert() }/>
            </div>
            <div className="col">
              <PlotArea loading_state={loading} plotData={plotdata} />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


// ========================================
 
const root = ReactDOM.createRoot(document.getElementById('root-app'));
root.render(<App/>);

  
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);


  