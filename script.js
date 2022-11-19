window.mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

let map = L.map('map').setView([53.195878, 50.100202], 13);
let mapElem = document.querySelector('#map');
let listElem = document.querySelector('.favorite-list');
let markers = {};
let stops = {};

if (window.mobileCheck()) {
    mapElem.style.height = window.innerHeight * 0.8 + 'px';
    listElem.style.maxHeight = window.innerHeight * 0.3 + 'px';
} else {
    mapElem.style.height = window.innerHeight * 0.9 + 'px';
    listElem.style.maxHeight = window.innerHeight * 0.9 + 'px';
}

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoidm9sdW1lY29yZSIsImEiOiJjbDJxN3cwa3QycjRwM2NwOTkwdmUzZGRwIn0.aGbKOtZKHqTyQ2SQKRm6_g'
}).addTo(map);

window.addEventListener('resize', () => {
    mapElem.style.height = window.innerHeight * 0.8 + 'px';
    listElem.style.maxHeight = window.innerHeight * 0.9 + 'px';
});

function getStops() {
    fetch("https://tosamara.ru/api/v2/classifiers/stopsFullDB.xml")
        .then(response => response.text())
        .then(str => new DOMParser().parseFromString(str, "text/xml"))
        .then(result => {
            renderStops(xmlToJson(result));
        });
}

function getArrivals(KS_ID) {
    return fetch(`https://tosamara.ru/api/v2/json?method=getFirstArrivalToStop&KS_ID=${KS_ID}&os=android&clientid=test&authkey=${SHA1(KS_ID + "just_f0r_tests")}`)
        .then(response => response.json());
}

function generatePopupInfo(vehicles, stop) {
    console.log(vehicles);
    let resultInfo = {
        trolleybuses: [],
        buses: [],
        trams: []
    }
    console.log(stop);

    for (let vehicle of vehicles.arrival) {
        switch (vehicle.type) {
            case "Автобус":
                resultInfo.buses.push({
                    number: vehicle.number,
                    time: vehicle.time,
                    hullNo: vehicle.hullNo
                });
                break;
            case "Троллейбус":
                resultInfo.trolleybuses.push({
                    number: vehicle.number,
                    time: vehicle.time,
                    hullNo: vehicle.hullNo
                });
            case "Трамвай":
                resultInfo.trams.push({
                    number: vehicle.number,
                    time: vehicle.time,
                    hullNo: vehicle.hullNo
                });
            default:
                break;
        }
    }
    let ks_id = stop.KS_ID["#text"];
    favoriteStops = JSON.parse(localStorage.getItem("favorite"));
    console.log(favoriteStops);
    let isFavorite = favoriteStops === null ? false : favoriteStops.findIndex((stop) => stop.id + '' === ks_id) !== -1;
    console.log(isFavorite);
    console.log(ks_id);
    let resultHTML = `<div class='stop-info'><img class='like-button${isFavorite ? '' : ' disabled'}' onclick='addToFavorite(this, ${JSON.stringify(stop)}, ${JSON.stringify(resultInfo)})' src='heart-icon.png' alt=''><h4>Остановка ${stop.adjacentStreet["#text"]} ${stop.direction["#text"]}</h4>`;
    if (!!resultInfo.buses.length) {
        resultHTML += "<div class='popup_buses'><p>Автобусы:</p>";
        for (let i of resultInfo.buses) {
            resultHTML += "<div class='popup_buses__bus-info'>";
            resultHTML += `<span onclick="generateNextStops(${i.hullNo})">Автобус ${i.number}</span>`;
            resultHTML += i.time === "0" ? "<span>Прибывает</span>" : `<span>${i.time} мин.</span>`;
            resultHTML += "</div>";
        }
        resultHTML += "</div>";
    }
    if (!!resultInfo.trams.length) {
        resultHTML += "<div class='popup_trams'><p>Трамваи:</p>";
        for (let i of resultInfo.trams) {
            resultHTML += "<div class='popup_trams__tram-info'>";
            resultHTML += `<span onclick="generateNextStops(${i.hullNo})">Трамвай ${i.number}</span>`;
            resultHTML += i.time === "0" ? "<span>Прибывает</span>" : `<span>${i.time} мин.</span>`;
            resultHTML += "</div>";
        }
        resultHTML += "</div>";
    }
    if (!!resultInfo.trolleybuses.length) {
        resultHTML += "<div class='popup_trolls'><p>Троллейбусы:</p>";
        for (let i of resultInfo.trolleybuses) {
            resultHTML += "<div class='popup_trolls__troll-info'>";
            resultHTML += `<span onclick="generateNextStops(${i.hullNo})">Троллейбус ${i.number}</span>`;
            resultHTML += i.time === "0" ? "<span>Прибывает</span>" : `<span>${i.time} мин.</span>`;
            resultHTML += "</div>";
        }
        resultHTML += "</div>";
    }
    resultHTML += "</div>";

    // console.log(resultInfo);
    return resultHTML;
}

