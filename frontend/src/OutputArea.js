import React, { Component } from 'react';

function OutputOptions(props){  
  return (   
    <>
    <label className="form-check-label">Formato Saída</label>
    <div className="form-check form-check-inline">
      <input type="radio" className="form-check-input" id="radio1" value="sigareas" name={props.name} defaultChecked/>
      <label className="form-check-label" htmlFor="radio1">sigareas</label>   
    </div>
    <div className="form-check form-check-inline">
      <input type="radio" className="form-check-input" id="radio2" value="gtmpro" name={props.name}/>
      <label className="form-check-label" htmlFor="radio2">gtmpro</label>
    </div>    
    <div className="form-check form-check-inline">
      <input type="radio" className="form-check-input" id="radio3" value="ddegree" name={props.name}/>
      <label className="form-check-label" htmlFor="radio3">ddegree</label>
    </div>  
    </> 
  )    
}

function OutTextArea(props){
  return (        
      <textarea className="form-control" rows="20" name="output_text" wrap="off"
      value={props.value}
      readOnly/>                            
  );      
}

class OutputArea extends Component {
  constructor(props) {
    super(props);
    this.state = { // we save the state of the child 'we care' here
      textarea: 'carregando...'
    };
  }  
  
  downloadTxtFile(e){ // ugly js for download 
    e.preventDefault()
    const element = document.createElement("a");
    console.log(this.outarea);
    const file = new Blob([this.state.textarea], {type: 'text/csv'});
    element.href = URL.createObjectURL(file);
    element.download = "SIGAREAS.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  }  

  render(){
    return (    
        <div className="row">
          <div className="col">                    
            <OutputOptions name='output_format'/>          
            <OutTextArea value={this.state.textarea} />
            <button type="button" className="btn btn-primary" 
              onClick={(e) => this.downloadTxtFile(e)}>Download</button>        
          </div>
        </div>
    )
  }
}

  export { OutputArea }