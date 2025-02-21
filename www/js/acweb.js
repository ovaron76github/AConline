let server = "./api.php?url=";
let cloudserver = "https://cloud.armycreator.de/";
let armydatafile = "whce_empire.xml"
let armyname = "";
let mapMinSize = new Map();
let mapMaxSize = new Map();
let rosters = null;
let actualUnit = null;
let categories = [];
let unitCategory = null;
let editMode = false;
let optiondescriptions = null;
let unitCostMap = null;
let categoryUnits = null;
let categoryUnitMap = null;
let unitOptions = null;
let availableOptionsMap = null;
let displayMode = "light";

function getServer(urlpart) {
    var result = server + encodeURI(urlpart);
    return result;
}

var getQueryParam = function (param) {
    var found;
    window.location.search.substr(1).split("&").forEach(function (item) {
        if (param == item.split("=")[0]) {
            found = item.split("=")[1];
        }
    });
    return found;
};

$(document).ready(function () {
    bootstrap.Popover.Default.html = true;
    bootstrap.Popover.Default.sanitize = false;

    var urlArmy = getQueryParam("army");
    if ((typeof (urlArmy) != "undefined") && (urlArmy != null)) {
        urlArmy = urlArmy.replaceAll("..", "").replaceAll("/", "").replaceAll("$", "").replaceAll("~", "").replaceAll("+", "").replaceAll("%", "").replaceAll("&", "").replaceAll("\(", "").replaceAll("\)", "");
        if (urlArmy != armydatafile) {
            armydatafile = urlArmy;
            sessionStorage.removeItem("rosters");
            rosters = new Roster();
        }
    }

    var loadRstFromCloud = getQueryParam("load");
    if ((typeof (loadRstFromCloud) != "undefined") && (loadRstFromCloud != null)) {
        loadRosterByCloudID(loadRstFromCloud.trim());
    } else {
        init();
    }
});

function setElementVisible(elementOrSelector, visible) {
    (typeof elementOrSelector === 'string' ? document.querySelector(elementOrSelector) : elementOrSelector).style.display = visible ? 'block' : 'none';
}

function init() {
    actualUnit = new Unit();
    unitCategory = new Map();
    optiondescriptions = new Map();
    categoryUnits = new Map();
    categoryUnitMap = new Map();
    unitOptions = new Map();
    availableOptionsMap = new Map();
    unitCostMap = new Map();
    getSetArmyName();
    getArmyIcon();
    getAllDescriptionForAllOptions();
    getDescriptionsForAllUnits();

    document.getElementById("maxArmyPoints").addEventListener("focusout", (event) => {
        checkRooster();
    });
    
}

function enableDarkMode() {
    changeCSSBackground(".myDivColor", "black");
    changeCSSForeground(".myDivColor", "white");
    changeCSSBackground(".myBodyColor", "#212121");
    changeCSSBackground(".myHeaderBackground", "grey");
    changeCSSBackground(".myCategoryBackground", "#3f3f3f");
    changeCSSBackground(".myActionButtonBackground", "#3f3f3f");
    changeCSSForeground(".myActionButtonBackground", "white");

    changeCSSProperty(".myBorder", "border-color", "grey");

    changeCSSForeground(".myHeaderColor", "white");
    changeCSSBackground(".myHeaderColor", "black");

    document.getElementById("mode").innerHTML = "Dark";

    document.activeElement.blur();
    saveSession();
}

function enableLightMode() {
    changeCSSBackground(".myDivColor", "white");
    changeCSSForeground(".myDivColor", "black");
    changeCSSBackground(".myBodyColor", "#ebeced");
    changeCSSBackground(".myHeaderBackground", "#f4b477");
    changeCSSBackground(".myCategoryBackground", "#e8692d");
    changeCSSBackground(".myActionButtonBackground", "#f4b477");
    changeCSSForeground(".myActionButtonBackground", "black");

    changeCSSProperty(".myBorder", "border-color", "#f4b477");

    changeCSSForeground(".myHeaderColor", "black");
    changeCSSBackground(".myHeaderColor", "#ebeced");

    document.getElementById("mode").innerHTML = "Light";

    document.activeElement.blur();
    saveSession();
}

function toggleDisplayMode() {
    if (displayMode == "light") {
        displayMode = "dark";
        enableDarkMode();
    } else {
        displayMode = "light";
        enableLightMode();
    }
}

