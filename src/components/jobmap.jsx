import React from "react";
import L from "leaflet";

const style = {
  width: "100%",
  height: (window.innerHeight - 180) + 'px',
  marginTop: '90px'
};

function decode(encoded, precision) {
  precision = Math.pow(10, - precision);
  let len = encoded.length,
      index = 0,
      lat = 0,
      lng = 0,
      array = [];
  while (index < len) {
      let b, shift = 0,
          result = 0;
      do {
          b = encoded.charCodeAt(index++) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
      } while (b >= 0x20);
      let dlat = ((result & 1) ? ~ (result >> 1) : (result >> 1));
      lat += dlat;
      shift = 0;
      result = 0;
      do {
          b = encoded.charCodeAt(index++) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) ? ~ (result >> 1) : (result >> 1));
      lng += dlng;
      //array.push( {lat: lat * precision, lng: lng * precision} );
      array.push([lat * precision, lng * precision]);
  }
  return array;
}


class JobMap extends React.Component {
  componentDidMount() {
    // create map
    this.map = L.map("map", {
      center: [49.8419, 24.0315],
      zoom: 16,
      layers: [
        L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        })
      ]
    });

    // add layer
    this.layer = L.layerGroup().addTo(this.map);
    this.updateMarkers(this.props.pickMarkers);
  }
  componentDidUpdate({ pickMarkers }) {
    // check if data has changed
    if (this.props.pickMarkers !== pickMarkers) {
      this.updateMarkers(pickMarkers); 
    }
  }
  updateMarkers(pickMarkers) {
    this.layer.clearLayers();
    let board = new L.featureGroup();
    this.map.addLayer(board);

      // let picklist = openJobs.map(job => {
      //   return { latLng: { lat: job.origin_address.lat, lng: job.origin_address.lng }, title: job.id };
      // });
      // let droplist = openJobs.map(job => {
      //   return { latLng: { lat: job.destination_address.lat, lng: job.destination_address.lng }, title: job.id };
      // });
      // let routes = openJobs.map(job => job.route_geometry);


    if (pickMarkers.length){
      this.props.pickMarkers.forEach(job => {
        L.marker({ lat: job.destination_address.lat, lng: job.destination_address.lng }).addTo(board);
        L.marker({ lat: job.origin_address.lat, lng: job.origin_address.lng }).addTo(board);
        let latlngs = decode(job.route_geometry, 6);
        let polyline = L.polyline(latlngs, {
            color: 'red',
            opacity: 0.7,
            weight: 13
        }).addTo(board);
      });

      let bounds = board.getBounds();
      this.map.fitBounds(bounds,{
        padding: [6, 6],
        maxZoom: 16
      });
    }
  }
  render() {
    return <div id="map" style={style} />;
  }
}

export default JobMap;