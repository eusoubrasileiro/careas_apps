
function OutputOptions({RadioChanged}){  

  const handleChange = (e) => {
    if (!RadioChanged) return;    
    RadioChanged();    
  };

  return (   
    <>
    <label className="form-check-label">Formato Saída</label>
    <div className="form-check form-check-inline">
      <input type="radio" className="form-check-input" id="radio1" value="sigareas" 
      onChange={handleChange} name='output_format' defaultChecked/>
      <label className="form-check-label" htmlFor="radio1">sigareas</label>   
    </div>
    <div className="form-check form-check-inline">
      <input type="radio" className="form-check-input" id="radio2" value="gtmpro" 
      onChange={handleChange} name='output_format'/>
      <label className="form-check-label" htmlFor="radio2">gtmpro</label>
    </div>    
    <div className="form-check form-check-inline">
      <input type="radio" className="form-check-input" id="radio3" value="ddegree" 
      onChange={handleChange} name='output_format'/>
      <label className="form-check-label" htmlFor="radio3">ddegree</label>
    </div>  
    </> 
  )    
}

function OutTextArea({text}){
  return (        
      <textarea className="form-control" rows="20" name="output_text" wrap="off"
      value={text}
      readOnly/>                            
  );      
}

function OutputArea({textarea, radioChanged}){  

  const downloadTxtFile = (e) => {
    e.preventDefault();
    const element = document.createElement("a");
    const file = new Blob([textarea], {type: 'text/csv'});
    element.href = URL.createObjectURL(file);
    element.download = "SIGAREAS.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  return (
    <div className="row">
    <div className="col">                    
      <OutputOptions RadioChanged={radioChanged}/>          
      <OutTextArea text={textarea} />
      <button type="button" className="btn btn-primary" 
        onClick={(e) => downloadTxtFile(e)}>Download</button>        
    </div>
  </div>
  );
}


  export default OutputArea;