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
        armylist += "<td style='width:50px;'><a id='" + list.getDatafile(gameSystem, armies[a]) + "'></a></td><td><a href=\"./aconline.html?army=" + list.getDatafile(gameSystem, armies[a]) + "\">" + armies[a].trim().replaceAll("T9A ", "") + "</a></td>";
        armylist += "</tr>";
    }
    armylist += "</table>";

    return armylist;
}


function createHtmlList(gameSystem) {
    var armies = list.getArmiesForGameSystem(gameSystem);

    var armylist = "<div class='row row-cols-3 row-cols-sm-4 row-cols-md-5 row-cols-lg-6 g-3 army-grid'>";
    for (var a = 0; a < armies.length; a++) {
        var datafile = list.getDatafile(gameSystem, armies[a]);
        var armyName = armies[a].trim().replaceAll("T9A ", "").replaceAll("[TOW] ", "");
        armylist += "<div class='col army-grid-item'><article class='card card-hover myBorderSelection myDivColor army-card h-100'>";
        armylist += "<a id='" + datafile + "' class='army-card-icon' href='./aconline.html?army=" + datafile + "' aria-label='Open " + armyName + "'></a>";
        armylist += "<div class='card-body'><p class='card-text'><a class='army-card-title' href='./aconline.html?army=" + datafile + "'>" + armyName + "</a></p></div>";
        armylist += "</article></div>";
    }
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
        document.getElementById("armySearch").addEventListener("input", filterArmies);
        document.getElementById("armySearchClear").addEventListener("click", function () {
            var search = document.getElementById("armySearch");
            search.value = "";
            filterArmies();
            search.focus();
        });
        filterArmies();

        var armies = list.getArmiesForAll();
        for (var a = 0; a < armies.length; a++) {
            getArmyIcon(list.getDatafileForArmy(armies[a]), invertPicture);
        }
    };
    request.send();
}

function filterArmies() {
    var search = document.getElementById("armySearch");
    var query = search.value.trim().toLocaleLowerCase();
    var visibleCount = 0;

    document.querySelectorAll("#selection .army-grid-item").forEach(function (item) {
        var title = item.querySelector(".army-card-title").textContent.toLocaleLowerCase();
        item.hidden = !title.includes(query);
        if (!item.hidden) {
            visibleCount++;
        }
    });

    document.querySelectorAll("#selection .army-game-system").forEach(function (system) {
        system.hidden = system.querySelectorAll(".army-grid-item:not([hidden])").length == 0;
    });

    document.getElementById("armySearchStatus").textContent = query
        ? visibleCount + (visibleCount == 1 ? " army found" : " armies found")
        : visibleCount + (visibleCount == 1 ? " army" : " armies");
    document.getElementById("armySearchEmpty").hidden = visibleCount > 0;
}

function minimize() {
    $('.collapse').collapse('hide');
}

function maximize() {
    $('.collapse').collapse('show');
}


function createDropDown(id, title, content) {
    var result = '\
    <div class="container-fluid army-game-system">\
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
    document.body.classList.add("dark-mode");
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
    document.body.classList.remove("dark-mode");
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
    $('#darkLightToggle').prop('checked', true);
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