function setDisplayMode(mode) {
    if (mode == "light") {
        enableLightMode();
    } else {
        enableDarkMode();
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

class Unit {
    constructor(category, name, size, options, cost, uuid, refuuid, comment, inactive) {
        this.category = category;
        this.name = name;
        this.size = size;
        this.options = options;
        this.cost = cost;
        this.uuid = uuid;
        this.refuuid = refuuid;
        this.comment = comment;
        this.inactive = inactive;
    }

    setValue(fieldno, value) {
        switch (fieldno) {
            case 0:
                this.category = value;
                break;
            case 1:
                this.name = value;
                break;
            case 2:
                this.size = value;
                break;
            case 3:
                this.options = value;
                break;
            case 4:
                this.cost = value;
                break;
            case 5:
                this.uuid = value;
                break;
            case 6:
                this.refuuid = value;
                break;
            case 7:
                this.comment = value;
                break;
            case 8:
                this.inactive = value;
        }
    }

    isEmpty() {
        var result = true;
        if (!this.category.trim.isEmpty)
            result = false;
        if (!this.name.trim.isEmpty)
            result = false;
        if (!this.size.trim.isEmpty)
            result = false;
        if (!this.options.trim.isEmpty)
            result = false;
        if (!this.cost.trim.isEmpty)
            result = false;
        if (!this.uuid.trim.isEmpty)
            result = false;
        if (!this.refuuid.trim.isEmpty)
            result = false;
        if (!this.comment.trim.isEmpty)
            result = false;

        return result;
    }

}

class Roster {

    constructor() {
        this.units = [];
    }

    addUnit(unitToAdd) {
        if (!unitToAdd.isEmpty()) {
            this.units.push(unitToAdd);
        }
    }

    replaceUnit(uuid, unit) {
        for (var i = 0; i < this.units.length; i++) {
            if (this.units[i].uuid == uuid) {
                this.units[i] = unit;
            }
        }
    }

    deleteUnit(uuid) {
        for (var i = 0; i < this.units.length; i++) {
            if (this.units[i].uuid == uuid || this.units[i].refuuid == uuid) {
                this.units.splice(i, 1);
                i--;
            }
        }
        if (this.units.length == 0) {
            localStorage.rosters = "";
        }
        saveSession();
    }

    setInactiveStatus(uuid, status) {
        for (var i = 0; i < this.units.length; i++) {
            if (this.units[i].uuid == uuid) {
                this.units[i].inactive = status;
                if (this.units[i].refuuid != "" && status == "") {
                    this.units[this.getUnitPosition(this.units[i].refuuid)].inactive = status;
                }
            }
            if (this.units[i].refuuid == uuid) {
                this.units[i].inactive = status;
                this.setInactiveStatus(this.units[i].uuid, status);
            }
        }
    }

    getAttatchedUnits(uuid) {
        var result = [];
        for (var i = 0; i < this.units.length; i++) {
            if (this.units[i].refuuid == uuid) {
                result.push(this.units[i].uuid);
            }
        }

        return result;
    }

    getUnitPosition(uuid) {
        var result = -1;
        for (var i = 0; i < this.units.length; i++) {
            if (this.units[i].uuid == uuid) {
                result = i;
            }
        }

        return result;
    }

    getUnit(uuid) {
        var result = null;
        for (var i = 0; i < this.units.length; i++) {
            if (this.units[i].uuid == uuid) {
                result = rosters.units[i];
            }
        }

        return result;
    }

    move(from, to) {
        this.units = moveInArray(this.units, from, to);
        saveSession();
    }

    getCostSum() {
        var result = 0.0;

        for (var i = 0; i < this.units.length; i++) {
            var cost = parseFloat(this.units[i].cost.trim());
            if (this.units[i].inactive != "X") {
                result += cost;
            }
        }

        return result;
    }

    getAttachmentUnits() {
        var result = [];
        for (var i = 0; i < this.units.length; i++) {
            if (this.units[i].refuuid != "") {
                result.push(this.units[i]);
            }
        }
        return result;
    }

    getMainUnits() {
        var result = [];
        for (var i = 0; i < this.units.length; i++) {
            if (this.units[i].refuuid == "") {
                result.push(this.units[i]);
            }
        }
        return result;
    }

    moveUnit(uuid, direction) {
        var mainUnits = this.getMainUnits();
        var attachmentUnits = this.getAttachmentUnits();
        var unitList = [];

        var posMain;
        for (var i = 0; i < mainUnits.length; i++) {
            if (mainUnits[i].uuid == uuid) {
                posMain = i;
                break;
            }
        }

        if (direction == "up") {
            if (posMain > 0) {
                mainUnits = moveInArray(mainUnits, posMain, posMain - 1);
            }
        } else if (direction == "down") {
            if (posMain < mainUnits.length - 1) {
                mainUnits = moveInArray(mainUnits, posMain, posMain + 1);
            }
        }

        for (var i = 0; i < mainUnits.length; i++) {
            unitList.push(mainUnits[i]);
            for (var a = 0; a < attachmentUnits.length; a++) {
                if (attachmentUnits[a].refuuid == mainUnits[i].uuid) {
                    unitList.push(attachmentUnits[a]);
                }
            }
        }

        this.units = unitList;
        saveSession();
    }

    fixAttachments() {
        for (var i = 0; i < this.units.length; i++) {
            if (this.units[i].refuuid != "") {
                var mainUnit = this.getUnit(this.units[i].refuuid);
                if (mainUnit == null) {
                    this.units[i].refuuid = "";
                }
            }
        }
        this.moveUnit("", "");
    }

}

function saveSession() {
    let rst = createRST().trim();
    if (rst.includes("|")) {
        localStorage.rosters = rst;
    }
    localStorage.displaymode = displayMode;
    localStorage.rostername = document.getElementById("rosterName").value;
}

function loadSession() {
    if (localStorage.rostername && localStorage.rostername != "undefined") {
        document.getElementById("rosterName").value = localStorage.rostername;
    }

    if (localStorage.displaymode) {
        displayMode = localStorage.displaymode;
        setDisplayMode(displayMode);
    }

    if (localStorage.rosters) {
        if (localStorage.rostername == armyname) {
            loadRST(localStorage.rosters);
            createRosterTable();
            checkRooster();
        } else {
            document.getElementById("rosterName").value = armyname;
            createRosterTable();
        }
    } else {
        rosters = new Roster();
        createRosterTable();
        getStatistics();
    }

    if (localStorage.cloudUser && localStorage.cloudUser != "undefined") {
        document.getElementById("userInput").value = localStorage.cloudUser;
        document.getElementById("userInputUpload").value = localStorage.cloudUser;
    }

    if (localStorage.cloudPwd && localStorage.cloudPwd != "undefined") {
        document.getElementById("inputPassword").value = localStorage.cloudPwd;
        document.getElementById("inputPasswordUpload").value = localStorage.cloudPwd;
    }

}

function createRST() {
    var rst = "###" + armyname + "###\n";
    let formatedMaxArmyPoints = document.getElementById("maxArmyPoints").value.replaceAll(",", ".").replaceAll("[^0-9.,]", "").trim();

    rst += "$$$" + formatedMaxArmyPoints + "$$$\n";
    if (rosters != null && rosters.units.length > 0) {
        for (var i = 0; i < rosters.units.length; i++) {
            rst += rosters.units[i].category.trim() + "|";
            rst += rosters.units[i].name.trim() + "|";
            rst += rosters.units[i].size.trim() + "|";
            rst += rosters.units[i].options.trim() + "|";
            rst += rosters.units[i].cost.trim() + "|";
            rst += rosters.units[i].uuid.trim() + "|";
            rst += rosters.units[i].refuuid.trim() + "|";
            rst += rosters.units[i].comment.trim() + "|";
            rst += rosters.units[i].inactive.trim() + "\n";
        }
    }

    return rst;
}

function loadRST(rstData) {
    rosters = new Roster();
    document.getElementById("categoryUnits").innerText = "";
    document.getElementById("unitOptions").innerText = "";
    var armyInFile = getArmyNameFromRST(rstData);
    if (armyInFile != armyname) {
        armyname = armyInFile;
        clearRoster("true");
        mapArmyname();
        init();

    }

    var rst = rstData.trim();
    document.getElementById("maxArmyPoints").value = "0";

    var lines = rst.split("\n");
    for (var l = 0; l < lines.length; l++) {
        if (!lines[l].includes("###") && !lines[l].includes("$$$")) {
            var actLine = lines[l];
            var lineElements = actLine.split("|");
            var actUnit = new Unit("", "", "", "", "", "", "", "", "");
            if (lineElements.length > 1) {
                for (var o = 0; o < lineElements.length; o++) {
                    actUnit.setValue(o, lineElements[o]);
                }
                rosters.addUnit(actUnit);
            }
        } else if (lines[l].includes("$$$")) {
            let points = lines[l].replaceAll("$$$", "").trim();
            document.getElementById("maxArmyPoints").value = points;
        }
    }

    saveSession();
}

function getArmyNameFromRST(rstData) {
    var firstLineBreak = rstData.indexOf("\n");
    var armyInFile = rstData.substr(0, firstLineBreak).trim().replaceAll("###", "");

    return armyInFile;
}

function updateRST(rstData) {
    var tmpRosters = new Roster();
    var firstLineBreak = rstData.indexOf("\n");
    var armyInFile = rstData.substr(0, firstLineBreak).trim().replaceAll("###", "");
    if (armyInFile == armyname) {
        var rst = rstData.trim();

        var lines = rst.split("\n");
        for (var l = 0; l < lines.length; l++) {
            if (!lines[l].includes("###") && !lines[l].includes("$$$")) {
                var actLine = lines[l];
                var lineElements = actLine.split("|");
                var actUnit = new Unit("", "", "", "", "", "", "", "", "");
                if (lineElements.length > 1) {
                    for (var o = 0; o < lineElements.length; o++) {
                        actUnit.setValue(o, lineElements[o]);
                    }
                    tmpRosters.addUnit(actUnit);
                }
            }
        }

        for (var i = 0; i < tmpRosters.units.length; i++) {
            rosters.replaceUnit(tmpRosters.units[i].uuid, tmpRosters.units[i]);
        }
    }
}

var UUID = (function () {
    var self = {};
    var lut = [];
    for (var i = 0; i < 256; i++) {
        lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
    }
    self.generate = function () {
        var d0 = Math.random() * 0xffffffff | 0;
        var d1 = Math.random() * 0xffffffff | 0;
        var d2 = Math.random() * 0xffffffff | 0;
        var d3 = Math.random() * 0xffffffff | 0;
        return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
                lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
                lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
                lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
    }
    return self;
})();
//usage: var tmp = UUID.generate();


const moveInArray = (arr, fromIndex, toIndex) => {
    if (toIndex === fromIndex || toIndex >= arr.length)
        return arr;

    const toMove = arr[fromIndex];
    const movedForward = fromIndex < toIndex;

    return arr.reduce((res, next, index) => {
        if (index === fromIndex)
            return res;
        if (index === toIndex)
            return res.concat(
                    movedForward ? [next, toMove] : [toMove, next]
                    );

        return res.concat(next);
    }, []);
};

function formatUnit(unitname) {
    var tmp = unitname.indexOf("@");
    var name = unitname.substring(0, tmp).trim();
    var cost = unitname.substring(tmp).trim();

    var colorName = name + " <i style='color:#e8692d;font-size: smaller;'>" + cost + "</i>";

    return colorName;
}

function createCategories(categories, selectedCategory) {
    let result = "<div class=\"myCategoryBackground btn-group w-100 flex-wrap rounded-bottom \" role=\"group\" data-toggle=\"buttons\">";
    for (var i = 0; i < categories.length; i++) {
        var categoryName = categories[i];
        if (categoryName == selectedCategory) {
            categoryName = "<u><b>" + categoryName + "</b></u>";
        }
        result += "<button type=\"button\" onclick=\"showUnits('" + categories[i] + "');\" class=\"myCategoryBackground btn card-hover rounded-bottom fs-5\" style=\"color:white; border-radius:0;\" >" + categoryName + "</button>";
    }
    result += "</div>";
    document.getElementById("categories").innerHTML = result;
}

function createUnits(units, selectedUnit) {
    let result = "<div class=\"btn-group-vertical w-100 p-2\">";

    var unitCount = units.length;
    if (unitCount>9) {
        result = "<div style=\"column-width:400px; column-gap:0; margin-left:-22px;\"><ul>"
    }

    for (var i = 0; i < units.length; i++) {
        var unitName = units[i];
        if (unitName.startsWith(selectedUnit + " @")) {
            unitName = "<b>" + unitName + "</b>";
        }
        result += "<li style='list-style: none;'><button type=\"button\" onclick=\"showOptions('" + units[i] + "')\" class=\"btn rounded text-hover myDivColor\" style='text-align: left;'>&bull; " + formatUnit(unitName) + "</button></li>";
    }
    result += "</ul></div>";
    return result;
}

function showUnits(category, selectedUnit) {
    showOptions("");
    createCategories(categories, category);
    getCategoryUnits(category, selectedUnit);
}

function removeCosts(text) {
    var n = text.search("@");
    var result = text;
    if (n > 0) {
        result = text.substring(0, n);
    }

    return result.trim();
}

function showOptions(name) {
    if (name != "") {
        getUnitOptions(removeCosts(name));
    }
}

function initPopover() {
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}

function createOption(type, options) {
    let result = "<div><label class=\"badge\" style=\"background-color:#f4b477;\">" + type + "</label>";

    for (var i = 0; i < options.length; i++) {
        var popover = '<a tabindex="0" class="bi text-scale-hover bi-info-circle" role="button" data-bs-html="true" data-bs-toggle="popover" data-bs-trigger="focus" title="' + removeCosts(options[i]) + '" data-bs-content="Loading..." id="desc_' + options[i] + '"></a>';
        result += "<div class=\"form-check text-hover myDivColor\"><input class=\"form-check-input\" type=\"checkbox\" value=\"\" onclick=\"doLiveCheck('" + options[i] + "');\" id=\"option_" + options[i] + "\"><label class=\"form-check-label btn-sm\" for=\"option_" + options[i] + "\" id=\"label_" + options[i] + "\">" + options[i] + "</label>" + popover + "</div>";
    }
    result += "</div>";

    return result;
}

function createUnitHeader(unitName, prefix) {
    var result = '<a tabindex="0" class="bi bi-info-circle" role="button" data-bs-html="true" data-bs-toggle="popover" data-bs-trigger="focus" title="' + removeCosts(unitName) + '" data-bs-content="Loading..." id="' + prefix + unitName + '"></a>';

    return result;
}


function capitalizeFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1);
}