function generateNextStops(hullNo) {
    listElem.innerHTML = "<button onclick='renderFavoriteList()'>Назад</button>";
    if (listElem.style.display === "none") {
        toggleFavoriteList();
    }
    fetch(`https://tosamara.ru/api/v2/json?method=getTransportPosition&HULLNO=${hullNo}&os=android&clientid=test&authkey=${SHA1(hullNo + "just_f0r_tests")}`)
        .then(response => response.json())
        .then(res => {
            for (let stop of res.nextStops) {
                const newItem = document.createElement('div');
                newItem.innerHTML = `
                    <div class="favorite-list__item">
                        <b class="favorite-list__item_title">${stops[stop.KS_ID].name}</b>
                        <p class="favorite-list__item_info">${Math.round(+stop.time / 60) !== 0 ? 'Через ' + Math.round(+stop.time / 60) + " мин." : "Прибывает"}</p>
                    </div>
                `;
                listElem.appendChild(newItem);
                newItem.addEventListener('click', () => {
                    markers[stop.KS_ID].openPopup();
                    map.setView([stop.x, stop.y], 13);
                });
            }
        });
}

function addToFavorite(elem, stop, vehicles) {
    let availableVehicles = "";
    console.log(stop);
    if (typeof stop.busesCommercial["#text"] !== "undefined") {
        availableVehicles += stop.busesCommercial["#text"];
    }
    if (typeof stop.busesMunicipal["#text"] !== "undefined") {
        if (availableVehicles !== "") availableVehicles += ", ";
        availableVehicles += stop.busesMunicipal["#text"];
    }
    if (typeof stop.busesPrigorod["#text"] !== "undefined") {
        if (availableVehicles !== "") availableVehicles += ", ";
        availableVehicles += stop.busesPrigorod["#text"];
    }
    if (typeof stop.trams["#text"] !== "undefined") {
        if (availableVehicles !== "") availableVehicles += ", ";
        availableVehicles += stop.trams["#text"];
    }
    if (typeof stop.trolleybuses["#text"] !== "undefined") {
        if (availableVehicles !== "") availableVehicles += ", ";
        availableVehicles += stop.trolleybuses["#text"];
    }
    let isAdd = elem.classList.toggle("disabled");
    let favoriteStops = JSON.parse(localStorage.getItem('favorite')) || [];
    // console.log(favoriteStops);
    isAdd ? (favoriteStops = favoriteStops.filter((item) => item.id !== stop.KS_ID["#text"])) : favoriteStops.push({id: stop.KS_ID["#text"], name: stop.title["#text"], x: stop.latitude["#text"], y: stop.longitude["#text"], availableVehicles: availableVehicles});
    // console.log(favoriteStops);
    // localStorage.removeItem("favorite");
    localStorage.setItem("favorite", JSON.stringify(favoriteStops));
    renderFavoriteList();
}

