var view = {
	// Video variables
    vid: "",   			// video object for p5
    canvWidth: 400, 	// canvas width 
    canvHeight: 300,  	// canvas height
    fps: 60, 			// Frames per second to set Note: the sketch seems to stick close to but not 100% to this setting
    xVid: 0, 			// X offset of the video within the p5 canvas
    yVid: 0, 			// Y offset of the video within the p5 canvas
    vidPlay: false, 	// Keeps track if the video is playing or not  
    // ML Variables 
    mlModelURL: "https://teachablemachine.withgoogle.com/models/VYlFXZf_k/", // URL of the mlModel to be used to analyze the video 
    //mlModelURL: "https://teachablemachine.withgoogle.com/models/Lp16aC0Y2/", // URL of the mlModel to be used to analyze the video 
	mlModel: "", 			// ML Model to be loaded from url 
	graphedModel: false, 	// Have we graphed this model yet? 
	modelLoaded: false,		// Model is loaded and ready to be run on the video
	maxPredictions: 0, 		// Number of predictions in the ml model
	currPrediction: "None",	// Current prediction being made on the video based on the ml model that is loaded
	prevPrediction: "None", // Last prediction that was made on the video based on the ml model that is loaded
	timeNewPose: 0,			// Time that the prediction has been the current prediction
	animations: [], 		// Animations being run on the video based on the current model
};

function preload() { 
	view.initModel();    
}

function setup() {
    let cnv = createCanvas(view.canvWidth, view.canvHeight);
    cnv.id("p5jsCanvas"); 
    cnv.parent("sketchContainer");
    frameRate(view.fps);
}

function draw() {
    if (view.vid && view.modelLoaded) {
        // We have an uploaded video so draw it
        background(0);
        image(view.vid, view.xVid, view.yVid);

        view.predict(); 

        $("#videoSlider").val(view.vid.time()*1000);
        view.updateTimeText(view.vid.time()*1000);  

    } else {
        background(0); 
    }
}

////////////////////////////////////////////////////
// Functions for the ML Model Loading and Display //
////////////////////////////////////////////////////

// Initialize the pose estimation model by loading it up 
view.initModel = async function() {
    view.modelLoaded = false; 
    const modelURL = view.mlModelURL + "model.json";
    const metadataURL = view.mlModelURL + "metadata.json";
  
    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // Note: the pose library adds a tmPose object to your window (window.tmPose)
    view.mlModel = await tmPose.load(modelURL, metadataURL);
    view.maxPredictions = view.mlModel.getTotalClasses();
    view.modelLoaded = true; 
    console.log("MAX Predictions: " + view.maxPredictions); 

    // Empty and then add divs for graphing the poses 
    //$("#modelGraphContainer").empty(); 
    /*for (let i = 0; i < view.maxPredictions; i++) { // and class labels
        $("#modelGraphContainer").append("<div><label></label><div class='backBarChart'></div><div class='frontBarChart'></div></div>");
    }*/
}

view.updateMLurl = async function(mlURL) { 
	view.mlModelURL = mlURL; 
	view.graphedModel = false; 
	await view.initModel(); 
	view.graphedModel = false; 
	view.predict(); 
}

view.predict = async function() {
  
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await view.mlModel.estimatePose(document.getElementById("poseVid"));
  
    // Prediction 2: run input through teachable machine classification model
    const prediction = await view.mlModel.predict(posenetOutput);
  	//view.graphModel(prediction); 
  	if (!view.graphedModel) { 
  		console.log("initializing graphs")
  		view.initGraphs(prediction); 
  		view.graphedModel = true; 
  	} else { 
		view.updateGraphs(prediction); 
  	}
  	//var predictionDivs = $("#modelGraphContainer").children(); 
  	//console.log(predictionDivs); 
    /*for (let i = 0; i < view.maxPredictions; i++) {
        const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2)*100 + "%";
        
        $(predictionDivs[i]).text(classPrediction);
    }*/
}

view.initGraphs = function(prediction) {
	$("#modelGraphContainer").empty();
	// Iterate through each of the poses
	for (var i=0; i<view.maxPredictions; i++){
		console.log("INITIALIZING: " + prediction[i].className);
		var label = $("<label>" + prediction[i].className + ": " + (prediction[i].probability*100).toFixed(0) + "%</label>")
		var div0 = $("<div></div>"); 
		var div1 = $("<div class='barContainer'></div>");
		var div2 = $("<div class='backBarChart'></div>"); 
		var div3 = $("<div class='frontBarChart'</div>"); 
		$(div3).width((prediction[i].probability*100).toFixed(0) + "%"); 
		$(div1).append(div2);
		$(div1).append(div3);
		$(div0).append(label);
		$(div0).append(div1); 
		//$("#modelGraphContainer").append(label);
		$("#modelGraphContainer").append(div0);
	}
}