function getSelectedOptions() {
    var optionList = document.querySelectorAll('*[id^="option_"]');
    var selectedOptions = [];

    for (var i = 0; i < optionList.length; i++) {
        if (document.getElementById(optionList[i].id).checked == true) {
            var labelID = optionList[i].id.replaceAll("option_", "label_");
            selectedOptions.push(removeCosts(document.getElementById(labelID).innerText));
        }
    }

    var result = "";
    for (var i = 0; i < selectedOptions.length; i++) {
        if (selectedOptions[i].trim() != "") {
            result += selectedOptions[i] + ";";
        }
    }

    return result;
}

function setOptionState(optionsEnabled) {
    var optionList = document.querySelectorAll('*[id^="option_"]');
    var optionsEnabledList = optionsEnabled.split(";");

    for (var i = 0; i < optionList.length; i++) {
        var labelID = optionList[i].id.replaceAll("option_", "label_");
        var optionName = removeCosts(document.getElementById(labelID).innerText);
        if (optionsEnabledList.includes(optionName)) {
            document.getElementById(optionList[i].id).disabled = false;
        } else {
            document.getElementById(optionList[i].id).disabled = true;
        }
    }
}

function enableAllOptions() {
    var optionList = document.querySelectorAll('*[id^="option_"]');
    for (var i = 0; i < optionList.length; i++) {
        document.getElementById(optionList[i].id).disabled = false;
    }
}

function getCategoriesFromAC() {
    let url = getServer("/categorylist/" + armydatafile);
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'text';
    request.onload = function () {
        var parse = request.response.split(";");
        categories = new Array();
        for (let i = 0; i < parse.length; i++) {
            if ((i % 2) == 0 && parse[i].trim() != "") {
                categories.push(parse[i].trim());
            }
        }
        createCategories(categories);
        if (unitCategory.size == null) {
            createUnitCategoryMap();
        } else if (unitCategory.size == 0) {
            createUnitCategoryMap();
        }
        showUnits(categories[0]);
        setElementVisible('#loading', false);
    };
    request.send();
}

function getArmyIcon() {
    if (localStorage.getItem(armydatafile)) {
        document.getElementById("armyIcon").innerHTML = "<img src='data:image/png;base64, " + localStorage.getItem(armydatafile) + "' alt='logo' style='float:left;height:40px;border:1px solid #e8692d;' />&nbsp;";
    } else {
        let url = getServer("/armyicon/" + armydatafile);
        let request = new XMLHttpRequest();
        request.open('GET', url);
        request.responseType = 'text';
        request.onload = function () {
            var icon = request.response;
            document.getElementById("armyIcon").innerHTML = "<img src='data:image/png;base64, " + icon + "' alt='logo' style='float:left;height:40px;border:1px solid #e8692d;' />&nbsp;";
        };
        request.send();
    }
}

function getDescriptionForOption(optionname, prefix) {
    var optname = removeStackFromText(removeCostsFromText(optionname));
    if (optiondescriptions.has(optname)) {
        var result = optiondescriptions.get(optname);
        try {
            document.getElementById(prefix + optionname).setAttribute("data-bs-content", result);
        } catch (err) {
        }
    } else {
        let url = getServer("/optiondescription/" + armydatafile + "/" + btoa(optname));
        let request = new XMLHttpRequest();
        request.open('GET', url);
        request.responseType = 'text';
        request.onload = function () {
            var result = request.response.replaceAll("- ", "<br />- ");
            optiondescriptions.set(optname, result);
            try {
                document.getElementById(prefix + optionname).setAttribute("data-bs-content", result);
            } catch (err) {
            }
        };
        request.send();
    }
}

function removeCostsFromText(txt) {
    return txt.split('@')[0].trim();
}
function removeStackFromText(txt) {
    return txt.split('#')[0].trim();
}

function getAllDescriptionForAllOptions() {
    let url = getServer("/alloptiondescriptions/" + armydatafile);
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'text';
    request.onload = function () {
        var result = request.response;
        var itemlines = result.split('\n');
        for (let i = 0; i < itemlines.length; i++) {
            var item = itemlines[i].split('###');
            var name = removeStackFromText(item[0]);
            if (!optiondescriptions.has(name) && item[0].length > 0 && item[1] !== undefined) {
                optiondescriptions.set(name, item[1].replaceAll("- ", "<br />- "));
            }
        }

    };
    request.send();
}

function getDescriptionsForAllUnits() {
    let url = getServer("/allunitsdescriptions/" + armydatafile);
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'text';
    request.onload = function () {
        var result = request.response;
        var itemlines = result.split('\n');
        for (let i = 0; i < itemlines.length; i++) {
            var item = itemlines[i].split('###');
            var name = item[0];
            if (!optiondescriptions.has(name) && item[0].length > 0 && item[1] !== undefined) {
                optiondescriptions.set(name, item[1].replaceAll("- ", "<br />- "));
            }
        }
    };
    request.send();
}

