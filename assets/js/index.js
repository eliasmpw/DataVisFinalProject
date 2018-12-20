let COLORS = {
    'hm': {
        'color': '#013a90',
        'sector': {
            'delta': '#a56e00',
            'huepetuhe': '#019bdd',
            'smallmines': '#6868ac',
            'pampa': '#013a90',
        }
    },
    'sp': {
        'color': '#bd0736',
        'sector': {
            'delta': '#d765d3',
            'huepetuhe': '#bd0736',
            'smallmines': '#ffa4d4',
            'pampa': '#a494ff',
        }
    }
};
let SELECTION = {
    hm: {
        categoryLevel: 1,
        selected: true,
        sector: {
            delta: false,
            huepetuhe: false,
            smallmines: false,
            pampa: false
        }
    },
    sp: {
        categoryLevel: 1,
        selected: true,
        sector: {
            delta: false,
            huepetuhe: false,
            smallmines: false,
            pampa: false
        }
    }
}

let option1Selected = false;
let option2Selected = true;
let hmSelected = true;
let spSelected = true;
let sliderElement;
let firstLoad = true;
let topoLayer = [];
let map;
let resizeTimeout;
const introHeight = 1000;
const blockHeight = 350;
let currentBlock = 0;
const highlights = [
    null,
    {
        lat: -70.466134,
        long: -13.033585,
        zoom: 13,
        year: 1985
    },
    {
        lat: -70.507609,
        long: -13.025237,
        zoom: 12,
        year: 1993
    },
    {
        lat: -69.583434,
        long: -12.687040,
        zoom: 12,
        year: 2001
    },
    {
        lat: -69.959516,
        long: -12.839984,
        zoom: 12,
        year: 2009
    },
    {
        lat: -69.605402,
        long: -12.772980,
        zoom: 9.5,
        year: 2017
    }
];

