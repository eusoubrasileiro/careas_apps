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