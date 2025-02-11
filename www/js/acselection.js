let server = "./api.php?url=";
let displayMode = "light";
let invertPicture = "0";

$(document).ready(function () {
    document.getElementById("selection").innerHTML = "";
    list = new ArmyList();
    init();
});

function init() {
    armyIcons = new Map();
    loadSession();
    getArmies();

}

function getServer(urlpart) {
    var result = server + encodeURI(urlpart);
    return result;
}

function createHtmlListAsList(gameSystem) {
    var armies = list.getArmiesForGameSystem(gameSystem);

    var armylist = "<table class=\"table\">";
    var line = 0;
    for (var a = 0; a < armies.length; a++) {
        line++;
        if (line % 2 == 0) {
            armylist += "<tr class='myOddLine'>";
        } else {
            armylist += "<tr style=\"background-color:#ffe6d0;\">";
        }
        armylist += "<td style='width:50px;'><a id='" + list.getDatafile(gameSystem, armies[a]) + "'></a></td><td><a href=\"./aconline.html?army=" + list.getDatafile(gameSystem, armies[a]) + "\">" + armies[a].trim().replaceAll("T9A ", "") + "</a></td>"
        armylist += "</tr>";
    }
    armylist += "</table>";

    return armylist;
}


function createHtmlList(gameSystem) {
    var armies = list.getArmiesForGameSystem(gameSystem);

    var armylist = "<div class='container-fluid'>";
    armylist += "<div class='row row-cols-2 justify-content-center'>";
    var line = 0;
    for (var a = 0; a < armies.length; a++) {
        armylist += "<div class='card card-hover myBorderSelection col myDivColor pt-4 d-flex text-center shadow' style='width: 9rem;'>";
        armylist += "<a id='" + list.getDatafile(gameSystem, armies[a]) + "' class='card-img-top' href='./aconline.html?army=" + list.getDatafile(gameSystem, armies[a]) + "'></a>";
        armylist += " <div class='card-body'>";
        armylist += "<p class='card-text'><a style='color:#e8692d;' href='./aconline.html?army=" + list.getDatafile(gameSystem, armies[a]) + "'>" + armies[a].trim().replaceAll("T9A ", "").replaceAll("[TOW] ", "") + "</a></p>";
        armylist += "</div>";
        armylist += "</div>";
    }
    armylist += "</div>";
    armylist += "</div>";

    return armylist;
}

function getArmies() {
    let url = getServer("/armylist");
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'text';
    request.onload = function () {
        createArmyList(request);
        var gameSystems = list.getGameSystems();
        var result = "";

        for (var i = 0; i < gameSystems.length; i++) {
            if (gameSystems[i].localeCompare("WarhammerCE") == 0) {
                result = createDropDown("game_" + gameSystems[i].replaceAll(" ",""), gameSystems[i], createHtmlList(gameSystems[i])) + result;
            } else {
                result += createDropDown("game_" + gameSystems[i].replaceAll(" ",""), gameSystems[i], createHtmlList(gameSystems[i]));
            }
            
        }

        document.getElementById("selection").innerHTML = result;

        var armies = list.getArmiesForAll();
        for (var a = 0; a < armies.length; a++) {
            getArmyIcon(list.getDatafileForArmy(armies[a]), invertPicture);
        }
    };
    request.send();
}

function minimize() {
    $('.collapse').collapse('hide');
}

function maximize() {
    $('.collapse').collapse('show');
}


function createDropDown(id, title, content) {
    var result = '\
	<div class="container-fluid" style="padding-top:10px;">\
		<div class="w-auto">\
            <div class=" card text myBorder" style="background-color: transparent; border: 1;">\
                <div class="myActionButtonBackground">\
                    <div class="btn" data-bs-toggle="collapse" href="#'+ id + '" role="button" aria-expanded="false" aria-controls="' + id + '">\
                        <i class="bi bi-chevron-down myActionButtonBackground"></i> <b class="myActionButtonBackground">'+ title + '</b>\
                    </div>\
                </div>\
                <div class="collapse show" style="background-color: transparent;" id="'+ id + '">\
                '+ content + '\
                </div>\
            </div>\
		</div>\
        </div>\
        ';

    return result;
}

function enableDarkMode() {
    changeCSSBackground(".myDivColor", "black");
    changeCSSForeground(".myDivColor", "white");
    changeCSSBackground(".myBodyColor", "black");

    changeCSSForeground(".myHeaderColor", "white");
    changeCSSBackground(".myHeaderColor", "black");
	
    changeCSSBackground(".myDonateColor", "black");
	
    changeCSSBackground(".myActionButtonBackground", "#3f3f3f");
    changeCSSForeground(".myActionButtonBackground", "white");

    changeCSSBorderColor(".myBorderSelection", "#3f3f3f");
    changeCSSProperty(".myBorder", "border-color", "grey");

    changeCSSBackground(".myOddLine", "#cccccc");
    $('#darkLightToggle').prop('checked', false);
    saveSession();
}