window.onload = () => {
    const maxBounds = [
        [13.39029, -16.33247], //Southwest
        [-59.450451, -109.47493] //Northeast
    ];
    map = new L.map("map", {
        center: [-12.8, -69.5],
        zoom: 9,
        maxBounds: maxBounds,
        maxBoundsViscosity: 1.0,
        zoomSnap: 1,
        zoomDelta: 1,
		wheelPxPerZoomLevel: 150
    });
    const layerOptions = {
        maxZoom: 13,
        minZoom: 5
    };

    let addSectorBtns = (container, type) => {
        let sectors = document.getElementById('sectorBtns').cloneNode(true);
        sectors.id = 'sectorBtns' + type;

        let buttons = sectors.children;

        for (let button of buttons) {
            button.setAttribute('data-type', type);
        }

        container.parentNode.insertBefore(sectors, container);

        sectors.querySelectorAll('.button').forEach(function (button) {
            button.addEventListener('click', function (e) {
                if (this.classList.contains('selected')) {
                    this.classList.remove('selected');
                } else {
                    this.classList.add('selected');
                }

                let sector = this.getAttribute('data-sector');
                let type = this.getAttribute('data-type');
                console.log(type + ' ' + sector);
                for(let x of  document.getElementsByClassName(type + '_text')) {
                    x.classList.add('active');
                }
                
                // Update colors in the map
                SELECTION[type].categoryLevel = 2;
                SELECTION[type].sector[sector] = !SELECTION[type].sector[sector];
                goBackCategory = true;
                for (let key in SELECTION) {
                        if (key === type) {
                            for (let secondKey in SELECTION[key].sector) {
                                if (SELECTION[key].sector[secondKey]) {
                                    goBackCategory = false;
                                    break;
                                }
                            }
                        }
                }
                if (goBackCategory) {
                    SELECTION[type].categoryLevel = 1;
                    SELECTION[type].selected = true;
                }
                for(let mapLayer of topoLayer) {
                    mapLayer.eachLayer(handleLayer);
                }
            });
        });
    };


    const customOption1 = L.Control.extend({
        options: {
            position: "bottomRight"
        },

        onAdd: function (map) {
            let container = L.DomUtil.get("option1");

            container.onclick = function () {
                if (hmSelected) {
                    map._controlCorners.bottomRight.classList.remove('open-hm');
                    document.getElementById('sectorBtnshm').remove();
                    container.classList.remove('selected');
                } else {
                    addSectorBtns(container, 'hm');
                    map._controlCorners.bottomRight.classList.add('open-hm');
                    container.classList.add('selected');
                }

                hmSelected = !hmSelected;
                for(let x of  document.getElementsByClassName('hm' + '_text')) {
                    x.classList.remove('active');
                }

                // Update colors in the map
                SELECTION.hm.selected = hmSelected;
                for(let mapLayer of topoLayer) {
                    mapLayer.eachLayer(handleLayer);
                }
            };
            return container;
        }
    });

    const customOption2 = L.Control.extend({
        options: {
            position: "bottomRight"
        },

        onAdd: function (map) {
            let container = L.DomUtil.get("option2");

            container.onclick = () => {
                if (spSelected) {
                    map._controlCorners.bottomRight.classList.remove('open-sp');
                    document.getElementById('sectorBtnssp').remove();
                    container.classList.remove('selected');
                } else {
                    addSectorBtns(container, 'sp');
                    map._controlCorners.bottomRight.classList.add('open-sp');
                    container.classList.add('selected');
                }

                for(let x of  document.getElementsByClassName('sp' + '_text')) {
                    x.classList.remove('active');
                }

                spSelected = !spSelected;
                // Update colors in the map
                SELECTION.sp.selected = spSelected;
                for(let mapLayer of topoLayer) {
                    mapLayer.eachLayer(handleLayer);
                }
            };
            return container;
        }
    });

    L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        layerOptions
    ).addTo(map);

    let option1 = L.DomUtil.get("option1");
    let option2 = L.DomUtil.get("option2");

    const corners = map._controlCorners;
    const container = map._controlContainer;

    corners["bottomRight"] = L.DomUtil.create(
        "div",
        "leaflet-horizontal-right",
        container
    );
    map.addControl(new customOption1());
    map.addControl(new customOption2());

    addSectorBtns(option1, 'hm');
    map._controlCorners.bottomRight.classList.add('open-hm');
    addSectorBtns(option2, 'sp');
    map._controlCorners.bottomRight.classList.add('open-sp');


    L.TopoJSON = L.GeoJSON.extend({
        addData: function (jsonData) {
            if (jsonData.type === "Topology") {
                for (key in jsonData.objects) {
                    geojson = topojson.feature(jsonData, jsonData.objects[key]);
                    L.GeoJSON.prototype.addData.call(this, geojson);
                }
            } else {
                L.GeoJSON.prototype.addData.call(this, jsonData);
            }
        }
    });

    document
        .getElementById("storyTelling")
        .addEventListener("scroll", handleScroll);
    document.getElementById("back-to-top").addEventListener("click", goBackToTop);
    loadMapFiles();

    // readJsonFile("assets/data/simplified_grouped_mineria_1985.geojson", function(text){
    //     console.log(text);
    //     var data = JSON.parse(text);
    //     console.log(data);
    //     L.geoJSON(data).addTo(map);
    // });
    initializeSlider();
    loadVisualization();
    animateValue("value_counter_0", 0, 10, 2000);
};

function readJsonFile(filename, callback) {
    let rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", filename, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    };
    rawFile.send(null);
}

function initializeSlider() {
    sliderElement = document.getElementById("slider");
    noUiSlider.create(sliderElement, {
        start: 2017,
        step: 8,
        range: {
            min: 1985,
            max: 2017
        },
        // For Scale
        pips: {
            mode: "count",
            values: 5,
            density: 100,
            format: wNumb({
                decimals: 0
            })
        }
    });
    sliderElement.noUiSlider.on("update", onSliderUpdate);
}