function getDescriptionForUnit(unitname, prefix) {
    if (optiondescriptions.has(unitname)) {
        var result = optiondescriptions.get(unitname);
        try {
            document.getElementById(prefix + unitname).setAttribute("data-bs-content", result);
        } catch (err) {
        }
    } else {
        let url = getServer("/unitdescription/" + armydatafile + "/" + unitname);
        let request = new XMLHttpRequest();
        request.open('GET', url);
        request.responseType = 'text';
        request.onload = function () {
            var result = request.response.replaceAll("- ", "<br />- ");
            optiondescriptions.set(unitname, result);
            try {
                document.getElementById(prefix + unitname).setAttribute("data-bs-content", result);
            } catch (err) {
            }
        };
        request.send();
    }
}

function createUnitCategoryMap() {
    unitCategory = new Map();

    for (var c = 0; c < categories.length; c++) {
        let category = categories[c];
        let urlUnits = getServer("/unitlist/" + armydatafile + "/" + category);
        let requestUnits = new XMLHttpRequest();
        requestUnits.open('GET', urlUnits);
        requestUnits.responseType = 'text';
        requestUnits.onload = function () {
            var lines = requestUnits.response.split("\n");
            for (l = 0; l < lines.length; l++) {
                var n = lines[l].indexOf(";");
                var unitName = lines[l].substr(0, n);
                if (unitName.trim() != "") {
                    unitCategory.delete(unitName);
                    unitCategory.set(unitName, category);
                }

            }
        }
        requestUnits.send();
    }
}

function getUnitCosts() {
    let urlUnitCosts = getServer("/unitcost/");
    actualUnit.size = document.getElementById("unitsize").value;

    let req_roster = btoa(createRST());
    let req_unitname = actualUnit.name;
    let req_amount = actualUnit.size;
    let req_selectedoptions = getSelectedOptions();
    let req_replace = "false";
    let req_datafile = armydatafile;

    let searchHash = md5(req_roster + req_unitname + req_amount + req_selectedoptions + req_replace + req_datafile);

    var data = {
        roster: req_roster,
        unitname: req_unitname,
        amount: req_amount,
        selectedoptions: req_selectedoptions,
        replace: req_replace,
        datafile: req_datafile
    }

    if (unitCostMap.has(searchHash)) {
        actualUnit.cost = unitCostMap.get(searchHash);
        document.getElementById("unitcost").innerHTML = "Cost: <b>" + actualUnit.cost + "</b>";
    } else {
        $.post(urlUnitCosts, data, function (result) {
            unitCostMap.set(searchHash, result);
            actualUnit.cost = result;
            document.getElementById("unitcost").innerHTML = "Cost: <b>" + result + "</b>";
        });
    }
}

class cloudFile {
    constructor(uploader, comment, filename, type, file_id, isPrivate, uploaddate, army, comment_cnt) {
        this.uploader = uploader;
        this.comment = comment;
        this.filename = filename;
        this.type = type;
        this.file_id = file_id;
        this.isPrivate = isPrivate;
        this.uploaddate = uploaddate;
        this.army = army;
        this.comment_cnt = comment_cnt;
    }
    ;
}

function decodeHTMLEntities(text) {
    return $("<textarea/>")
            .html(text)
            .text();
}

function listCloudData() {
    var username = document.getElementById("userInput").value;
    var password = document.getElementById("inputPassword").value;

    if (username != "undefined") {
        localStorage.cloudUser = username;
    }
    if (password != "undefined") {
        localStorage.cloudPwd = password;
    }


    $('#cloudLogin').modal('hide');
    getCloudRoster(username, password);
}

function createCloudRosterCheckbox(cloudRosterData) {
    var result = '\
		<div class="form-check">\
		<input class="form-check-input" type="radio" name="flexCloudRoster" id="cloud_' + cloudRosterData.file_id + '">\
		<label class="form-check-label" for="cloud_' + cloudRosterData.file_id + '">\
		' + cloudRosterData.comment + '\
		</label>\
	</div>\
	';

    return result;
}

function downloadCloudRoster(url) {
    let requestFile = new XMLHttpRequest();
    requestFile.responseType = 'text';
    requestFile.open('GET', url);
    requestFile.onload = function () {
        var rstFile = requestFile.response;
        loadRST(rstFile);
        checkRooster();
    }
    requestFile.send();
}

function loadCloudRoster() {
    $('#cloudRosterSelection').modal('hide');
    var rosterList = document.querySelectorAll('*[id^="cloud_"]');
    for (var i = 0; i < rosterList.length; i++) {
        if (rosterList[i].checked == true) {
            var downloadUrl = cloudserver + "download.php?d=" + rosterList[i].id.replaceAll("cloud_", "");
            downloadCloudRoster(downloadUrl);
        }
    }
}

function createRosterSelection(rosters) {
    var result = "";

    for (var i = 0; i < rosters.length; i++) {
        result += createCloudRosterCheckbox(rosters[i]);
    }
    return result;
}

function getCloudRoster(username, password) {
    let urlRosterList = (cloudserver + "ac_list.php");
    var data = {
        username: username,
        password: password,
        army: armyname,
        allusers: 0
    }

    $.post(urlRosterList, data, function (result) {
        if (result.indexOf("User credentials wrong!") == -1 && result.trim() != "") {
            var list = new Array();
            var fileList = decodeHTMLEntities(result).split("\n");
            for (var i = 0; i < fileList.length; i++) {
                var fileLine = fileList[i].trim();
                if (fileLine != "") {
                    var fileInfo = fileLine.split(";");
                    var cloudFileInfo = new cloudFile(fileInfo[0], fileInfo[1], fileInfo[2], fileInfo[3], fileInfo[4], fileInfo[5], fileInfo[6], fileInfo[7], fileInfo[8]);
                    if (cloudFileInfo.army.trim() == armyname.trim()) {
                        list.push(cloudFileInfo);
                    }
                }
            }

            document.getElementById("cloudRosterSelectionTitle").innerHTML = "CreatorCloud Roster (" + armyname + ")";
            document.getElementById("cloudRosterSelectionText").innerHTML = createRosterSelection(list);
            $('#cloudRosterSelection').modal('show');
        } else {
            if (result == "") {
                result = "User credentials wrong!";
            }
            showErrorTost("Error", "<b>CreatorCloud: " + result + "</b>");
        }


    });
}

function checkRooster() {
    let urlCheckRoster = getServer("/checkroster");
    var dataRosterCheck = {
        roster: btoa(createRST())
    }

    document.getElementById('rostercheck').innerHTML = "";
    $.post(urlCheckRoster, dataRosterCheck, function (result) {
        var errors = result.replaceAll("<html>", "").replaceAll("</html>", "".replaceAll("\n", "<br>")).trim();
        if (errors != "") {
            errors = "<b>Errors</b>:<br>" + errors;
        }

        if (errors == "" || rosters.units.length == 0)
            errors = "No errors found.";
        document.getElementById('rostercheck').innerHTML = errors.replace("\n", "<br>");
        getStatistics();

        var marginAdd = document.getElementById("footer").clientHeight;
        document.getElementById("top").style.marginBottom = marginAdd + "px";
    });
}

function getLastSelectedItem() {
    var options = getSelectedOptions();
    var optionList = options.split(";");

    var result = "";
    if (optionList.length > 1) {
        result = optionList[optionList.length - 2];
    }

    return result;
}