function renderFavoriteList() {
    let favoriteStops = JSON.parse(localStorage.getItem('favorite')) || [];
    listElem.innerHTML = "<button onclick='toggleSearch()'>Поиск по всем</button>"
    listElem.innerHTML += "<h3>Избранное: </h3>";
    if (!favoriteStops.length) {
        listElem.innerHTML = "<h3>Пусто</h3>";
        return;
    }

    for (let stop of favoriteStops) {
        const newItem = document.createElement('div');
        newItem.innerHTML = `
			<div class="favorite-list__item">
     			<b class="favorite-list__item_title">${stop.name}</b>
     			<p class="favorite-list__item_info">Транспорт: ${stop.availableVehicles}</p>
    		</div>
			`;
        listElem.appendChild(newItem);
        newItem.addEventListener('click', () => {
            markers[stop.id].openPopup();
            map.setView([stop.x, stop.y], 13);
        });
    }
}

function toggleSearch() {
    listElem.innerHTML = "<button onclick='renderFavoriteList()' style='margin-right: 10px;'>Назад</button>";
    listElem.innerHTML += "<input id=\"search-input\" type=\"text\" placeholder=\"Поиск...\" list=\"search-list\">";
    listElem.innerHTML += "<div id='found-stops' style='display: flex; flex-direction: column; margin-top: 30px;'></div>";
    let foundList = document.querySelector("#found-stops");
    let searchField = document.querySelector("#search-input");
    console.log(stops);
    searchField.addEventListener("input", () => {
        if (searchField.value < 4) return;
        foundList.innerHTML = "";
        for (const [key, value] of Object.entries(stops)) {
            if (value["name"].toLowerCase().includes(searchField.value.toLowerCase())) {
                const newItem = document.createElement('div');
                newItem.innerHTML = `
                    <div class="favorite-list__item">
                        <b class="favorite-list__item_title">${value["name"]}</b>
                    </div>
			    `;
                foundList.appendChild(newItem);
                newItem.addEventListener('click', () => {
                    markers[key].openPopup();
                    map.setView([value.x, value.y], 13);
                });
            }
        }
    })
}

function renderStops(data) {
    console.log(data["stops"].stop[1]);
    console.log(data["stops"].stop[2]);
    console.log(data["stops"].stop[3]);

    console.log(data["stops"].stop[1].busesSeason["#text"]);
    console.log(data["stops"].stop[1].busesPrigorod["#text"]);
    // data["stops"].stop = data["stops"].stop.slice(0, 100);
    let dataList = document.querySelector("#search-list");
    for (let i of data["stops"].stop) {
        let marker = L.marker([i.latitude["#text"], i.longitude["#text"]]).addTo(map).bindPopup();
        marker.addEventListener("popupopen", async () => {
            let arrivalsInfo = generatePopupInfo(await getArrivals(i.KS_ID["#text"]), i);
            marker.bindPopup(arrivalsInfo);
        })
        markers[i.KS_ID["#text"]] = marker;
        stops[i.KS_ID["#text"]] = {
            name: i.title["#text"],
            x: i.latitude["#text"],
            y: i.longitude["#text"]
        };
        let stop = document.createElement("option");
        stop.value = i.title["#text"];
        dataList.appendChild(stop);
    }
    renderFavoriteList();
}

if (window.mobileCheck()) {
    listElem.style.display = "none";
} else {
    document.querySelector("#favorite-btn").style.display = "none";
}

function toggleFavoriteList() {
    if (listElem.style.display === "none") {
        listElem.style.display = "block";
        mapElem.style.height = window.innerHeight * 0.5 + 'px';
        document.querySelector("#favorite-btn").innerHTML = "Закрыть избранное";
    } else {
        listElem.style.display = "none";
        mapElem.style.height = window.innerHeight * 0.8 + 'px';
        document.querySelector("#favorite-btn").innerHTML = "Открыть избранное";
    }

}