function onSliderUpdate(values) {
    if (firstLoad) {
        firstLoad = false;
    } else {
        const newValue = parseInt(values[0]);
        fileName = "";
        switch (newValue) {
            case 1985:
                topoLayer[0].addTo(map);
                // topoLayer[1].addTo(map);
                // topoLayer[2].addTo(map);
                // topoLayer[3].addTo(map);
                // topoLayer[4].addTo(map);
                // map.removeLayer(topoLayer[0]);
                map.removeLayer(topoLayer[1]);
                map.removeLayer(topoLayer[2]);
                map.removeLayer(topoLayer[3]);
                map.removeLayer(topoLayer[4]);
                break;
            case 1993:
                // topoLayer[0].addTo(map);
                topoLayer[1].addTo(map);
                // topoLayer[2].addTo(map);
                // topoLayer[3].addTo(map);
                // topoLayer[4].addTo(map);
                map.removeLayer(topoLayer[0]);
                // map.removeLayer(topoLayer[1]);
                map.removeLayer(topoLayer[2]);
                map.removeLayer(topoLayer[3]);
                map.removeLayer(topoLayer[4]);
                break;
            case 2001:
                // topoLayer[0].addTo(map);
                topoLayer[1].addTo(map);
                topoLayer[2].addTo(map);
                // topoLayer[3].addTo(map);
                // topoLayer[4].addTo(map);
                map.removeLayer(topoLayer[0]);
                // map.removeLayer(topoLayer[1]);
                // map.removeLayer(topoLayer[2]);
                map.removeLayer(topoLayer[3]);
                map.removeLayer(topoLayer[4]);
                break;
            case 2009:
                // topoLayer[0].addTo(map);
                topoLayer[1].addTo(map);
                topoLayer[2].addTo(map);
                topoLayer[3].addTo(map);
                // topoLayer[4].addTo(map);
                map.removeLayer(topoLayer[0]);
                // map.removeLayer(topoLayer[1]);
                // map.removeLayer(topoLayer[2]);
                // map.removeLayer(topoLayer[3]);
                map.removeLayer(topoLayer[4]);
                break;
            case 2017:
                // topoLayer[0].addTo(map);
                topoLayer[1].addTo(map);
                topoLayer[2].addTo(map);
                topoLayer[3].addTo(map);
                topoLayer[4].addTo(map);
                map.removeLayer(topoLayer[0]);
                // map.removeLayer(topoLayer[1]);
                // map.removeLayer(topoLayer[2]);
                // map.removeLayer(topoLayer[3]);
                // map.removeLayer(topoLayer[4]);
                break;
        }
    }
}

function loadMapFiles() {
    readJsonFile("assets/data/V5/grouped_mineria_1985.json", function (text) {
        let data = JSON.parse(text);
        topoLayer[0] = new L.TopoJSON();
        topoLayer[0].addData(data);
        topoLayer[0].eachLayer(handleLayer);
    });
    readJsonFile("assets/data/V5/grouped_mineria_1985-1993.json", function (text) {
        let data = JSON.parse(text);
        topoLayer[1] = new L.TopoJSON();
        topoLayer[1].addData(data);
        topoLayer[1].eachLayer(handleLayer);
        topoLayer[1].addTo(map);
    });
    readJsonFile("assets/data/simplified_topo_simplified_geo_grouped_mineria_1993-2001.json", function (text) {
        let data = JSON.parse(text);
        topoLayer[2] = new L.TopoJSON();
        topoLayer[2].addData(data);
        topoLayer[2].eachLayer(handleLayer);
        topoLayer[2].addTo(map);
    });
    readJsonFile("assets/data/simplified_topo_simplified_geo_grouped_mineria_2001-2009.json", function (text) {
        let data = JSON.parse(text);
        topoLayer[3] = new L.TopoJSON();
        topoLayer[3].addData(data);
        topoLayer[3].eachLayer(handleLayer);
        topoLayer[3].addTo(map);
    });
    readJsonFile("assets/data/simplified_topo_simplified_geo_grouped_mineria_2009-2017.json", function (text) {
        let data = JSON.parse(text);
        topoLayer[4] = new L.TopoJSON();
        topoLayer[4].addData(data);
        topoLayer[4].eachLayer(handleLayer);
        topoLayer[4].addTo(map);
    });
}