function doLiveCheck(selectedItem) {
    var itemOnlyName = removeCosts(selectedItem);
    var optionIdName = "option_" + selectedItem;
    var checked = document.getElementById(optionIdName).checked;

    var itemNameToTransfer = itemOnlyName;
    if (!checked) {
        itemNameToTransfer = getLastSelectedItem();
    }


    let urlCheckRoster = getServer("/livecheck");
    var dataRosterCheck = {
        roster: btoa(createRST()),
        amount: btoa(actualUnit.size),
        unitcost: btoa(actualUnit.cost),
        item: btoa(itemNameToTransfer),
        unitname: btoa(actualUnit.name),
        actualuuid: btoa(actualUnit.uuid),
        options: btoa(getSelectedOptions())
    }


    $.post(urlCheckRoster, dataRosterCheck, function (result) {
        if (result.trim() != "") {
            addToast();
            var myAlert = document.getElementById('toastNotice');
            var bsAlert = new bootstrap.Toast(myAlert);
            var txt = result.trim().replaceAll("\n", "<br>");
            document.getElementById('toastTime').innerHTML = new Date().toLocaleTimeString();
            document.getElementById('toastText').innerHTML = txt;

            var lines = txt.split("<br>");
            var tmpTxt = "";
            for (var l = 0; l < lines.length; l++) {
                var actLine = lines[l].trim();
                if (!actLine.includes("has min occurrence")) {
                    tmpTxt += actLine;
                }
            }

            bsAlert.show();
            if (isAutocorrection() && tmpTxt.length > 0) {
                document.getElementById(optionIdName).checked = false;
            }
        } else {
            destroyToast();
        }
        getUnitCosts();
        setOptionsToAvailableState();
    });

}

function setOptionsToAvailableState() {
    if (isAutocorrection()) {
        var available = getAvailableOptions(armyname, actualUnit.name, getSelectedOptions(), actualUnit.size).replace("  ", " ");
        setOptionState(available);
    } else {
        enableAllOptions();
    }
}


function openAsPageInNewTab(pageContent) {
    var myWindow = window.open("about:blank", "_blank");
    myWindow.document.write(pageContent);
}

function createHtml(status) {
    let urlHtmlRoster = getServer("/createhtml");
    var dataHtmlCreation = {
        roster: btoa(createRST())
    }

    $.post(urlHtmlRoster, dataHtmlCreation, function (result) {
        var htmlDocument = result;

        if (status == "show") {
            openAsPageInNewTab(htmlDocument);
        } else {
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlDocument));
            element.setAttribute('download',  getFilename("html"));

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        }
    });
}

function getFilename(extention) {
    var fileName = document.getElementById("rosterName").value;
    saveSession();
    var n = fileName.indexOf(".");
    if (n > -1) { fileName = fileName.substr(0, n); }
    return fileName + "." + extention;
}

function createPdf(status) {
    let urlHtmlRoster = getServer("/createpdf");
    var dataHtmlCreation = {
        roster: btoa(createRST())
    }

    $.post(urlHtmlRoster, dataHtmlCreation, function (result) {
        var pdfDocument = result;

        if (status == "show") {
            openAsPageInNewTab(pdfDocument);
        } else {
            var element = document.createElement('a');
            getFilename();
            element.setAttribute('href', 'data:application/pdf;base64,' + encodeURIComponent(result));
            element.setAttribute('download', getFilename("pdf"));

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        }
    });
}

function createAndShowHtml() {
    var rst = btoa(createRST());
    var url = getServer("/html") + "/" + rst;
    window.open(url);
    saveSession();
}

function createAndShowPDF() {
    var rst = btoa(createRST());
    var url = getServer("/pdf") + "/" + rst;
    window.open(url);
    saveSession();
}

function round(x, n) {
    var a = Math.pow(10, n);
    var result = (Math.round(x * a) / a).toFixed(n);

    if (isNaN(x)) {
        result = "0.00";
    }
    return result;
}

function getStatistics() {
    let urlCheckStatistics = getServer("/statistics");
    var dataRosterStatistic = {
        roster: btoa(createRST())
    }

    $.post(urlCheckStatistics, dataRosterStatistic, function (result) {
        var statistics = result.trim().split("\n");

        for (var i = 0; i < statistics.length; i++) {
            var items = statistics[i].trim().split(";");
            if (items[0].trim() == "calculatedRoster") {
                var rst = items[1].trim();
                //loadRST(atob(rst));
                updateRST(atob(rst));
                saveSession();
                createRosterTable();
            }
        }

        var calculation = "<table class=\"table myDivColor rounded\">";
        var sumCosts = rosters.getCostSum();

        var allCosts = 0.0;
        for (var i = 0; i < statistics.length; i++) {
            var items = statistics[i].trim().split(";");
            if (items[0].trim() != "calculatedRoster") {
                allCosts += parseFloat(items[1]);
            }
        }

        for (var i = 0; i < statistics.length; i++) {
            var items = statistics[i].trim().split(";");

            if (items[0].trim() != "calculatedRoster") {
                if (items.length > 0) {
                    calculation += "<tr><td>" + items[0] + "</td><td>" + items[1] + "</td><td>" + round((items[1] / allCosts) * 100, 2) + "%</td></tr>";
                }
            }
        }

        calculation += "<tr><td>Complete</td><td><b>" + sumCosts + "</b></td><td></td></tr>";
        calculation += "</table>";
        document.getElementById("calculation").innerHTML = calculation;
        document.getElementById("footerCosts").innerHTML = "Costs: <b>" + sumCosts + "p</b>";
    });
}

function editUnit(uuid) {
    editMode = true;
    actualUnit = rosters.getUnit(uuid);
    getUnitOptions(actualUnit.name);
    scrollToElement("optionlist");
}

function deselectAllOptions() {
    hideAllPopover();
    var optionList = document.querySelectorAll('*[id^="option_"]');
    for (var o = 0; o < optionList.length; o++) {
        document.getElementById(optionList[o].id).checked = false;
    }

    destroyToast();
    getUnitCosts();
    setOptionsToAvailableState();
}

function hideAllPopover() {
    $('.popover').popover('hide');
}

function createCategoryUnits(parseUnits, selectedUnit) {
    var units = new Array();
    if (categoryUnits.has(parseUnits)) {
        units = categoryUnits.get(parseUnits);
    } else {
        for (let i = 0; i < parseUnits.length; i++) {
            if ((i % 5) == 0 && parseUnits[i].trim() != "") {
                let unitString = parseUnits[i].trim() + " @ " + parseUnits[i + 1].trim();
                if (parseUnits[i + 2].trim() != "0") {
                    unitString += " + Nx " + parseUnits[i + 2].trim();
                }
                mapMinSize.delete(parseUnits[i].trim());
                mapMaxSize.delete(parseUnits[i].trim());
                mapMinSize.set(parseUnits[i].trim(), parseUnits[i + 3]);
                mapMaxSize.set(parseUnits[i].trim(), parseUnits[i + 4]);

                units.push(unitString);
            }
        }
        categoryUnits.set(parseUnits, units);
    }
    document.getElementById("categoryUnits").innerHTML = createUnits(units, selectedUnit);
    hideAllPopover();
}

function getCategoryUnits(category, selectedUnit) {
    let urlUnits = getServer("/unitlist/" + armydatafile + "/" + category);
    let requestUnits = new XMLHttpRequest();
    requestUnits.open('GET', urlUnits);
    requestUnits.responseType = 'text';
    requestUnits.onload = function () {
        var parseUnits = requestUnits.response.split(";");
        categoryUnitMap.set(category, parseUnits);
        createCategoryUnits(parseUnits, selectedUnit)
    }
    if (categoryUnitMap.has(category)) {
        var parseUnits = categoryUnitMap.get(category);
        createCategoryUnits(parseUnits, selectedUnit);
    } else {
        requestUnits.send();
    }
}

function getSetArmyName() {
    let urlOptions = getServer("/armyinfo/" + armydatafile);
    let requestArmyInfo = new XMLHttpRequest();
    requestArmyInfo.open('GET', urlOptions);
    requestArmyInfo.responseType = 'text';
    requestArmyInfo.onload = function () {
        var info = requestArmyInfo.response;
        document.getElementById("armyinfo").innerHTML = info;
        var n = info.indexOf(" (v");
        armyname = info.substr(0, n);
        document.getElementById("rosterName").value = armyname;
        loadSession();
        getCategoriesFromAC();
    }
    requestArmyInfo.send();
}

function createAutocorrationBox() {
    var popover = '&nbsp;&nbsp;<a tabindex="0" role="button" data-bs-trigger="focus" class="bi bi-info-circle" data-bs-html="true" data-bs-toggle="popover" title="Autocorrect" data-bs-content="If autocorrect is disabled, errors will not automatically disable the option that caused the error. This is necessary for circle links (a needs b and b needs a or type X has min occurrence>0)." id="popAutoCorrection"></a>';
    var result = '<div class="form-check">';
    result += '<input class="form-check-input" type="checkbox" value="" id="checkAutoCorrection" checked onclick="setOptionsToAvailableState();">';
    result += '<label class="form-check-label" for="checkAutoCorrection">';
    result += 'Autocorrect</label>';
    result += popover;
    result += '</div>';

    return result;
}

