//main.js

var geocoder;
var markers = [];
var rectangle = new Array();
var op = '';
var polyLineArray = new Array();
var samplePoints = []; 
var width = 0;
var height = 0;
var so=0.25, sw=1, s=0.05;


function initialize() {
geocoder = new google.maps.Geocoder();
var myLatLng = new google.maps.LatLng(0, 0);
var mapOptions = {
zoom: 2,
center: myLatLng,
mapTypeId: google.maps.MapTypeId.HYBRID
};

map = new google.maps.Map(document.getElementById("map"), mapOptions);

 google.maps.event.addListener(map, 'click', function(event) {
addMarker(event.latLng);
});

}
function searchMap(){
var searchterm = $('#searchplace').val();
if (searchterm != ""){
geocoder.geocode( { 'address': searchterm}, function(results, status) {
console.log(results);
if (status == google.maps.GeocoderStatus.OK) {
  map.setCenter(results[0].geometry.location);
  map.fitBounds(results[0].geometry.viewport);
} else {
  alert('Geocode was not successful for the following reason: ' + status);
}
});
}}

function search(event) {
    if (event.keyCode == 13) {
        searchMap();
    }
}

function addMarker(location){
    if(markers.length<2){
        var marker = new google.maps.Marker({
            position: location,
            draggable: true,
            map: map
        });
        markers.push(marker);
        google.maps.event.addListener(markers[markers.length-1], "position_changed", function() {changeRectangle()});
    }
    if (markers.length == 2){
      drawRectangle();
  }
    
}

function changeRectangle(){
if (markers.length == 2){
if (rectangle.length!=0){
NWc = markers[0].getPosition();
SEc = markers[1].getPosition();

b = new google.maps.LatLngBounds(
new google.maps.LatLng(Math.max(NWc.lat('get'),SEc.lat('get')), Math.min(NWc.lng('get'),SEc.lng('get'))),
new google.maps.LatLng(Math.min(NWc.lat('get'),SEc.lat('get')), Math.max(NWc.lng('get'),SEc.lng('get'))));	

rectangle.setBounds(b);
}else
{drawRectangle();}
}} 

function setCoords() {
if (markers.length == 2){
//console.log(markers.length);
NWc = markers[0].getPosition();
SEc = markers[1].getPosition();
document.getElementById("minLatitude").value = NWc.lat('get');
document.getElementById("minLongitude").value = NWc.lng('get');
document.getElementById("maxLatitude").value = SEc.lat('get');
document.getElementById("maxLongitude").value = SEc.lng('get');
getData();
}
else if (
document.getElementById("minLatitude").value != "" && 
document.getElementById("minLongitude").value != "" && 
document.getElementById("maxLatitude").value != "" &&
document.getElementById("maxLongitude").value != ""){
getData();
}
else{
alert("Define an area first by clicking on the map, defining two diagonal corners of a rectangle.");
}}    

function drawRectangle(){
var b = "";
var c = new Array();
c[0] = document.getElementById("minLatitude").value;
c[1] = document.getElementById("minLongitude").value;
c[2] = document.getElementById("maxLatitude").value;
c[3] = document.getElementById("maxLongitude").value;
if (markers.length == 2){
NWc = markers[0].getPosition();
SEc = markers[1].getPosition();

b = new google.maps.LatLngBounds(
new google.maps.LatLng(Math.max(NWc.lat('get'),SEc.lat('get')), Math.min(NWc.lng('get'),SEc.lng('get'))),
new google.maps.LatLng(Math.min(NWc.lat('get'),SEc.lat('get')), Math.max(NWc.lng('get'),SEc.lng('get'))));

}
else if (c[0] != "" && c[1] != "" && c[2] != "" && c[3] != ""){
b = new google.maps.LatLngBounds(
new google.maps.LatLng(Math.max(c[0],c[2]), Math.min(c[1],c[3])),
new google.maps.LatLng(Math.min(c[0],c[2]), Math.max(c[1],c[3])));
}

if (b!="") {
// alert(b);
clearMap('rectangle');
rectangle = new google.maps.Rectangle({
strokeColor: '#000000',
strokeOpacity: 0.8,
strokeWeight: 1,
fillColor: '#000000',
fillOpacity: 0.15,
map: map,
bounds: b    
});
} 
}

