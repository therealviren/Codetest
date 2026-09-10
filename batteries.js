elements.special_wood = {
    color: ["#4a2e18", "#5c3a1e", "#382211"],
    behavior: behaviors.WALL,
    category: "solids",
    state: "solid",
    density: 800,
    hardness: 0.8,
    tempHigh: 800,
    stateHigh: ["fire", "charcoal", "smoke"],
    burn: 15,
    burnTime: 300,
    insulate: true,
    conduct: 0
};

// Registreer het element in het UI-menu
if (typeof elementOrder !== "undefined" && !elementOrder.includes("special_wood")) {
    elementOrder.push("special_wood");
}

if (typeof selectCategory === "function") {
    selectCategory("solids");
}