function xmlToJson(xml) {

    // Create the return object
    let obj = {};

    if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (let j = 0; j < xml.attributes.length; j++) {
                let attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) { // text
        obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes()) {
        for(let i = 0; i < xml.childNodes.length; i++) {
            let item = xml.childNodes.item(i);
            let nodeName = item.nodeName;
            if (typeof(obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof(obj[nodeName].push) == "undefined") {
                    let old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
}

function SHA1(msg){function rotate_left(n,s){var t4=(n<<s)|(n>>>(32-s));return t4;};function lsb_hex(val){var str='';var i;var vh;var vl;for(i=0;i<=6;i+=2){vh=(val>>>(i*4+4))&0x0f;vl=(val>>>(i*4))&0x0f;str+=vh.toString(16)+vl.toString(16);}
    return str;};function cvt_hex(val){var str='';var i;var v;for(i=7;i>=0;i--){v=(val>>>(i*4))&0x0f;str+=v.toString(16);}
    return str;};function Utf8Encode(string){string=string.replace(/\r\n/g,'\n');var utftext='';for(var n=0;n<string.length;n++){var c=string.charCodeAt(n);if(c<128){utftext+=String.fromCharCode(c);}
else if((c>127)&&(c<2048)){utftext+=String.fromCharCode((c>>6)|192);utftext+=String.fromCharCode((c&63)|128);}
else{utftext+=String.fromCharCode((c>>12)|224);utftext+=String.fromCharCode(((c>>6)&63)|128);utftext+=String.fromCharCode((c&63)|128);}}
    return utftext;};var blockstart;var i,j;var W=new Array(80);var H0=0x67452301;var H1=0xEFCDAB89;var H2=0x98BADCFE;var H3=0x10325476;var H4=0xC3D2E1F0;var A,B,C,D,E;var temp;msg=Utf8Encode(msg);var msg_len=msg.length;var word_array=new Array();for(i=0;i<msg_len-3;i+=4){j=msg.charCodeAt(i)<<24|msg.charCodeAt(i+1)<<16|msg.charCodeAt(i+2)<<8|msg.charCodeAt(i+3);word_array.push(j);}
    switch(msg_len % 4){case 0:i=0x080000000;break;case 1:i=msg.charCodeAt(msg_len-1)<<24|0x0800000;break;case 2:i=msg.charCodeAt(msg_len-2)<<24|msg.charCodeAt(msg_len-1)<<16|0x08000;break;case 3:i=msg.charCodeAt(msg_len-3)<<24|msg.charCodeAt(msg_len-2)<<16|msg.charCodeAt(msg_len-1)<<8|0x80;break;}
    word_array.push(i);while((word_array.length % 16)!=14)word_array.push(0);word_array.push(msg_len>>>29);word_array.push((msg_len<<3)&0x0ffffffff);for(blockstart=0;blockstart<word_array.length;blockstart+=16){for(i=0;i<16;i++)W[i]=word_array[blockstart+i];for(i=16;i<=79;i++)W[i]=rotate_left(W[i-3]^W[i-8]^W[i-14]^W[i-16],1);A=H0;B=H1;C=H2;D=H3;E=H4;for(i=0;i<=19;i++){temp=(rotate_left(A,5)+((B&C)|(~B&D))+E+W[i]+0x5A827999)&0x0ffffffff;E=D;D=C;C=rotate_left(B,30);B=A;A=temp;}
        for(i=20;i<=39;i++){temp=(rotate_left(A,5)+(B^C^D)+E+W[i]+0x6ED9EBA1)&0x0ffffffff;E=D;D=C;C=rotate_left(B,30);B=A;A=temp;}
        for(i=40;i<=59;i++){temp=(rotate_left(A,5)+((B&C)|(B&D)|(C&D))+E+W[i]+0x8F1BBCDC)&0x0ffffffff;E=D;D=C;C=rotate_left(B,30);B=A;A=temp;}
        for(i=60;i<=79;i++){temp=(rotate_left(A,5)+(B^C^D)+E+W[i]+0xCA62C1D6)&0x0ffffffff;E=D;D=C;C=rotate_left(B,30);B=A;A=temp;}
        H0=(H0+A)&0x0ffffffff;H1=(H1+B)&0x0ffffffff;H2=(H2+C)&0x0ffffffff;H3=(H3+D)&0x0ffffffff;H4=(H4+E)&0x0ffffffff;}
    var temp=cvt_hex(H0)+cvt_hex(H1)+cvt_hex(H2)+cvt_hex(H3)+cvt_hex(H4);return temp.toLowerCase();}

getStops();
getArrivals(15);