function clearMap(what){

if (what == "rectangle" || what == "all"){
if (rectangle.length!=0){
rectangle.setMap(null);
rectangle = new Array();
}
}

if (what == "marker" || what == "all"){
for (iM in markers){
markers[iM].setMap(null);
}
markers = [];
}

if (what == "contour" || what == "all"){
for (iL in polyLineArray){
polyLineArray[iL].setMap(null);
}
polyLineArray = [];
document.getElementById("maxLatitude").value = "";
document.getElementById("minLatitude").value = "";
document.getElementById("maxLongitude").value = "";
document.getElementById("minLongitude").value = "";
}

if (what == "samplepoints" || what == 'all'){
for (iSP in samplePoints){
samplePoints[iSP].setMap(null);
}
samplePoints = [];
sampleCoordinates = [];
}
}


function fitMap(){
var c = new Array();
c[0] = document.getElementById("minLatitude").value;
c[1] = document.getElementById("minLongitude").value;
c[2] = document.getElementById("maxLatitude").value;
c[3] = document.getElementById("maxLongitude").value;

if (c[0] != "" && c[1] != "" && c[2] != "" && c[3] != ""){
b = new google.maps.LatLngBounds(
new google.maps.LatLng(Math.max(c[0],c[2]), Math.min(c[1],c[3])),
new google.maps.LatLng(Math.min(c[0],c[2]), Math.max(c[1],c[3])));
map.fitBounds(b);
}
}

