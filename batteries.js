(function() {
    // 1. Define element objects according to Sandboxels Engine API
    elements.charged_battery = {
        name: "Charged Battery",
        color: ["#9c6c25", "#00ff00"],
        behavior: behaviors.WALL,
        category: "machines",
        charge: 1,
        conduct: 1,
        colorOn: "#00ff00",
        tempHigh: 1455.5,
        stateHigh: "molten_steel",
        tick: function(pixel) {
            // Actively charge adjacent conductive pixels
            pixel.charge = 1;
            for (var i = 0; i < adjacentCoords.length; i++) {
                var coord = adjacentCoords[i];
                var x = pixel.x + coord[0];
                var y = pixel.y + coord[1];
                if (!isEmpty(x, y, true)) {
                    var neighbor = pixelMap[x][y];
                    if (elements[neighbor.element].conduct) {
                        neighbor.charge = 1;
                    }
                }
            }
        }
    };

    elements.low_battery = {
        name: "Low Battery",
        color: ["#9c6c25", "#4fb613"],
        behavior: behaviors.WALL,
        category: "machines",
        charge: 0.5,
        conduct: 0.75,
        colorOn: "#4fb613",
        tempHigh: 1455.5,
        stateHigh: "molten_steel",
        tick: function(pixel) {
            if (Math.random() < 0.5) {
                pixel.charge = 1;
            }
        }
    };

    elements.dead_battery = {
        name: "Dead Battery",
        color: "#9c6c25",
        behavior: behaviors.WALL,
        category: "machines",
        charge: 0,
        conduct: 0.1,
        tempHigh: 1455.5,
        stateHigh: "molten_steel"
    };

    // 2. Register keys into elementOrder if missing
    var batKeys = ["charged_battery", "low_battery", "dead_battery"];
    for (var i = 0; i < batKeys.length; i++) {
        if (typeof elementOrder !== "undefined" && !elementOrder.includes(batKeys[i])) {
            elementOrder.push(batKeys[i]);
        }
    }

    // 3. Force rebuild of the UI category buttons
    if (typeof selectCategory === "function") {
        selectCategory("machines");
    } else if (typeof showCategories === "function") {
        showCategories();
    }
})();

    elements.dead_battery = {
        color: "#9c6c25",
        behavior: [
            "XX|XX|XX",
            "XX|XX|XX",
            "XX|XX|XX",
        ],
        behaviorOn: [
            "XX|XX|XX",
            "XX|CH:low_battery%0.045|XX",
            "XX|XX|XX",
        ],
        colorOn: "#699e19",
        category: "machines",
        tempHigh: 1455.5,
        stateHigh: ["molten_steel","explosion","acid_gas"],
        charge: 0.5,
        conduct: 0.5,
    };

    // 2. Radio & Waves
    elements.radio_broadcaster = {
        color: "#78784c",
        behavior: behaviors.WALL,
        behaviorOn: [
            "XX|SH AND CR:radio_wave AND CR:radio_wave|XX",
            "SH AND CR:radio_wave AND CR:radio_wave|XX|SH AND CR:radio_wave AND CR:radio_wave",
            "XX|SH AND CR:radio_wave AND CR:radio_wave|XX",
        ],
        colorOn: "#ffff59",
        category: "machines",
        tempHigh: 1455.5,
        stateHigh: ["molten_steel","explosion","acid_gas"],
        conduct: 1
    };

    elements.radio_receiver = {
        color: "#78784c",
        behavior: behaviors.WALL,
        reactions: {radio_wave: {elem2: "electric", chance: 0.75}},
        colorOn: "#ffff59",
        category: "machines",
        tempHigh: 1455.5,
        stateHigh: ["molten_steel","explosion","acid_gas"],
        conduct: 1
    };

    elements.radio_wave = {
        color: ["#000000"],
        behavior: behaviors.BOUNCY,
        behaviorOn: [
            ["XX","CL","XX"],
            ["CL","DL%5","CL"],
            ["XX","CL","XX"]
        ],
        colorOn: "#000000",
        tick: function(pixel){
            if (typeof currentElement !== "undefined" && currentElement == "radio_wave"){
                pixel.color = "rgb(15, 15, 15)";
            } else {
                pixel.color = "rgba(0, 0, 0, -1)";
            }
        },
        category: "energy",
        reactions: {electric: {elem1: null, elem2: null, chance: 0.5}},
        density: 1,
        conduct: 0.01,
        ignore: ["radio_wave"],
    };

    // 3. Weapons
    elements.e_nuke = {
        desc: "Works like a nuke but needs power to explode",
        color: (elements.nuke && elements.nuke.color) ? elements.nuke.color : "#00ff00",
        hardness: 0.5,
        state: "solid",
        behavior: behaviors.POWDER,
        conduct: 1,
        category: "weapons",
        behaviorOn: [
            "XX|XX|XX",
            "XX|XX|XX",
            "M2|M1 AND EX:60>plasma,plasma,plasma,plasma,radiation,rad_steam|M2",
        ],
        name: "E-Nuke",
    };

    elements.drill = {
        color: ["#a7ab81","#a3a685", "#9ba252"],
        tick: function(pixel) {
            for (var i = 0; i < 3; i++) {
                var skip = false;
                if (!isEmpty(pixel.x,pixel.y+1,true)) {
                    var p = pixelMap[pixel.x][pixel.y+1];
                    if (p.element === "drill") { skip = true; }
                    if (Math.random() < 0.9 && elements[p.element] && elements[p.element].hardness !== 1) {
                        deletePixel(p.x,p.y);
                    }
                }
                if (!tryMove(pixel,pixel.x,pixel.y+1,["flash","smoke"]) && !skip) {
                    explodeAt(pixel.x,pixel.y,5,"flash");
                    var coords = circleCoords(pixel.x,pixel.y,2);
                    coords.forEach(function(coord){
                        var x = coord.x;
                        var y = coord.y;
                        if (!isEmpty(x,y,true)) {
                            pixelMap[x][y].temp += 55;
                            pixelTempCheck(pixelMap[x][y]);
                        }
                    });
                    deletePixel(pixel.x,pixel.y);
                    return;
                }
            }
        },
        category: "weapons",
        state: "solid",
        density: 100000000,
        temp: 55,
        hardness: 1,
        maxSize: 3,
        cooldown: defaultCooldown,
        excludeRandom: true,
    };

    elements.holy_hand_grenade = {
        color: (elements.gold && elements.gold.color) ? elements.gold.color : "#ffd700",
        behavior: [
            "XX|EX:6>god_ray,bless,bless,bless%1|XX",
            "XX|XX|XX",
            "M2|M1 AND EX:6>god_ray,bless,bless,bless%1|M2",
        ],
        behaviorOn: [
            "XX|XX|XX",
            "XX|EX:6>god_ray,bless,bless,bless%1|XX",
            "XX|XX|XX",
        ],
        category: "weapons",
        state: "solid",
        density: 1300,
        tempHigh: 1455.5,
        stateHigh: ["molten_steel", "god_ray"],
        excludeRandom: true,
        conduct: 1,
        cooldown: defaultCooldown,
    };

    // 4. Timer
    elements.timer_input = {
        color: "#4d0a03",
        behavior: behaviors.WALL,
        category: "machines",
        insulate: true,
        conduct: 1,
        noMix: true
    };

    let TimerDelay = 100;
    elements.Timer = {
        color: "#838cc2",
        behavior: behaviors.WALL,
        tick: function(pixel){
            if (pixelTicks == pixel.start) {
                pixel.delay = TimerDelay;
            }
            if (!pixel.timers) pixel.timers = [];
            let neighbors = [[0,1], [0,-1], [1,0], [-1,0]];
            for (let offset of neighbors) {
                let nx = pixel.x + offset[0];
                let ny = pixel.y + offset[1];
                if (isEmpty(nx, ny)) continue;
                if (pixelMap[nx][ny].charge && pixelMap[nx][ny].element == "timer_input") {
                    let oppositeCoords = {x: pixel.x - offset[0], y: pixel.y - offset[1]};
                    pixel.timers.push({start: pixelTicks, coords: oppositeCoords, delay: pixel.delay || 100});
                }
            }
            for (let index = pixel.timers.length - 1; index >= 0; index--) {
                let timer = pixel.timers[index];
                if (pixelTicks - timer.start >= timer.delay) {
                    if (!isEmpty(timer.coords.x, timer.coords.y, true)) {
                        pixelMap[timer.coords.x][timer.coords.y].charge = 1;
                    }
                    pixel.timers.splice(index, 1);
                }
            }
        },
        onSelect: () => {
            let input = prompt("what shall the delay be? (in ticks)", "100");
            if (input) TimerDelay = parseInt(input) || 100;
        },
        colorOn: "#ffff59",
        category: "machines",
        tempHigh: 1455.5,
        stateHigh: "molten_steel",
        conduct: 0,
        properties: {
            timers: [],
            delay: 100
        }
    };

    // 5. Metals
    elements.titanium = {
        desc: "Another metal that does not erode nor conduct electricity",
        conduct: 0,
        color: ["#a1ada5","#ebf5ee","#bac2bc","#848a86","#505251"],
        tempHigh: 3000,
        stateHigh: "molten_titanium",
        category: "solids",
        state: "solid",
        hardness: 1,
        density: 792,
        behavior: behaviors.WALL,
    };

    elements.molten_titanium = {
        desc: "Melted version of titanium",
        temp: 3000,
        conduct: 0,
        color: ["#d16e04","#FFCC99","#FF6600","#FF7F50","#DC143C","#800020"],
        tempLow: 2999,
        stateLow: "titanium",
        category: "states",
        state: "liquid",
        density: 792,
        behavior: behaviors.MOLTEN,
    };

    elements.Reniforced_Titanuim = {
        color: "#787878",
        behavior: behaviors.WALL,
        tempHigh: 4000,
        stateHigh: "molten_titanium",
        category: "solids",
        state: "solid",
        density: 5000,
        hardness: 1,
        noMix: true
    };

    // Forceer herladen van de elementenlijst in de UI van Sandboxels
    if (typeof createCategoryLS !== "undefined") {
        createCategoryLS();
    } else if (typeof updateSearch !== "undefined") {
        updateSearch();
    }
}

// Zorg ervoor dat de mod wordt uitgevoerd nadat de game klaar is met laden
if (typeof runAfterLoad !== "undefined") {
    runAfterLoad(loadMod);
} else {
    loadMod();
}
