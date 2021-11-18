function readFile(input) {
    let file = input.files[0];  
    let reader = new FileReader();  
    reader.readAsText(file);  
    reader.onload = function() {      
      document.getElementById("infile").value = reader.result;
    };  
    reader.onerror = function() {
      console.log(reader.error);
    };  
  }

$(".custom-file-input").on("change", function() {
    var fileName = $(this).val().split("\\").pop();
    $(this).siblings(".custom-file-label").addClass("selected").html(fileName); 
    readFile(this);
    });


// bootstrap javascripts tooltips can persist even after tab-closed, 
// but javascripts is already stored cached by the browser for 15 minutes so ...
const tooltips = new Map([
  ["rumos-v", "Ajusta latitude e longitude para rumos verdadeiros (NSEW)"]
]);
// set tooltips by here
tooltips.forEach (function(title, id) {  
  document.getElementById(id)['title'] = title;
})
$(document).ready(function(){
  $('[data-toggle="tooltip"]').tooltip();   
});

    