function isAutocorrection() {
    return document.getElementById("checkAutoCorrection").checked;
}

function parseUnitOptions(unitname, parseOptions) {
    var options = new Array();
    var checked = new Array();
    var trimUnitName = unitname.trim();
    var allOptions = new Array();
    var actType = "";
    var oldType = "";
    var min = mapMinSize.get(trimUnitName);
    var max = mapMaxSize.get(trimUnitName);
    var optionList = "\
	<div>\
		<div class='row justify-content-between'>\
			<div class='col-8 float-left'><h5>" + trimUnitName + "&nbsp;&nbsp;" + createUnitHeader(trimUnitName, "desc_") + "</h5>" + createAutocorrationBox() + "</div>\
			<div class='col-3 float-right' id=\"unitcost\"></div>\
		</div>\
		<div class='row justify-content-between'>\
			<div class='col-8 float-left' id=\"amount\" style=\"width:200px;float:left;z-index: 0;\">Size:<input style=\"z-index: 0;\" id=\"unitsize\" type=\"number\" onchange=\"getUnitCosts();\" value=\"" + mapMinSize.get(unitname.trim()) + "\" min=\"" + mapMinSize.get(unitname.trim()) + "\" max=\"" + mapMaxSize.get(unitname.trim()) + "\" step=\"1\"/>\
		   </div>\
	  </div>\
	</div><br>";

    var optionCount = (parseOptions.length-1)/4;
    var columnDiv = "<div style='margin-left:-22px;'>";
    if (optionCount>15) {
        columnDiv = "<div style='column-width:30em; column-gap:0; margin-left:-22px;'>"
    }
    

    optionList += "<div class='container-fluid'>"+columnDiv;

    for (let i = 0; i < parseOptions.length; i++) {
        if ((i % 4) == 0 && parseOptions[i].trim() != "") {
            actType = parseOptions[i].trim();
            if (actType != oldType && oldType != "") {
                optionList += createOption(oldType, options);
                options = new Array();
            }
            let unitString = parseOptions[i + 1].trim() + " @ " + parseOptions[i + 2].trim();
            options.push(unitString);
            if (parseOptions[i + 3] == "true") {
                checked.push(unitString);
            }
            allOptions.push(unitString);
            oldType = actType;
        }
    }
    if (options.length > 0) {
        optionList += createOption(oldType, options);
    }
    optionList += "</div></div>";

    document.getElementById("unitOptions").innerHTML = optionList;

    if (editMode == true) {
        var options = actualUnit.options.split(";");

        var listOptions = document.querySelectorAll('*[id^="option_"]');

        for (var i = 0; i < options.length; i++) {
            for (var o = 0; o < listOptions.length; o++) {
                var optionName = removeCosts(listOptions[o].id.replaceAll("option_", ""));

                if (optionName == options[i]) {
                    document.getElementById(listOptions[o].id).checked = true;
                }
            }

        }
        document.getElementById("unitsize").value = actualUnit.size;
        editMode = false;

    } else {
        for (var i = 0; i < checked.length; i++) {
            document.getElementById("option_" + checked[i]).checked = true;
        }
        actualUnit = new Unit(unitCategory.get(unitname.trim()), unitname.trim(), mapMinSize.get(unitname.trim()), "", "0", UUID.generate(), "", "");
    }
    $("input[type='number']").inputSpinner();

    getUnitCosts();
    setOptionsToAvailableState();
    getDescriptionForUnit(unitname.trim(), "desc_");
    for (var o = 0; o < allOptions.length; o++) {
        getDescriptionForOption(allOptions[o], "desc_");
    }
    initPopover();
    setElementVisible('#loading', false);
}

function getUnitOptions(unitname) {
    hideAllPopover();
    setElementVisible('#loading', true);
    let categoryOfUnit = unitCategory.get(unitname);
    showUnits(categoryOfUnit, unitname);
    let urlOptions = getServer("/optionlist/" + armydatafile + "/" + unitname);
    let requestOptions = new XMLHttpRequest();
    requestOptions.open('GET', urlOptions);
    requestOptions.responseType = 'text';
    requestOptions.onload = function () {
        var parseOptions = requestOptions.response.split(";");
        unitOptions.set(unitname, parseOptions);
        parseUnitOptions(unitname, parseOptions);
    }
    if (unitOptions.has(unitname)) {
        var parseOptions = unitOptions.get(unitname);
        parseUnitOptions(unitname, parseOptions);
    } else {
        requestOptions.send();
    }

    scrollToElement("optionlist");
}

function addActualUnitToRoster(status) {
    actualUnit.options = getSelectedOptions();
    actualUnit.size = document.getElementById("unitsize").value;
    getUnitCosts();
    if (status == "replace") {
        rosters.replaceUnit(actualUnit.uuid, actualUnit);
    } else {
        tmpUnit = new Unit(actualUnit.category, actualUnit.name, actualUnit.size, actualUnit.options, actualUnit.cost, UUID.generate(), "", actualUnit.comment, "");
        actualUnit = tmpUnit;
        rosters.addUnit(tmpUnit);
    }
    checkRooster();
    saveSession();
}

function createActionButton(title, biimage, action, specialAttributes, bgcolor) {
    if (bgcolor == "" || bgcolor == null) {
        bgcolor = "#f4b477";
    }
    var result = "<button type=\"button\" class=\"btn\" " + specialAttributes + " title=\"" + title + "\" style=\"background-color:" + bgcolor + ";\" onclick=\"" + action + "\"><i class=\"bi " + biimage + "\"></i></button>\n";

    return result;
}

function createRosterTable() {
    var tbl = "<table class=\"table myDivColor\"><thead><tr><th>Unitname</th><th>Option</th><th>#</th><th>Cost</th></tr></thead><tbody id='sortable1'>";

    for (var i = 0; i < rosters.units.length; i++) {
        var options = rosters.units[i].options.split(";");
        var printOptions = "";
        for (var l = 0; l < options.length; l++) {
            if (options[l].trim() != "") {
                var popover = '<a tabindex="0" class="bi bi-info-circle" role="button" data-bs-html="true" data-bs-toggle="popover" data-bs-trigger="focus" title="' + options[l] + '" data-bs-content="Loading..." id="' + rosters.units[i].uuid + '_' + options[l] + '"></a>';
                printOptions += options[l] + " " + popover + "<br>";
            }
        }

        var isAttachment = (rosters.units[i].refuuid != "");
        var hasAttachment = (rosters.getAttatchedUnits(rosters.units[i].uuid).length > 0);

        var buttonText = "";
        buttonText += createActionButton("Delete", "bi-trash-fill", "deleteUnitConfirmation('" + rosters.units[i].uuid + "');");
        buttonText += "&nbsp;&nbsp;";
        buttonText += createActionButton("Edit", "bi-pencil-fill", "editUnit('" + rosters.units[i].uuid + "');");
        if (!isAttachment) {
            buttonText += "&nbsp;&nbsp;" + createActionButton("Attach unit", "bi-folder-plus", "", "data-bs-toggle=\"modal\" data-bs-target=\"#addAttachment\" onclick=\"selectAttachment('" + rosters.units[i].uuid + "');\"", "#d9f58d");
        }
        if (!hasAttachment && isAttachment) {
            buttonText += "&nbsp;&nbsp;" + createActionButton("Detach unit", "bi-folder-minus", "removeAttachment('" + rosters.units[i].uuid + "');", "", "#fc928e");
        }

        if (rosters.units[i].inactive == "X") {
            buttonText += "&nbsp;&nbsp;" + createActionButton("Enable Unit", "bi-toggle-off", "enableUnit('" + rosters.units[i].uuid + "');", "", "#fc928e");
        } else {
            buttonText += "&nbsp;&nbsp;" + createActionButton("Disable Unit", "bi-toggle-on", "disableUnit('" + rosters.units[i].uuid + "');", "", "#d9f58d");
        }

        var moveButtons = "";
        if (!isAttachment) {
            moveButtons += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<div style='float:left;'>";
            moveButtons += createActionButton("Move up", "bi-box-arrow-up", "moveUnitUp('" + rosters.units[i].uuid + "');", "", "");
            moveButtons += createActionButton("Move up", "bi-box-arrow-down", "moveUnitDown('" + rosters.units[i].uuid + "');", "", "");
            moveButtons += "</div>";
        }


        var attText = "";
        if (rosters.units[i].refuuid != "") {
            attText = " (attached to <i>" + rosters.getUnit(rosters.units[i].refuuid).name + "</i>)";
        }

        if (rosters.units[i].inactive == "X") {
            tbl += "<tr style=\"border-style:normal;text-decoration:line-through;opacity:0.5;\">\n";
        } else {
            tbl += "<tr style=\"border-style:normal;\">\n";
        }
        tbl += "<td>" + rosters.units[i].name + attText + " " + createUnitHeader(rosters.units[i].name, rosters.units[i].uuid + "_") + "</td>\n";
        tbl += "<td>" + printOptions + "</td>\n";
        tbl += "<td>" + rosters.units[i].size + "</td>\n";
        tbl += "<td>" + rosters.units[i].cost + "</td>\n";
        tbl += "</tr>\n";
        tbl += "<tr class='nosort button' style=\"border-style:hidden; border-bottom: 1pt solid darkgray;\">\n";
        tbl += "<td colspan=\"4\"><div style='float:left'>" + buttonText + "</div><div style='float:right'>" + moveButtons + "</div></td>\n";
        tbl += "</tr>\n";
    }
    tbl += "</tbody></table>";
    document.getElementById("rosterTable").innerHTML = tbl;
    updateOptions();
}

