var controller = {
};

controller.initialize = function () {
    console.log("CONTROLLER: Initializing...");
    controller.setupListeners();
    // TODO: Add a data logger here
};

controller.setupListeners = function() {
	console.log("CONTROLLER: Setting up listeners..."); 

	$("#videoFileUpload").on("change", function() {
        var fileName = $(this).val().split("\\").pop();
        $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
        if (this.files && this.files[0]) {
        	// Remove the current video if there is one
            $("#poseVid").remove(); 

            // Reset play/pause to the play button 
           	var $playIcon = $(this).find("i"); 

           	if ($playIcon.hasClass("fa-pause")) { 
           		$playIcon.toggleClass("fa-pause fa-play")
           	}

            console.log(this.files[0]);
            var fileLocation = URL.createObjectURL(this.files[0]); 
            console.log(fileLocation);
            
            view.vid = createVideo([fileLocation], view.initVid);
         
        }

    });


    $("#playPauseBtn").on("click", function() {
        // Toggle play/pause icon if vid is loaded 
        if (view.vid) { 
            $(this).find("i").toggleClass("fa-pause fa-play");
            view.togglePlay(); 
        }
           
    });

    $("#videoSlider").on("input change", function() {
        // Update visuals of the timing 
        if (view.vid) {
            var sliderInput = $(this).val();
            view.updateTimeText(sliderInput);  
            // Update poseVid location to play from
            view.vid.time(sliderInput/1000); 
        }
    });

    $("#replayBtn").on("click", function() {
        if (view.vid) { 
            view.vid.time(0);
        }
    }); 

    $("#bckFrameBtn").on("click", function() {
        if (view.vid){
            view.vid.pause(); 
            var currentTime = view.vid.time();
            //var fps = 60; //frameRate(); 
            var newTime = currentTime - (1 / view.fps); 
            view.vid.time(newTime);
        } 
    }); 

    $("#fwdFrameBtn").on("click", function() {
        if (view.vid){
            view.vid.pause(); 
            var currentTime = view.vid.time();
            //var fps = 60; //frameRate(); 
            
            var newTime = currentTime + (1 / view.fps); 
            view.vid.time(newTime); 
        }
        
    }); 

    $("#bckTenFramesBtn").on("click", function() {
        if (view.vid){
            view.vid.pause(); 
            var currentTime = view.vid.time();
            //var fps = frameRate(); 
            var newTime = currentTime - (10 / view.fps); 
            view.vid.time(newTime);
        } 
    }); 

    $("#fwdTenFramesBtn").on("click", function() {
        if (view.vid){
            view.vid.pause(); 
            var currentTime = view.vid.time();
            //var fps = frameRate(); 
            var newTime = currentTime + (10 / view.fps); 
            view.vid.time(newTime); 
        }
        
    }); 

    $("#modelUploadBtn").on("click", function() {
 		// TODO: perform some sort of check on the input
 		console.log("Uploading: " + $("#inputModelLink").val()); 
    	view.updateMLurl($("#inputModelLink").val()); 
    });

};