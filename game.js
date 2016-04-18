var categories = ['hats', 'space', 'funny', 'sunglasses', 'boxes', 'caturday', 'ties', 'dream', 'kittens', 'sinks', 'clothes'];
var categoriesEstonian = ['mütsid', 'kosmos', 'naljakas', 'päikeseprillid', 'karbid', 'puhkus', 'lipsud', 'unistus', 'kassipojad', 'kraanikausid', 'riided'];
var choiceCount = 5;
var currentCat = {};
var correctCount = 0;
var wrongCount = 0;
var feedbackDisplayTime = 2000;

window.onload = function(){
	getCatFromApi();
};

function getCatFromApi(){
	var category = getRandomCategory();
	var url = "http://thecatapi.com/api/images/get?format=xml&category=" + category;
	
	$.ajax({
		url: url,
		success: function(catXml){
			currentCat.category = category;
			setCurrentCat(catXml);
			setPicture();
			setRandomChoices();
		}
	});
}

function getRandomCategory(){
	var randomId = Math.floor(categories.length * Math.random());
	return categories[randomId];
}

function setCurrentCat(catXml){
	// sometimes empty xml is returned
	if(catXml.getElementsByTagName("url")[0] == undefined){
		getCatFromApi();
	} else {
		currentCat.url = catXml.getElementsByTagName("url")[0].innerHTML;
		currentCat.id = catXml.getElementsByTagName("id")[0].innerHTML;
		currentCat.source_url = catXml.getElementsByTagName("source_url")[0].innerHTML;
	}
}

function setPicture(){
	var imgHtml = "<a href='" + currentCat.source_url + "' target='_blank'><img class='cat_picture' src='" + currentCat.url + "' alt='cat picture'></a>";
	$("#picture").html(imgHtml);
}

function setRandomChoices(){
	$("#choices").empty(); // also cleans listeners
	var scrambledChoices = getScrambledCopyOfArray(categories);
	var randomChoices = scrambledChoices.slice(0, choiceCount);
	var correctNotInChoices = randomChoices.indexOf(currentCat.category) == -1;
	if(correctNotInChoices){
		randomChoices[Math.floor(Math.random() * randomChoices.length)] = currentCat.category;
	}
	
	$("#choices").html(buildChoicesHTMLFromArray(randomChoices));
	setChoiceListeners(randomChoices);
}

function setChoiceListeners(randomChoices){
	for(var i=0; i<randomChoices.length; i++){
		$("#"+randomChoices[i]+"_choice").on("click", function(){
			checkIfCorrect(this);
		});
	}
}

function checkIfCorrect(clickedSpanObject){
	var clickedSpanId = clickedSpanObject.getAttribute("id");
	var clickedCategory = clickedSpanId.split("_")[0];
	displayFeedback(clickedCategory);
}

function displayFeedback(clickedCategory){
	var translatedClickedCategory = translateCategory(clickedCategory);
	var translatedCorrectCategory = translateCategory(currentCat.category);
	var feedbackHTML = "";
	if(clickedCategory == currentCat.category){
		correctCount++;
		feedbackHTML = "Valisid <span class='correct_answer'>" + translatedClickedCategory + "</span> ja see on õige!";
	} else {
		wrongCount++;
		feedbackHTML = "Valisid <span class='wrong_answer'>" + translatedClickedCategory + "</span>, aga õige on <span class='answer'>" + translatedCorrectCategory + "</span>!";
	}
	displayCorrectPercent();
	$("#choices").html(feedbackHTML);
	setTimeout(getCatFromApi, feedbackDisplayTime);
}

function displayCorrectPercent(){
	var correctPercent = Math.round(correctCount / (correctCount + wrongCount) * 100);
	var percentHTML = " (" + correctPercent + " %)";
	$("#correct_percent").html(percentHTML);
}

function buildChoicesHTMLFromArray(inputArray){
	var translations = getCategoryTranslations(inputArray);
	var HTML = "";
	for(var i=0; i<inputArray.length; i++){
		var linkIdentifier = inputArray[i] + "_choice";
		HTML += "<span id='" + linkIdentifier + "'><a href='#'>" + translations[i] + "</a></span> ";
	}
	return HTML;
}

function translateCategory(category){
	for(var i=0; i<categories.length; i++){
		if(category == categories[i]){
			return categoriesEstonian[i];
		}
	}
	return "no such category";
}

function getCategoryTranslations(inputArray){
	var translations = inputArray.slice(); // copy
	for(var i=0; i<inputArray.length; i++){
		for(var j=0; j<categories.length; j++){
			if(categories[j] == inputArray[i]){
				translations[i] = categoriesEstonian[j];
			}
		}
	}
	return translations;
}

function getScrambledCopyOfArray(inputArray){
	var scrambled = inputArray.slice(); // make a copy
	var length = scrambled.length;
	var randomIndex, helper;
	for(var i=0; i < length; i++){
		randomIndex = Math.floor(Math.random() * length);
		helper = scrambled[i];
		scrambled[i] = scrambled[randomIndex];
		scrambled[randomIndex] = helper;
	}
	return scrambled;
}