function disableUnit(uuid) {
    rosters.setInactiveStatus(uuid, "X");
    checkRooster();
}

function enableUnit(uuid) {
    rosters.setInactiveStatus(uuid, "");
    checkRooster();
}

function updateOptions() {
    for (var i = 0; i < rosters.units.length; i++) {
        var options = rosters.units[i].options.split(";");
        getDescriptionForUnit(rosters.units[i].name, rosters.units[i].uuid + "_");
        for (var l = 0; l < options.length; l++) {
            if (options[l] != "") {
                getDescriptionForOption(options[l], rosters.units[i].uuid + "_");
            }
        }
    }

    initPopover();
}

function deleteUnitConfirmation(uuid) {
    var unitname = rosters.getUnit(uuid).name;
    confirm(deleteUnit, uuid, "Should unit '" + unitname + "' be deleted?");
}

function deleteUnit(uuid) {
    if (rosters.getUnitPosition(uuid) > -1) {
        rosters.deleteUnit(uuid);
        rosters.fixAttachments();
        checkRooster();
    }
}

function handleFileSelect(e) {
    var files = e.target.files;
    if (files.length < 1) {
        alert('select a file...');
        return;
    }
    var file = files[0];
    
    var fileName = file.name;
    var n = fileName.indexOf(".");
    if (n > -1) { fileName = fileName.substr(0, n); }
    document.getElementById("rosterName").value = fileName;
    saveSession();
    
    var reader = new FileReader();
    reader.onload = onFileLoaded;
    reader.readAsDataURL(file);
}

function onFileLoaded(e) {
    var match = /^data:(.*);base64,(.*)$/.exec(e.target.result);
    if (match == null) {
        throw 'Could not parse result'; // should not happen
    }
    var mimeType = match[1];
    var content = match[2];

    loadRST(atob(content));
    saveSession();
    checkRooster();
}

$(function () {
    $('#import-pfx-button').click(function (e) {
        $('#file-input').click();
    });
    $('#file-input').change(handleFileSelect);
});

function downloadRoster() {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(createRST()));
    element.setAttribute('download',  getFilename("rst"));

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function attachUnit(attachmentUUID, mainUUID) {
    var mainUnit = rosters.getUnit(mainUUID);
    var attatchedUnit = rosters.getUnit(attachmentUUID);

    attatchedUnit.refuuid = mainUUID;
    rosters.replaceUnit(attachmentUUID, attatchedUnit);

    var posMain = rosters.getUnitPosition(mainUUID);
    var posAttachment = rosters.getUnitPosition(attachmentUUID);

    rosters.fixAttachments();
    saveSession();
}


function generateAttachmentOption(name, uuid) {
    var result = '\
		<div class="form-check">\
		<input class="form-check-input" type="radio" name="flexRadioDefault" id="attach_' + name + '" uuid="' + uuid + '">\
		<label class="form-check-label" for="attach_' + name + '">\
			' + name + '\
		</label>\
		</div>\
		';

    return result;
}


function getAttachableUnits(mainUUID) {
    var result = "";
    for (var i = 0; i < rosters.units.length; i++) {
        if (rosters.units[i].uuid != mainUUID) {
            var attachmentArry = rosters.getAttatchedUnits(rosters.units[i].uuid);
            if (attachmentArry.length == 0 && rosters.units[i].refuuid == "") {
                result += generateAttachmentOption(rosters.units[i].name, rosters.units[i].uuid);
            }
        }

    }

    return result;
}

function selectAttachment(mainUUID) {
    var unitname = rosters.getUnit(mainUUID).name;
    var unitlist = getAttachableUnits(mainUUID);
    document.getElementById("attachlist").innerHTML = unitlist;
    document.getElementById("titleAttachment").innerHTML = "Attach to <b>" + unitname + "</b>";
    document.getElementById("addAttachment").setAttribute("uuid", mainUUID);
}

function saveAttachment() {
    var optionList = document.querySelectorAll('*[id^="attach_"]');
    var mainUUID = document.getElementById("addAttachment").getAttribute("uuid");
    var selected = "";

    for (var i = 0; i < optionList.length; i++) {
        if (optionList[i].checked) {
            selected = optionList[i].getAttribute("uuid");
        }
    }

    if (selected != "" && selected != null) {
        attachUnit(selected, mainUUID);
    }

    $('#addAttachment').modal('hide');
    checkRooster();
    createRosterTable();
}

function removeAttachment(uuid) {
    if (rosters.getUnit(uuid).refuuid != "") {
        rosters.getUnit(uuid).refuuid = "";
        rosters.moveUnit(uuid, "");
        checkRooster();
        createRosterTable();
    }
}

function moveUnitUp(uuid) {
    rosters.moveUnit(uuid, "up")
    createRosterTable();
}

function moveUnitDown(uuid) {
    rosters.moveUnit(uuid, "down")
    createRosterTable();
}

function createBBcode() {
    var rstPlain = createRST();
    if (!rstPlain.trim().endsWith("###")) {
        var rst = btoa(rstPlain);
        var url = getServer("/bbcode") + "/" + rst;
        window.open(url);
        saveSession();
    }
}

function createTextRoster() {
    var rstPlain = createRST();
    if (!rstPlain.trim().endsWith("###")) {
        var rst = btoa(rstPlain);
        var url = getServer("/text") + "/" + rst;
        window.open(url);
        saveSession();
    }
}

function clearRosterConfirmation() {
    confirm(clearRoster, null, "Should roster be cleared?");
}

function clearRoster(noCalculate) {
    rosters = new Roster();
    localStorage.rosters = "";
    createRosterTable();
    if (noCalculate != "true") {
        getStatistics();
        checkRooster();
    }
    saveSession();
}

function confirm(callback, param, text) {
    document.getElementById('confirmText').innerHTML = text;
    $("#confirmBox").modal('show');

    $("#modal-btn-yes").on("click", function () {
        callback(param);
        $("#confirmBox").modal('hide');
    });

    $("#modal-btn-no").on("click", function () {
        $("#confirmBox").modal('hide');
    });
}

function destroyToast() {
    var elem = document.getElementById("mainToast");
    if (elem != null) {
        elem.parentNode.removeChild(elem);
    }
}