function getData(){
            //empty data
            $('#output').val("");
            
            LongDiff = +$('#maxLongitude').val() - +$('#minLongitude').val();
            LatDiff = +$('#maxLatitude').val() - +$('#minLatitude').val();
            //alert(LongDiff);
                
            
            var pointsNS = 10;
            var pointsWE = 10;
            if(LongDiff > LatDiff) {
                pointsNS = 10;
                pointsWE = Math.round(Math.abs(LongDiff/LatDiff) * 10);
            } else {
                pointsWE = 10;
                pointsNS = Math.round(Math.abs(LatDiff/LongDiff) * 10);
            }
            stepsizeLong = parseFloat(LongDiff)/(pointsWE-1);
            stepsizeLat = parseFloat(LatDiff)/(pointsNS-1);
            
            var data = {};
            var calls = [];
            
            // Create an ElevationService.
            elevator = new google.maps.ElevationService();

            var locations = [];

            for(iLat=0; iLat<pointsNS; iLat++) {
                thisLatitude = +$('#minLatitude').val() + iLat*stepsizeLat;	
            
                for(iLong=0; iLong<pointsWE; iLong++) {
                    thisValue = +$('#minLongitude').val() + iLong*stepsizeLong;
                    //searchString = searchString + thisLatitude + "," + thisValue + "|";	
                    var thisCoord = new google.maps.LatLng(thisLatitude, thisValue);
                    locations.push(thisCoord);
                }
            }



            // Create a LocationElevationRequest object using the array's one value
            var positionalRequest = {
            'locations': locations
            }
            
            console.log(positionalRequest);
            //alert(positionalRequest);
            // Initiate the location request
            elevator.getElevationForLocations(positionalRequest, function(results, status) {
                if (status == google.maps.ElevationStatus.OK) {

                    // Retrieve the first result
                    console.log(results)
                    if (results[0]) {
                            var c = 0;
                            op = ''
                        for (iRes in results){
                        var c = c + 1;
                        var del = "\t";
                        if (c == pointsWE)
                        {del = "\n"; c = 0;}
                        op += results[iRes].elevation + del;
                        }
                        // document.getElementById("output").value = op;
                        calculateContour();
                        fitMap();
                    
                } else {alert("No results found");}
                } else {alert("Elevation service failed due to: " + status);}
            });
        }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function calculateContour(){
        clearMap('samplepoints'); //remove existing lines
        for (thisLine in polyLineArray){
        polyLineArray[thisLine].setMap(null); //replot empty
        }//clear polylines if there


        allValues = op; //get all values in 'output'
        if (allValues == ""){
            alert("No data available. Click [get data] first or copy data in the data field manually.");
        }
        else{
            calculate = allValues.split(/\s+/);
            while (calculate[calculate.length-1] == ""){
            calculate.pop(); //remove last empty entries
            }
        var calculateNr = [];
        var sum = 0;
        for(var iNr in calculate)
        {
            calculateNr[iNr] = parseFloat(calculate[iNr]);
            sum = sum + calculateNr[iNr];
        }

        var min = Math.min.apply(Math,calculateNr);
        var max = Math.max.apply(Math,calculateNr);
        var mean = sum/calculateNr.length;

        //create matrix
        var lineArray = allValues.split("\n");
        //remove empty lines at end
        while (lineArray[lineArray.length-1] == ""){
        lineArray.pop();
        }


        var matrix = new Array();
        for(var iLine in lineArray)
        {
        matrix[iLine] = lineArray[iLine].split("\t");
        }

        //set levels
        //////////////
        var level = new Array();

        width = matrix[0].length;
        height = matrix.length;
        // if (document.getElementById("levelInterval").checked) {
            var avg = (Math.abs(LatDiff) + Math.abs(LongDiff)) / 2;
            if(avg <= 0.10) {
                so = (0.1-avg)/0.1*0.2 + 0.25;
                sw = avg/0.1 + 2;
                s = avg/0.1*0.02 + 0.04;
            } else if(avg <= 0.6) {
                so = 0.15;
                sw = avg/0.6*1.5 + 1;
                s = avg/0.6 + 0.2;
            } else {
                so = 0.5
                sw = 3;
                s = avg/3;
            }
            step = s;
            nstep = (max - min) / step;
            for (var iLevel = 0; iLevel < nstep; iLevel++) {
                level[iLevel] = parseFloat(min + step * iLevel);
            }
        // }

        //alert(width + " " + height);
        //convert to numbers
for (var iX = 0; iX<height; iX++) {
for (var iY = 0; iY<width; iY++) {
    matrix[iX][iY] = +matrix[iX][iY];
}
}

var plotResolutionX = 500;
var plotResolutionY = 500;

        //plot elevation as underlay
        svgString = "";
        kmlString = "";


        var Xvalues = new Array();
        for (var iX = 1; iX<height+1; iX++) {
        Xvalues[iX-1] = iX;
        }
        var Yvalues = new Array();
        for (var iY = 1; iY<width+1; iY++) {
        Yvalues[iY-1] = iY;
        }

        polyLineArray = new Array();

        var allVertices = "";
        levelString = "";
        //loop over contours
        for (var iLevel in level){
            var rgb = value2RGB(level[iLevel],level[0],level[level.length-1]);
        var c = new Conrec();
        c.contour(matrix, 0, height-1, 0, width-1, Xvalues, Yvalues, 1, [level[iLevel]]);
        var output = c.contourList();
        //console.log(output);


            
            //plot
            for(iPath = 0; iPath<output.length; iPath++){
                var flightPlanCoordinates = new Array();
                var thesePoints = "";
                var thesePointsKML = "";
                for(iVertex = 0; iVertex<output[iPath].length; iVertex++){
            
                LongDiff = (+$('#maxLongitude').val() - +$('#minLongitude').val());
                LatDiff = (+$('#maxLatitude').val() - +$('#minLatitude').val());
            
                normalizedX = ((output[iPath][iVertex].y-1)/(width-1))*plotResolutionX;
                normalizedY = ((output[iPath][iVertex].x-1)/(height-1))*plotResolutionY;
                
                thesePoints += normalizedX + "," + normalizedY + " ";
                
                
                //prepare overlay on google maps
                

                normalizedLat = +$('#minLatitude').val() + ((output[iPath][iVertex].x-1)/(height-1))*LatDiff;
                normalizedLong = +$('#minLongitude').val() + ((output[iPath][iVertex].y-1)/(width-1))*LongDiff;
                
                thesePointsKML += normalizedLong + "," + normalizedLat + ",0. \n";
                
                flightPlanCoordinates.push(new google.maps.LatLng(normalizedLat, normalizedLong));		
                }
                
                // if(document.getElementById("plotLines").checked){
                //plot polyline
                svgString += '<polyline fill="none" stroke="rgb(' + rgb + ')" stroke-width="2" points="' + thesePoints + '" />'
                kmlString += '<Placemark><name>Contour</name><description>Contour</description><LineString><coordinates>' + thesePointsKML + '</coordinates></LineString></Placemark>';
                // }
            
            
            //overlay on google maps

        flightPath = new google.maps.Polyline({
            path: flightPlanCoordinates,
            strokeColor: '#' + rgbToHex(rgb.split(',')[0],rgb.split(',')[1],rgb.split(',')[2]),
            strokeOpacity: so,
            strokeWeight: sw
        });
            
            //alert(flightPath.getPath())
            polyLineArray.push(flightPath);
            //flightPath.setMap(map);
            
            
            }
            
        }
        svgString += '<rect x="0" y="0" width="' + plotResolutionX + '" height="' + plotResolutionY + '" fill="none" stroke="black" stroke-width="1"/>';

        //print contour legend
        legendHeight = 500;
        legendWidth = 500;
        var legendString = "";
        var legendString2 = "";
        for(var iLevel in level){
        rgb = value2RGB(level[iLevel],level[0],level[level.length-1]);
        legendString += '<rect x="' + parseInt(plotResolutionX+10) + '" y="' + 24*iLevel + '" width="20" height="20" fill="rgb(' + rgb + ')" /> <text x="' + parseInt(plotResolutionX+35) + '" y="' + parseInt(24*iLevel+15) + '">' + meter2unit(level[iLevel],true) + '</text>' 
        legendString2 += '<rect x="' + 10 + '" y="' + 24*iLevel + '" width="20" height="20" fill="rgb(' + rgb + ')" /> <text x="' + 35 + '" y="' + parseInt(24*iLevel+15) + '">' + meter2unit(level[iLevel],true) + '</text>' 
        }

        // document.getElementById("contour").innerHTML = '<svg id="contourPlot" width="' + plotResolutionX*2 + 'px" height="' + plotResolutionY + 'px" version="1.1" xmlns="http://www.w3.org/2000/svg">' + svgString + legendString + "</svg>";
        // document.getElementById("copySVG").innerHTML = document.getElementById("contour").innerHTML;
        // //document.getElementById("copyKML").innerHTML = '<?xml version="1.0" encoding="UTF-8"?><kml xmlns="https://www.opengis.net/kml/2.2"><Document>' + kmlString + '</Document></kml>';
        // document.getElementById("copyKML").innerHTML = '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom"><Document>' + kmlString + '</Document></kml>';

        // document.getElementById("legend").innerHTML = '<svg id="contourPlot" width="' + 150 + 'px" height="' + 500 + 'px" version="1.1" xmlns="https://www.w3.org/2000/svg">' + legendString2 + "</svg>";

        // document.getElementById("min").innerHTML = meter2unit(Math.round(min*10)/10,true);
        // document.getElementById("max").innerHTML = meter2unit(Math.round(max*10)/10,true);

        //var pointsNS = parseInt($('#pointsNS').val());
        //var pointsWE = parseInt($('#pointsWE').val());
        LongDiff = +$('#maxLongitude').val() - +$('#minLongitude').val();
        LatDiff = +$('#maxLatitude').val() - +$('#minLatitude').val();
        meanLong = (+$('#maxLongitude').val() - +$('#minLongitude').val())/2;
        meanLat = (+$('#maxLatitude').val() - +$('#minLatitude').val())/2;
        stepsizeLong = parseFloat(LongDiff)/(width-1);
        stepsizeLat = parseFloat(LatDiff)/(height-1);

        for (iLine in polyLineArray){
            polyLineArray[iLine].setMap(map);
        }
        }
}





