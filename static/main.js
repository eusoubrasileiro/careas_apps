


var inputtext = document.getElementById("infile");
var outputtext = document.getElementById("outfile");
var divgraph = document.getElementById('bokeh_plot');
var fileUploader = document.getElementById('file-uploader');


    // sample input file
var sample_inputfile = 
`  -19°44'18''174 -44°17'41''703||
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
\zz-19°44'37''111 -44°17'41''703
-19°44'18''174 -44°17'41''703`;    
 

function onRefresh(){
  if(localStorage.getItem('inputtext') == null){ /* first time page loaded */
    inputtext.innerHTML = sample_inputfile;    
    localStorage.setItem('inputtext', sample_inputfile);
    ConvertnDraw(); // draw the initial graph and calculated output file
  }
  else{ /* refreshed by download or another action, just restore localStorage */
    inputtext.value = localStorage.getItem('inputtext');
    outputtext.value = localStorage.getItem('outputtext');
    if(divgraph.childElementCount == 0) /* no graph */
      ConvertnDraw(); // draw    
  }  
}

function ConvertnDraw() {
  // true == gtmpro or false == auto
  //var inputfmt = !document.getElementById('fmtgtmpro').checked; 

  fetch("/convert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(inputtext.value)
  })
  .then(resp => {
      if (resp.ok)
        resp.json().then(data => {
          if(data.result == 'success'){       
            console.log(data.json_item);                      
            //item = JSON.parse(data.json_item);        
            document.getElementById("bokeh_plot").innerHTML = "";
            Bokeh.embed.embed_item(data.json_item, "bokeh_plot"); // "bokeh_plot" target div id=bokeh_plot        
          }
          localStorage.setItem('outputtext', data.text); // save state of output text area
          outputtext.value = data.text;  // set outputfile text even with. error msg   
        });
    })
  .catch(err => {
    console.log("An error occured", err.message);
    window.alert("Oops! Something went wrong.");
  });
}


fileUploader.addEventListener('change', (event) => {
  const files = event.target.files;
  const file = files[0];
  console.log('files', files);

  let reader = new FileReader();
  reader.readAsText(file);

  reader.onload = function() {    
    localStorage.setItem('inputtext', reader.result); // save state of input text area
    inputtext.value = reader.result; 
    console.log(reader.result);    
  };
});


// download : resets only output form data to converted state of left size
function download(text){  
  // save state of text areas
  localStorage.setItem('inputtext', inputtext.value);
  localStorage.setItem('outputtext', text);  

  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', 'SIGAREAS.txt'); // filename 

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();
  document.body.removeChild(element);

}