view.updateGraphs = function(prediction) {
	var poseGraphDivs = $("#modelGraphContainer").children();
	// Iterate through each of the poses
	for (var i=0; i<view.maxPredictions; i++){
		$(poseGraphDivs[i]).find('.frontBarChart').width((prediction[i].probability*100).toFixed(0) + "%");
		$(poseGraphDivs[i]).find('label').text(prediction[i].className + ": " + (prediction[i].probability*100).toFixed(0) + "%");
	}
}

view.graphModel = function(prediction) { 
	
	// Create graph data table
	//var poseNames = []; 
	var percent = []; 
	var negPercent = []; 
	
	var poseGraphDivs = $("#modelGraphContainer").children();
	
	for (var i=0; i<view.maxPredictions; i++){
		//poseNames.push(prediction[i].className);
		var currPercent = prediction[i].probability.toFixed(2)*100;
		percent.push(currPercent); 
		negPercent.push(100-currPercent); 
		var graphNode = $("<div class='percentBarChart'></div>"); 

		$(poseGraphDivs[i]).empty(); 
		$(poseGraphDivs[i]).append("<span>"+ prediction[i].className + "</span>")
		$(poseGraphDivs[i]).append(graphNode); 
	}

	//console.log(poseNames); 
	//console.log(percent); 

	/*var trace1 = {
	  	x: percent,
	  	y: poseNames,
	  	name: 'percent',
	  	orientation: 'h',
	  	marker: {
	    	color: 'rgba(11,73,38,0.6)',
	    	width: 1
	  	},
	  	type: 'bar'
	};

	var trace2 = {
	  	x: negPercent,
	  	y: poseNames,
	  	name: 'neg',
	  	orientation: 'h',
	  	type: 'bar',
	  	marker: {
	    	color: 'rgba(187,230,179,0.6)',
	    	width: 1
	  	}
	};


	var data = [trace1, trace2];
	var layout = {
  	    barmode: 'stack'
	};

	// if we've graphed it before then just update the plot
	var graphNode; 
	if (view.graphedModel) { 
		graphNode = $("#modelGraphContainer").child(); 
		Plotly.update(graphNode, data, layout);
	} else { // Remove everything and create a new plot
		// Remove anything that was here before
		$("#modelGraphContainer").empty();
		graphNode = document.createElement("DIV");
		Plotly.newPlot(graphNode, data, layout);
		$("#modelGraphContainer").append(graphNode); 
	}
	*/
	
	

}


///////////////////////////////////////////////////
// Functions to control the video player display //
///////////////////////////////////////////////////

view.formatTime = function(timeInMs) { 
    var milliseconds = parseInt((timeInMs % 1000) / 10),
    seconds = Math.floor((timeInMs / 1000) % 60),
    minutes = Math.floor((timeInMs / (1000 * 60)) % 60),
    hours = Math.floor((timeInMs / (1000 * 60 * 60)) % 24);
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

view.togglePlay = function() { 
	// Toggle the vidPlay to control the media element 
    if (view.vidPlay) { // playing already so toggling to pausing
        view.vid.pause(); 
        view.vidPlay  = false;
    } else { // paused already so toggling to playing 
        view.vidPlay = true; 
        view.vid.play(); 
    }
}

view.updateTimeText = function(timeInMs) {
    // Update second timers

    $("#vidLocation").text(view.formatTime(timeInMs)); //in milliseconds...need to change to a time format 
    $("#vidLocationNeg").text(view.formatTime(view.vid.duration()*1000 - timeInMs)); 
    
    // Update frame timers 
    //var fps = frameRate().toFixed(0); 
    //console.log(fps);
    var totalFrames = view.vid.duration()*view.fps; 
    $("#frameLocation").text("Frames: " + ((timeInMs/1000)*view.fps).toFixed(0));
    $("#frameLocationNeg").text((totalFrames - ((timeInMs/1000)*view.fps)).toFixed(0)); 

}

// Resize the video to match the p5canvas size 
view.resizeVid = function() {

	// If the height is greater than the width use the height to scale and AUTO for the width
    if (view.vid.height > view.vid.width){
        view.vid.size(AUTO, $("#p5jsCanvas").height());
    } else { // Else if the width is greater than or equal to the height use the width to scale and AUTO for the height
        view.vid.size($("#p5jsCanvas").width(), AUTO);
    } 

    // Reset location of the  video
    let currW = $("#poseVid").attr('width');
    let currH = $("#poseVid").attr('height'); 
    view.xVid = ($("#p5jsCanvas").width() - currW)/2; 
    view.yVid = ($("#p5jsCanvas").height() - currH)/2;
    //console.log("xVid: " + view.xVid + " yVid: " + view.yVid);               

}

view.initVid = function() {
    view.vid.id("poseVid"); 
    view.vidPlay = false; 

    // Set video slider to zero 
    $("#videoSlider").val(0); 
    console.log(view.vid.duration()); 
    $("#videoSlider").attr({
        "max" : 1000*view.vid.duration(),
        "min" : 0,
    }); 

    // Hide the video element to remove it from the main display 
    $("#poseVid").hide();

    // Resize the video to the canvas size
    view.resizeVid();
     
}