function value2RGB(value,min,max){
//value2RGB maps scales a value to fit a colorspace and returnd RGB values as "<R>,<G>,<B>"
//if min and max are equal default to black
var thisR, thisG, thisB;

if (min==max){
//default
output = "0,0,0";
}
else if (value < min){
output = "0,0,255";
}
else if (value > max){
output = "255,0,0";
}

else{
thisNormalizedValue = parseInt((value-min)/(max-min)*1023); //0 to 1023 n=1024

if (thisNormalizedValue>767){
//from red to yellow
thisR = 255;
thisG = 1023 - thisNormalizedValue; //0 to 255
thisB = 0;
}

if (thisNormalizedValue>511 && thisNormalizedValue<768){
//from yellow to green

thisR = thisNormalizedValue - 512; //0 to 255
thisG = 255;
thisB = 0;
}

if (thisNormalizedValue>255 && thisNormalizedValue<512){
//from green to cyan
thisR = 0;
thisG = 255;
thisB = 511 - thisNormalizedValue; //0 to 255
}

if (thisNormalizedValue<256){
//from cyan to blue
thisR = 0;
thisG = thisNormalizedValue; // 0 to 255
thisB = 255;
}
output = thisR + "," + thisG + "," + thisB;
}
return output;
}



function rgbToHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)}
//http://www.javascripter.net/faq/rgbtohex.htm
function toHex(n) {
n = parseInt(n,10);
if (isNaN(n)) return "00";
n = Math.max(0,Math.min(n,255));
return "0123456789ABCDEF".charAt((n-n%16)/16)
  + "0123456789ABCDEF".charAt(n%16);
}



function meter2unit(n,labelFlag){
l = "";
var rounding = 0;
n = Math.round(n*Math.pow(10,rounding))/Math.pow(10,rounding);
//n = Math.round(n);
l = " m";

n = n.toFixed(rounding);

if (labelFlag){
n += l; 
}
return n;
}