function handleLayer(layer) {
    let miningType = (layer.feature.properties.MiningType || 'hm').normText();
    let sector = (layer.feature.properties.Sector || 'smallmines').normText();
    let colorOfLayer, fillOpacity;
    if (SELECTION[miningType].categoryLevel == 1) {
        colorOfLayer = COLORS[miningType].color;
        fillOpacity = SELECTION[miningType].selected ? 1 : 0;
    } else {
        colorOfLayer = COLORS[miningType]['sector'][sector];
        fillOpacity = SELECTION[miningType]['sector'][sector] ? 1 : 0;
    }
    // let fillOpacity;


    // console.log(layer.feature.properties.Sector);
    // switch (layer.feature.properties.MiningType) {
    //
    //     case "HM":
    //         switch (layer.feature.properties.Sector) {
    //             case "Huepetuhe":
    //                 colorOfLayer = "#77070B";
    //                 fillOpacity = 0;
    //                 break;
    //             case "SmallMines": {
    //                 colorOfLayer = "#FFC000"; //nada
    //                 fillOpacity = 0;
    //                 break;
    //             }
    //             case "Delta": {
    //                 colorOfLayer = "#FFFF00"; // nada
    //                 fillOpacity = 0;
    //                 break;
    //             }
    //             case "Pampa": {
    //                 colorOfLayer = "#00B050";
    //                 fillOpacity = 0;
    //                 break;
    //             }
    //         }
    //         break;
    //     case "SP":
    //         switch (layer.feature.properties.Sector) {
    //             case "Huepetuhe":
    //                 colorOfLayer = "#002060"; // nada
    //                 fillOpacity = 0;
    //                 break;
    //             case "SmallMines": {
    //                 colorOfLayer = "#7030A0"; // nada
    //                 fillOpacity = 0;
    //                 break;
    //             }
    //             case "Delta": {
    //                 colorOfLayer = "#808080"; //nada
    //                 fillOpacity = 0;
    //                 break;
    //             }
    //             case "Pampa": {
    //                 colorOfLayer = "#007AAE";
    //                 fillOpacity = 1;
    //                 break;
    //             }
    //         }
    //         break;
    //     default:
    //         colorOfLayer = "#000000";
    //         fillOpacity = 1;
    // }
    layer.setStyle({
        color: colorOfLayer,
        // Uncomment this line to see only the ones with fillOpacity = 1
        fillOpacity: fillOpacity,
        weight: fillOpacity
    });
}

function handleScroll(event) {
    const scroll = event.srcElement.scrollTop;
    let blockScrolling = scroll - introHeight;

    if (
        scroll ==
        event.srcElement.scrollHeight - event.srcElement.clientHeight
    ) {
        blockScrolling = highlights.length - 1;

    } else {
        if (blockScrolling < 0) {
            blockScrolling = 0;

        } else {
            blockScrolling = parseInt(blockScrolling / blockHeight) + 1;

        }
    }
    if (blockScrolling != currentBlock) {
        if (highlights[blockScrolling]) {
            // Move to the corresponding year
            sliderElement.noUiSlider.set(highlights[blockScrolling].year);
            switch (highlights[blockScrolling].year) {
                case 1985:
                    animateValue("value_counter_1", 0, 1, 2000);
                    break;
                case 1993:
                    animateValue("value_counter_2", 0, 1, 2000);
                    animateValue("value_counter_3", 0, 1, 2000);
                    break;
                case 2001:
                    animateValue("value_counter_4", 0, 1, 2000);
                    break;
                case 2009:
                    animateValue("value_counter_5", 0, 5, 2000);
                    animateValue("value_counter_6", 0, 6, 2000);
                    break;
                case 2017:
                    animateValue("value_counter_7", 0, 7, 2000);
                    animateValue("value_counter_8", 0, 8, 2000);
                    break;
                default:
                    console.log("animate default!!");


                    break;
            }

            map.flyTo(
                [
                    highlights[blockScrolling].long,
                    highlights[blockScrolling].lat,
                ],
                highlights[blockScrolling].zoom,
                {
                    animate: true,
                    duration: highlights[blockScrolling].year === 1985 ? 1.2 : 2,
                }
            );

        } else {
            animateValue("value_counter_0", 0, 10, 2000);

        }
        elements = document.getElementsByClassName("story-container");
        for (let i = 0; i < elements.length; i++) {
            elements[i].classList.remove("inFocus");
        }
        document
            .getElementById("container" + blockScrolling)
            .classList.add("inFocus");
        currentBlock = blockScrolling;
    }
}

function goBackToTop(event) {
    document
        .getElementById("storyTelling").scrollTop = 0;
}

function animateValue(id, start = 0, step = 1, duration = 2000) {
    var obj = document.getElementById(id);
    var end = parseFloat(obj.innerHTML);
    var range = end - start;
    var current = start;
    var increment = end > start ? step : -1;
    var stepTime = Math.abs(Math.floor(duration / range));
    var timer = setInterval(function () {
        current += increment;
        obj.innerHTML = current;
        if (current >= end) {
            obj.innerHTML = end;
            clearInterval(timer);
        }
    }, stepTime);
}

