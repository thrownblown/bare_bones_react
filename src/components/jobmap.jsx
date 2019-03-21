import React from "react";
import L from "leaflet";

const style = {
  width: "100%",
  height: (window.innerHeight - 120) + 'px',
  marginTop: '90px'
};

const moneygreen = '#85bb65'

const greenstyle = `
  background-color: ${moneygreen};
  width: 2rem;
  height: 2rem;
  display: block;
  left: -1rem;
  top: -1rem;
  position: relative;
  border-radius: 2rem 2rem 0;
  transform: rotate(45deg);
  border: 1px solid #FFFFFF`

const icon = L.divIcon({
  className: "my-custom-pin",
  iconAnchor: [0, 24],
  labelAnchor: [-6, 0],
  popupAnchor: [0, -36],
  html: `<span style="${greenstyle}" />`
})

function popupTemplate(job) {
  const popup = `
  <div class="row">
    <div class="col">
      <strong>${job.origin_address.name}</strong><br/>
      ${job.origin_address.street_address}<br/>
      ${job.origin_address.floor}<br/>
      ${job.origin_address.city} ${job.origin_address.state} ${job.origin_address.postal_code}<br/>
      ${job.origin_address.contact}<br/>
      ${job.origin_address.special_instructions}<br/>
    </div>
    <div class="col">
      <strong>${job.destination_address.name}</strong><br/>
      ${job.destination_address.street_address}<br/>
      ${job.destination_address.floor}<br/>
      ${job.destination_address.city} ${job.destination_address.state} ${job.destination_address.postal_code}<br/>
      ${job.destination_address.contact}<br/>
      ${job.destination_address.special_instructions}<br/>
    </div>
  </div>`
    return popup;
}


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
          attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
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

    if (pickMarkers.length){
      this.props.pickMarkers.forEach(job => {
        const randomcolor = '#' + ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6);

       let ribbonColor;
        // classify by ribbonColor, set map options here
        if (job.status === 'Assigned') {
            ribbonColor = '#f7b731';
        } else if (job.status === 'Picked Up') {
            ribbonColor = '#216C2A';
        } else if (job.status === 'Delivered') {
            return;
        } else if (job.status === 'Completed') {
            return;
        } else if (job.status === 'Unassigned') {
            ribbonColor = '#FF91AF';
        } else {
            ribbonColor = '#1974D2';
        }

        const randomstyle = `
          background-color: ${randomcolor};
          width: 2rem;
          height: 2rem;
          display: block;
          left: -1rem;
          top: -1rem;
          position: relative;
          border-radius: 2rem 2rem 0;
          transform: rotate(45deg);
          border: 1px solid #FFFFFF`;

        const ricon = L.divIcon({
          className: "r-custom-pin",
          iconAnchor: [0, 24],
          labelAnchor: [-6, 0],
          popupAnchor: [0, -36],
          html: `<span style="${randomstyle}" />`
        });

        let popup = popupTemplate(job);
        let pick = L.marker({ lat: job.destination_address.lat, lng: job.destination_address.lng }, { icon: ricon }).addTo(board);
        let drop = L.marker({ lat: job.origin_address.lat, lng: job.origin_address.lng }, { icon: icon });
        drop.bindPopup(popup, { minWidth : 300 } ).openPopup();
        drop.addTo(board);
        let latlngs = decode(job.route_geometry, 6);
        let polyline = L.polyline(latlngs, {
            color: ribbonColor,
            opacity: 0.7,
            weight: 12
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