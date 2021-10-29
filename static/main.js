
var intext = document.getElementById("infile");
var outext = document.getElementById("outfile");

function onLoad(){
    // sample input file
    intext.value =
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
    outext.value = 
`-;019;44;18;174;-;044;17;41;703
-;019;44;18;174;-;044;17;45;410
-;019;44;16;507;-;044;17;45;410
-;019;44;16;507;-;044;17;52;079
-;019;44;18;280;-;044;17;52;079
-;019;44;18;280;-;044;17;53;625
-;019;44;20;015;-;044;17;53;625
-;019;44;20;015;-;044;17;54;984
-;019;44;22;531;-;044;17;54;984
-;019;44;22;531;-;044;18;09;003
-;019;44;30;662;-;044;18;09;003
-;019;44;30;662;-;044;18;19;307
-;019;44;37;111;-;044;18;19;307
-;019;44;37;111;-;044;17;41;703
-;019;44;18;174;-;044;17;41;703`;
}

function setOuput(outfile){
    outext.value = outfile.text
  }

function convert() {
    fetch("/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(intext.value)
    })
    .then(resp => {
        if (resp.ok)
          resp.json().then(data => {
            setOuput(data);
          });
      })
    .catch(err => {
    console.log("An error occured", err.message);
    window.alert("Oops! Something went wrong.");
    });
  }

const fileUploader = document.getElementById('file-uploader');

fileUploader.addEventListener('change', (event) => {
  const files = event.target.files;
  const file = files[0];
  console.log('files', files);

  let reader = new FileReader();

  reader.readAsText(file);

  reader.onload = function() {
    intext.value = reader.result
    console.log(reader.result);
  };

});


function download(text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', 'SIGAREAS.txt');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();
  document.body.removeChild(element);
}