function showErrorTost(title, errortext) {
    destroyToast();
    addToast(title);
    var myAlert = document.getElementById('toastNotice');
    document.getElementById('toastTime').innerHTML = new Date().toLocaleTimeString();
    document.getElementById('toastText').innerHTML = errortext;
    var bsAlert = new bootstrap.Toast(myAlert);
    bsAlert.show();
}

function addToast(title) {
    var headerTitle = title;
    if (typeof (headerTitle) == "undefined") {
        headerTitle = "Validation";
    }
    var toast = '\
			<div style="z-index: 2000;" id="mainToast">\
			<div class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false"\
				data-bs-animation="true" id="toastNotice" aria-disabled="true"\
				style="position:fixed; top:70px; left:5%; width:90%; background-color:#f4b477;  border: 3px solid red;">\
				<div class="toast-header">\
					<img src="pictures/ArmyCreator.png" class="rounded me-2" width="25px">\
					<strong class="me-auto" id="toastHederText">' + headerTitle + '</strong>\
					<small class="text-muted" id="toastTime"></small>\
					<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close" onclick="destroyToast();"></button>\
				</div>\
				<div class="toast-body" id="toastText">\
					Message\
				</div>\
			</div>\
		</div>\
	';

    document.getElementById("placeToast").innerHTML = toast;
}

function scrollToElement(id) {
    //var isAlreadyOnScreen = +elementIsVisibleInViewport(document.getElementById(id), true)
    //if (isAlreadyOnScreen == 0) {location.href = "#" + id;}

    location.href = "#" + id;
}

const elementIsVisibleInViewport = (el, partiallyVisible = false) => {
    const { top, left, bottom, right } = el.getBoundingClientRect();
    const { innerHeight, innerWidth } = window;
    return partiallyVisible
      ? ((top > 0 && top < innerHeight) ||
          (bottom > 0 && bottom < innerHeight)) &&
          ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
      : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
  };

function uploadRostertoCloud() {
    let urlUploadRoster = (cloudserver + "ac_upload.php");
    let request = new XMLHttpRequest();

    var rstData = createRST();
    var username = document.getElementById("userInputUpload").value;
    var password = document.getElementById("inputPasswordUpload").value;

    if (username != "undefined") {
        localStorage.cloudUser = username;
    }
    if (password != "undefined") {
        localStorage.cloudPwd = password;
    }

    var filename = document.getElementById("inputFilenamedUpload").value;
    if (filename.endsWith(".rst") == false) {
        filename += '.rst';
    }

    var comment = document.getElementById("descriptionUpload").value;
    var shareWithOthersUpload = document.getElementById("shareWithOthersUpload").checked;
    var notshared = "";

    if (shareWithOthersUpload == true) {
        notshared = 'on';
    } else {
        notshared = '';
    }

    if (rosters.units.length == 0 || rstData.length == 0 || username.length == 0 || password.length == 0 || filename.length == 0 || comment.length == 0) {
        $('#cloudLoginUpload').modal('hide');
        showErrorTost("Information", "<b>CreatorCloud Upload:</b> All fields must be filled in and units must be present in the roster.");
    } else {
        var formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('comment', comment);
        formData.append('notshared', notshared);
        formData.append('file', new File([new Blob([rstData])], filename));

        request.open('POST', urlUploadRoster);
        request.responseType = 'text';
        request.onload = function () {
            var result = request.response;
            $('#cloudLoginUpload').modal('hide');
            showErrorTost("Information", "<b>CreatorCloud Upload:</b> " + result);
        }

        request.send(formData);
    }
}

function getAvailableOptions(armyname, unitname, options, amount) {
    let requestData = "armyname=" + btoa(armyname) + "&unitname=" + btoa(unitname) + "&options=" + btoa(options) + "&amount=" + btoa(amount);

    if (availableOptionsMap.has(requestData)) {
        return availableOptionsMap.get(requestData);
    } else {
        let urlAvailableOptions = getServer("/availableoptions");
        let request = new XMLHttpRequest();

        request.open('POST', urlAvailableOptions, false);
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        request.send(requestData);

        if (request.status === 200) {
            availableOptionsMap.set(requestData, request.responseText);
            return (request.responseText);
        } else {
            availableOptionsMap.set(requestData, "");
            return "";
        }
    }
}

function mapArmyname() {
    sessionStorage.removeItem("rosters");
    rosters = new Roster();

    if (typeof list !== 'undefined') {
        if (list !== null) {
            for (var i = 0; i < list.armies.length; i++) {
                if (list.armies[i].armyName.toLowerCase().trim() == armyname.toLowerCase().trim()) {
                    armydatafile = list.armies[i].dataFile;
                    init();
                }
            }
        }
    }
}

function initFromRST(rstFile) {
    armyname = getArmyNameFromRST(rstFile);
    if (list === undefined || list === null) {
        let url = getServer("/armylist");
        let request = new XMLHttpRequest();
        request.open('GET', url);
        request.responseType = 'text';
        request.onload = function () {
            createArmyList(request);
            mapArmyname();
            loadRST(rstFile);
            checkRooster();
        }
    } else {
        mapArmyname();
        loadRST(rstFile);
        checkRooster();
    }
}

function loadRosterByCloudID(cloudID) {
    let url = getServer("/armylist");
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'text';
    request.onload = function () {
        createArmyList(request);
        var downloadUrl = cloudserver + "download.php?d=" + cloudID.trim();
        let requestFile = new XMLHttpRequest();
        requestFile.responseType = 'text';
        requestFile.open('GET', downloadUrl);
        requestFile.onload = function () {
            var rstFile = requestFile.response;
            initFromRST(rstFile);
        }
        requestFile.send();
    };
    request.send();
}


function md5(str) {
    var xl;

    var rotateLeft = function (lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    };

    var addUnsigned = function (lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    };

    var _F = function (x, y, z) {
        return (x & y) | ((~x) & z);
    };
    var _G = function (x, y, z) {
        return (x & z) | (y & (~z));
    };
    var _H = function (x, y, z) {
        return (x ^ y ^ z);
    };
    var _I = function (x, y, z) {
        return (y ^ (x | (~z)));
    };

    var _FF = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _GG = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _HH = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _II = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var convertToWordArray = function (str) {
        var lWordCount;
        var lMessageLength = str.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = new Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    };

    var wordToHex = function (lValue) {
        var wordToHexValue = '',
                wordToHexValue_temp = '',
                lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            wordToHexValue_temp = '0' + lByte.toString(16);
            wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
        }
        return wordToHexValue;
    };

    var utf8_encode = function (string) {
        string = (string + '').replace(/\r\n/g, "\n").replace(/\r/g, "\n");

        var utftext = "";
        var start, end;
        var stringl = 0;

        start = end = 0;
        stringl = string.length;
        for (var n = 0; n < stringl; n++) {
            var c1 = string.charCodeAt(n);
            var enc = null;

            if (c1 < 128) {
                end++;
            } else if ((c1 > 127) && (c1 < 2048)) {
                enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
            } else {
                enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
            }
            if (enc != null) {
                if (end > start) {
                    utftext += string.substring(start, end);
                }
                utftext += enc;
                start = end = n + 1;
            }
        }

        if (end > start) {
            utftext += string.substring(start, string.length);
        }

        return utftext;
    }

    var x = [],
            k, AA, BB, CC, DD, a, b, c, d, S11 = 7,
            S12 = 12,
            S13 = 17,
            S14 = 22,
            S21 = 5,
            S22 = 9,
            S23 = 14,
            S24 = 20,
            S31 = 4,
            S32 = 11,
            S33 = 16,
            S34 = 23,
            S41 = 6,
            S42 = 10,
            S43 = 15,
            S44 = 21;

    str = utf8_encode(str);
    x = convertToWordArray(str);
    a = 0x67452301;
    b = 0xEFCDAB89;
    c = 0x98BADCFE;
    d = 0x10325476;

    xl = x.length;
    for (k = 0; k < xl; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }

    var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);

    return temp.toLowerCase();
}

