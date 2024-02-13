import React, { Component } from 'react';
// import Tooltip from 'bootstrap';

// const tooltips = new Map([
//   ["rumos-v", "Aproxima latitude/longitude para rumos verdadeiros (NSEW)"],
//   ["scm", "grau° minuto' segundo'' milisegundos (Cadatro Mineiro)"],
//   ["gtmpro", "grau° minuto' segundo.decimal'' (TrackMaker)"],  
// ]);

function InputOptions(){
  // dont need to save states for a form that already store its states
  // except for checkbox
    const [rumos_v, setRumosv] = React.useState(true);
  // Tooltips should be better or cleaner using a react context (TODO)
    return (         
    <div> 
        <label className="form-check-label">Formato Entrada</label>
        <a href="#" className="text-decoration-none" data-bs-toggle="tooltip" 
        data-bs-original-title="grau° minuto' segundo'' milisegundos (Cadatro Mineiro)">
          <div className="form-check form-check-inline">
            <input type="radio" className="form-check-input" id="radio1" value="scm" name="input_format" defaultChecked/>
            <label className="form-check-label" htmlFor="radio1">scm</label>   
          </div>
        </a>
        <a href="#" className="text-decoration-none" data-bs-toggle="tooltip" 
        data-bs-original-title="grau° minuto' segundo.decimal'' (TrackMaker)">
          <div className="form-check form-check-inline">        
            <input type="radio" className="form-check-input" id="radio2" value="gtmpro" name="input_format" />
            <label className="form-check-label" htmlFor="radio2">gtmpro</label>
          </div>      
        </a>
        <a href="#" className="text-decoration-none" data-bs-toggle="tooltip" 
        data-bs-original-title="Aproxima latitude/longitude para rumos verdadeiros (NSEW)"> 
          <div className="form-check form-check-inline">               
            <input type="checkbox" className="form-check-input" id="check1" name="rumos-v" 
            onChange={() => setRumosv(!rumos_v)} checked={rumos_v}/>
            <label className="form-check-label" htmlFor="check1">rumos-v</label>        
          </div>      
        </a>
    </div>                    
    )    
  }
  
  function InputTextArea(props){
    return (        
        <textarea className="form-control" rows="20" name="input_text" wrap="off"
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)} />                            
    );        
  }
  
  function FileInput(props){   
    function handleFile(event) {
      var file = event.target.files[0];
      var reader = new FileReader();
      // when file has finished read, call this with the text result (event.target.result)
      reader.onload = (event) => props.onLoaded(event.target.result);
      reader.readAsText(file);
    }  
    return (
      <input type="file" className="form-control" onChange={(event) =>handleFile(event)} />      
    )
  }
  
  // <a href="#" className="text-decoration-none" data-bs-toggle="tooltip" data-bs-original-title="Some tooltip text!">
function QuestionIconSvg(){
  return (   
    <a className="d-inline-block" tabIndex="0" data-bs-toggle="popover" data-bs-trigger="click hover"
      title="Rumos verdadeiros" data-bs-html="true"
      data-bs-content="Latitudes ou longitudes com distância geodésica menor que a máxima aqui especificada são aproximadas. <br/>(Elipsoide SIRGAS 2000)">    
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-question-circle-fill" viewBox="0 0 16 16">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247zm2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z">         
        </path>
      </svg>
    </a>
  )
}

  function MoreOptions(props){
    return ( 
      <>        
      <button className="btn btn-outline-secondary btn-sm" type="button" data-bs-toggle="collapse" 
      data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
        Mais opções
      </button>
      <div className="collapse" id="collapseExample">
        <div className="input-group input-group-sm mb3" style={{"width":"80%"}}>      
          <span className="input-group-text"><b>rumos-v</b>erdadeiros tolerância</span>      
          <input type="number" className="form-control" min="0" 
            onChange={(e) => props.onChange(e.target.value)}
            name="rumos_v_tol" value={props.value}/>                                                  
          <span className="input-group-text">m</span>           
          <QuestionIconSvg/>          
        </div> 
      </div>
      </> 
    )
  }
  
var sample_file = `-19°44'18''174 -44°17'41''703||
-19;44;;18''174 -44°17'45''410
xxxx -19°44'16''507 -44°17'45''410
-19°44'16''507   -44°17'52''079
-19°44'18''280 -44°17'52''079
-19°44'18|280 -44°17'53''625
-19°44'20''015 -44°17'53''625
-19°44,20'zz015 -44°17'54@@984
-19°44'22''531 -44°17'54''984
-19°44'22''531  zz-44°18'09''003
-19°44xx30''662 -44°18'09''003
-19°44'30''662 -44°18'19''307
-19°44,,37''111 -44°18'19''307
z-19°44'37''111 -44°17'41''703
-19°44'18''174 -44°17'41''703`;
  
  class InputArea extends Component {
    constructor(props) {
      super(props);
      this.state = { // we save the state of the child 'we care' here
        textarea: sample_file,
        rumos_v_tol: 0.5
      };
      this.onSubmit = props.onSubmit;
    }      
    // to update its text when a file is uploaded
    fileUploaded(text){
        this.setState({'textarea' : text });
    }
    render (){
      return (
          <>
            <div className="row">  
              <div className="col">
                <InputOptions/>                    
                <InputTextArea value={this.state.textarea} 
                  onChange={(value) => this.setState({'textarea' : value})}/>                                               
              </div>        
            </div>
            <div className="row">
              <div className="col-sm-4">
                <button type="submit" className="btn btn-primary" id="btn-convert"
                  onClick={(e) => this.onSubmit(e)}>
                    Converter
                </button>  
              </div> 
              <div className="col-sm-8">
                <FileInput onLoaded={ (text) => this.fileUploaded(text)}/>       
              </div> 
            </div>   
            <div className="col">
            <MoreOptions value={this.state.rumos_v_tol}  
                onChange={(value) => this.setState({'rumos_v_tol' : value})}/>                
            </div>                            
            
          </>
      )
    }
  }

  export { InputArea }