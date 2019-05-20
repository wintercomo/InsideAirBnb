﻿document.addEventListener('DOMContentLoaded', function () {
    mapboxgl.accessToken = 'pk.eyJ1Ijoid2ludGVyY29tbyIsImEiOiJjanZncnFjdTIwYTJwM3ltajlmODQ0bWlpIn0.LbLEHOHfmrzlq6D5kLd1yQ';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v10',
        center: [4.893, 52.373],
        zoom: 12,
        maxZoom: 15,
    });
    let popup = new mapboxgl.Popup({ closeOnClick: false });
    let clicked = false;
    popup.on("close", () => {
        clicked = false;
    });
    const generatePopUp = (e) => {
        let listingAmmout = e.features[0].properties.calculated_host_listings_count;
        let listing_ammount = "";
        if (listingAmmout - 1 <= 0) {
            listing_ammount = "No listings known"
        } else {
            listing_ammount = e.features[0].properties.calculated_host_listings_count + " other listings known";
        }
        popup.setLngLat(e.lngLat)
            .setHTML("<div class='pup_up'> " +
                "<b>" + e.features[0].properties.host_name + "</b> <br>" +
                "<sub>(" + listing_ammount + ")</sub> " +
                "<hr> <p id='listing_id'>" + e.features[0].properties.id + "</p> " +
                "<p id='listingNameContainer' > " + e.features[0].properties.name + "</p> " +
                "<p id='neigbourhood'>" + e.features[0].properties.neighbourhood + "</p> " +
                "<p id='room_type' > " + e.features[0].properties.room_type + "</p> <hr> " +
                "<div class='income_section>'<p id='income'>&euro;INSERT EXPECTED INCOME</p> " +
                "<div class='listingSectionSubhead'><p id='location_price'>&euro;" + e.features[0].properties.price + "/night <br></p>" +
                "<p id='minimun_nights'>" + e.features[0].properties.minimum_nights + " nights minimum</p></div></div> " +
                "<br> <p id='nights_per_year'>(INSERT) nights per year (est.)</p> " +
                "<div class='listingSectionSubhead'><p id='occupancy_rate'>(INSERT) occupancy rate (est.)</p> " +
                "<p id='reviews_per_month'>" + e.features[0].properties.reviews_per_month + " reviews per month</p> " +
                "<p id='number_of_reviews'>" + e.features[0].properties.number_of_reviews + " reviews</p> " +
                "<p id='last_review'> last review on " + e.features[0].properties.last_review + " <br></p></div> " +
                "<p id='availability'>(INSERT) availability</p> " +
                "<sub id='availability_365'>" + e.features[0].properties.availability_365 + "days/year(PERCENTAGE%)</sub>  <br>" +
                "<sub>click listing on map to 'pin' details</sub> " +
                "</div > ")
            .addTo(map);
    };
    document.getElementById("map_filter").addEventListener("change", () => {
        //document.getElementById("filter_value").innerText = document.getElementById("map_filter").value
        var label = $('#map_filter :selected').parent().attr('label');
        var selectedValue = document.getElementById("map_filter").value;
        var filterBy = "=="
        switch (label) {
            case "review rating":
                filterBy = "<=";
                selectedValue = parseInt(selectedValue)
                label = "review_rating"
                break;
            case "price":
                if (selectedValue == "1000+") {
                    selectedValue = selectedValue.slice(0, selectedValue.length - 1);
                    filterBy = ">"
                } else {
                    filterBy = "<="
                }
                selectedValue = parseInt(selectedValue)
                break;
            default:
                map.setFilter('locations_layer', null);
                break;
        }
        console.log("Passed swirch")
        map.setFilter('locations_layer', [filterBy, label, selectedValue]);
    });
    map.on('load', function () {
        map.addLayer({
            "id": "locations_layer",
            "type": "circle",
            "source": {
                "type": "geojson",
                "data": '/listings',
            },
            'paint': {
                // color circles by ethnicity, using a match expression
                // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
                'circle-color': [
                    'match',
                    ['get', 'room_type'],
                    'Entire home/apt', '#fbb03b',
                    'Private room', '#223b53',
                    'Shared room', '#e55e5e',
            /* other */ '#ccc'
                ]
            }
        });
        map.on('sourcedata', () => {
            var features = map.queryRenderedFeatures({ layers: ['locations_layer'] })
            document.getElementById("number_listings_loaded").innerText = features.length + " listings loaded"
        });
        //map.setFilter('locations_layer', [">", "price", 100]);
        map.addControl(new mapboxgl.NavigationControl());
        map.on('click', 'locations_layer', function (e) {
            clicked = !clicked;
            generatePopUp(e);
        });
        map.on('mouseenter', 'locations_layer', function (e) {
            map.getCanvas().style.cursor = 'pointer';
            if (!clicked) {
                generatePopUp(e);
            }
        });

        // Change it back to a pointer when it leaves.
        map.on('mouseleave', 'locations_layer', function (e) {
            map.getCanvas().style.cursor = '';
            if (!clicked) {
                popup.remove();
            }
        });
    });
}, false);