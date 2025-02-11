let list = null;

class Army {
    constructor(gameSystem, armyName, dataFile) {
        this.gameSystem = gameSystem;
        this.armyName = armyName;
        this.dataFile = dataFile;
    }
}

class ArmyList {
    constructor() {
        this.armies = [];
    }

    getGameSystems() {
        let gamesystems = [];
        for (var i = 0; i < this.armies.length; i++) {
            var game = this.armies[i].gameSystem;
            if (!gamesystems.includes(game)) {
                gamesystems.push(game);
            }
        }
        return gamesystems;
    }

    addArmy(gameSystem, armyName, dataFile) {
        var army = new Army(gameSystem, armyName, dataFile);
        this.armies.push(army);
    }

    getArmiesForGameSystem(gameSystem) {
        let listOfArmies = [];
        for (var i = 0; i < this.armies.length; i++) {
            if (this.armies[i].gameSystem == gameSystem) {
                listOfArmies.push(this.armies[i].armyName);
            }
        }

        return listOfArmies;
    }

    getArmiesForAll() {
        let listOfArmies = [];
        for (var i = 0; i < this.armies.length; i++) {
            listOfArmies.push(this.armies[i].armyName);
        }

        return listOfArmies;
    }

    getDatafile(gameSystem, armyName) {
        var result = "";
        for (var i = 0; i < this.armies.length; i++) {
            if (this.armies[i].gameSystem == gameSystem && this.armies[i].armyName == armyName) {
                result = this.armies[i].dataFile;
                break;
            }
        }

        return result;
    }

    getDatafileForArmy(armyName) {
        var result = "";
        for (var i = 0; i < this.armies.length; i++) {
            if (this.armies[i].armyName == armyName) {
                result = this.armies[i].dataFile;
                break;
            }
        }

        return result;
    }
}

function createArmyList(request) {
    list = new ArmyList();
    var armies = request.response.split("\n");
    for (var a = 0; a < armies.length; a++) {
        if (armies[a].trim() != "") {
            var items = armies[a].split(";");
            if (items[1].trim().toLowerCase().indexOf("general items") == -1) {
                list.addArmy(items[0].trim(), items[1].trim(), items[4].trim());
            }
        }
    }
}