function enableLightMode() {
    changeCSSBackground(".myDivColor", "white");
    changeCSSForeground(".myDivColor", "black");
    changeCSSBackground(".myBodyColor", "#ebeced");
        
    changeCSSBackground(".myActionButtonBackground", "#f4b477");
    changeCSSForeground(".myActionButtonBackground", "black");

    changeCSSBackground(".myDonateColor", "#f7f7f7");
	
    changeCSSBorderColor(".myBorderSelection", "#f4b477");
    changeCSSProperty(".myBorder", "border-color", "#f4b477");

    changeCSSForeground(".myHeaderColor", "black");
    changeCSSBackground(".myHeaderColor", "#ebeced");
    $('#darkLightToggle-demo').prop('checked', true);
    changeCSSBackground(".myOddLine", "#ffffff");
    saveSession();
}

function toggleDisplayMode() {
    if (displayMode == "light") {
        displayMode = "dark";
        invertPicture = "1";
        enableDarkMode();
        getArmies();
    } else {
        displayMode = "light";
        invertPicture = "0";
        enableLightMode();
        getArmies();
    }
}

function changeCSSProperty(cname, property, value) {
	for (var i = 0; i < document.styleSheets.length; ++i) {
		var cssRules = document.styleSheets[i].cssRules;
		for (var j = 0; j < cssRules.length; ++j)
			if (cssRules[j].selectorText == cname) {
				document.styleSheets[i].cssRules[j].style.setProperty(property, value);
				break;
			}
	}
}

function changeCSSBackground(cname, color) {
    for (var i = 0; i < document.styleSheets.length; ++i) {
        var cssRules = document.styleSheets[i].cssRules;
        for (var j = 0; j < cssRules.length; ++j)
            if (cssRules[j].selectorText == cname) {
                document.styleSheets[i].cssRules[j].style.setProperty("background-color", color);
                break;
            }
    }
}

function changeCSSBorderColor(cname, color) {
    for (var i = 0; i < document.styleSheets.length; ++i) {
        var cssRules = document.styleSheets[i].cssRules;
        for (var j = 0; j < cssRules.length; ++j)
            if (cssRules[j].selectorText == cname) {
                document.styleSheets[i].cssRules[j].style.setProperty("border-color", color);
                break;
            }
    }
}

function changeCSSForeground(cname, color) {
    for (var i = 0; i < document.styleSheets.length; ++i) {
        var cssRules = document.styleSheets[i].cssRules;
        for (var j = 0; j < cssRules.length; ++j)
            if (cssRules[j].selectorText == cname) {
                document.styleSheets[i].cssRules[j].style.setProperty("color", color);
                break;
            }
    }
}

function saveSession() {
    localStorage.displaymode = displayMode;
}

function loadSession() {
    if (localStorage.displaymode) {
        displayMode = localStorage.displaymode;
        setDisplayMode(displayMode);
    }
}

function setDisplayMode(mode) {
    if (mode == "light") {
        enableLightMode();
    } else {
        enableDarkMode();
    }
}

function getArmyIconForList(armydatafile) {
    if (localStorage.getItem(armydatafile)) {
        document.getElementById(armydatafile).innerHTML = "<img src='data:image/png;base64, " + localStorage.getItem(armydatafile) + "' alt='logo' style='float:left;width:20px;border:1px solid #e8692d;' />";
    }
    else {
        let url = getServer("/armyicon/" + armydatafile);
        let request = new XMLHttpRequest();
        request.open('GET', url);
        request.responseType = 'text';
        request.onload = function () {
            var icon = request.response;
            document.getElementById(armydatafile).innerHTML = "<img src='data:image/png;base64, " + icon + "' alt='logo' style='float:left;width:20px;border:1px solid #e8692d;' />";
            localStorage.setItem(armydatafile, icon);
        };
        request.send();
    }
}

function getArmyIcon(armydatafile, invert) {
    if (localStorage.getItem(armydatafile)) {
        document.getElementById(armydatafile).innerHTML = "<img style='filter:invert(" + invert + ");' src='data:image/png;base64, " + localStorage.getItem(armydatafile) + "' alt='logo' width='60px' height='60px' />";
    }
    else {
        let url = getServer("/armyicon/" + armydatafile);
        let request = new XMLHttpRequest();
        request.open('GET', url);
        request.responseType = 'text';
        request.onload = function () {
            var icon = request.response;
            document.getElementById(armydatafile).innerHTML = "<img  style='filter:invert(" + invert + ");' src='data:image/png;base64, " + icon + "' alt='logo' width='60px' height='60px' />";
            localStorage.setItem(armydatafile, icon);
        };
        request.send();
    }
}
