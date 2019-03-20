import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

import logo from './img/tj_logo.png';
import tile from './img/light_logo.png';
import LoginForm from './components/loginform.jsx';
import JobBucket from './components/jobbucket.jsx';

//**********************************************
//* CONSTANTS
//**********************************************

const VIEW_MODE_MY_JOBS = "myjobs",
    VIEW_MODE_EVERYBODY = "everybody",
    VIEW_MODE_UNASSIGNED = "unassigned",

    SORT_MODE_CLIENT = "client",
    SORT_MODE_COURIER = "courier",
    SORT_MODE_DEADLINE = "deadline",
    SORT_MODE_STATUS = "status",
    SORT_MODE_ZIP = "zip",
    SORT_MODE_ZONE = "zone",

    FILTER_MODE_MY_CLIENTS = "myclients",
    FILTER_MODE_ALL_CLIENTS = "allclients",

    JOB_MENU_UNASSIGNED = 'unassignedmenu',
    JOB_MENU_NOT_PICKED = 'notpickedmenu',
    JOB_MENU_PICKED = 'pickedmenu',
    JOB_MENU_DELIVERED = 'deliveredmenu',
    JOB_MENU_COMPLETED = 'completedmenu';

var currentJobs,
    currentViewMode,
    expandAll,
    showComped,
    lookahead,
    lookaheadMinutes,
    currentFilterMode,
    sortModeForMyJobs,
    sortModeForEverybodyJobs,
    sortModeForUnassignedJobs,
    toggleStorts,
    timeframe;
var showStatus = false;
var showCourier = false;

//**********************************************
//* Loki init
//**********************************************

const loki = require('lokijs');
const lokiAdapter = require("lokijs/src/loki-indexed-adapter.js");
let activeClients = [];
let activeCouriers = [];
let myClients = [];
let clientsets = [];
let tjdb = new loki('twinjet_db', {
  env: 'BROWSER',
  // autoload: true,
  // autoloadCallback : databaseInitialize,
  // autosave: true,
  // autosaveInterval: 10000
});

function databaseInitialize () {
  jerbs = tjdb.getCollection('jobs');
  if (jerbs === null) {
    jerbs = tjdb.addCollection('jobs', { indices: ['id','client.id'] });
    jerbs.ensureUniqueIndex('id');
  }
  return jerbs;
}

function initFetch (initCallback) {
  let count = 0;

  twinget('https://twinjet.co/boardapi/v1/status/', (data) =>{
    if (data.checked_in){
      localStorage.myClients = JSON.stringify(data.my_clients);
      localStorage.myClientSets = JSON.stringify(data.clientsets);
      myClients = data.my_clients;
      localStorage.excludedZones = JSON.stringify(data.excluded_zones);
      localStorage.seed_bounds = JSON.stringify(data.seed_bounds);

    } else {
      localStorage.myClients = "[]";
      localStorage.excludedZones = "[]";
      currentFilterMode = FILTER_MODE_ALL_CLIENTS;
    }
    localStorage.profile = JSON.stringify(data.profile);
    count += 1;
    if (initCallback && count == 4){
      initCallback();
    }
  });

  twinget('https://twinjet.co/boardapi/v1/clientsets/', (data) =>{
    localStorage.clientsets = JSON.stringify(data);
    clientsets = data;
    count += 1;
    if (initCallback && count == 4){
      initCallback();
    }
  });

  twinget('https://twinjet.co/boardapi/v1/clients/', (data) =>{
    localStorage.allClients = JSON.stringify(data);
    count += 1;
    if (initCallback && count == 4){
      initCallback();
    }
  });

  twinget('https://twinjet.co/boardapi/v1/profiles/', (data) =>{
    localStorage.activeCouriers = JSON.stringify(data);
    activeCouriers = data;
    count += 1;
    if (initCallback && count == 4){
      initCallback();
    }
  });
}

let jerbs = databaseInitialize();

window.ffwdDB = function (data) {
  jerbs = databaseInitialize();
  for (let i = data.jobs.length - 1; i >= 0; i--) {
  let jerb = jerbs.by('id', data.jobs[i].id);
  if (jerb) {
    for (let p in data.jobs[i]) {
    jerb[p] = data.jobs[i][p];
    }
    jerbs.update(jerb);
  } else {
    jerbs.insert(data.jobs[i]);
  }
  }
  try {
  tjdb.save();
  localStorage.head = data.head;
  localStorage.headDate = new Date();
  } catch (e) {
  console.log(e);
  localStorage.head = '';
  }
  let timeframe = new Date();
  timeframe.setMinutes(59);
  timeframe.setHours(24);
  timeframe.setYear(3000);

  all_jobs_by_deadline(timeframe);
};

function all_jobs_by_deadline (timeframe) {
  let currentJobs = [];
  // console.log('all_by_deadline');
  let jobbers = jerbs.addDynamicView('unassignedByDeadline');
  jobbers.applyFind({'is_cancelled': false});
  jobbers.applyFind({'status':{'$ne':'Undeliverable'}});
  // if (!showCompleted) {
  jobbers.applyFind({'status':{'$ne':'Completed'}});
  // }
  jobbers.applyFind({'ready_timestamp':{'$lt':timeframe.getTime()}});
  jobbers.applySortCriteria(['due_timestamp', 'id']);
  currentJobs.push({
    header_count: jobbers.data().length,
    header_id: 'all_by_deadline',
    header_name: 'All By Deadline',
    jobs: jobbers.data()
  });
  console.log(currentJobs);
  // currentJobs[0].jobs.forEach((jerb) => {
  //   console.log(jerb);
  // });
  const stack = currentJobs.map((bucket) => {
    return (
      <Container style={{ marginTop: '90px', marginBottom: '90px' }}>
        <JobBucket {...bucket} />
      </Container>
    );
  });

  ReactDOM.render(
    stack,
    document.getElementById('root')
  );
}

function sortByKey (array) {
  return array.sort(function(a, b) {
  let x = a.courier_number; let y = b.courier_number;
  try {
    x = Number(x);
    y = Number(y);
  } catch (e) {}
  return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}

function all_jobs_by_client (timeframe) {
  // console.log('all_jobs_by_client');
  for (let ddd in activeClients){
    let jobbers = jerbs.chain();
    jobbers.find({'is_cancelled': false});
    jobbers.find({'status':{'$ne':'Undeliverable'}});
    if (!showCompleted) {
      jobbers.find({'status':{'$ne':'Completed'}});
    }
    jobbers.find({'ready_timestamp':{'$lt':timeframe.getTime()}});
    jobbers.find({'client.name':activeClients[ddd].name});
    // jobbers.compoundsort(['due_timestamp', 'id']);
    let jobList = jobbers.data();
    if (jobList.length > 0) {
      let uuus = jobbers.copy().find({'status': 'Unassigned'}).data().length.toString();
      let aaas = jobbers.copy().find({'status': 'Assigned'}).data().length.toString();
      let pees = jobbers.copy().find({'status': 'Picked Up'}).data().length.toString();
      let headerCount =  'U' + uuus + ' | A' + aaas + ' | P' + pees;
      let jobject = {
        header_count: headerCount,
        header_id: activeClients[ddd].name.replace(/[^a-zA-Z1-9]+/g, '')+currentViewMode+currentFilterMode,
        header_name: activeClients[ddd].name,
        jobs: jobList
      };
      currentJobs.push(jobject);
    }
  }
}

function courierFilter (courier, jobbers) {
  //if homie has a job for a client that is one of our clients, return true;
  let results = jobbers.copy().find({ 'client.id' : { '$in' : myClientIds } }).data().length;
  if (results > 0){
  return true;
  }

  //if homie has a clientset that matches one of our clientsets, return true;
  if (myClientSets.length === 0){
  return true;
  }

  if (courier.checkin){
  for (let hotel in courier.checkin.clientsets){
    if ($.inArray(courier.checkin.clientsets[hotel].id, myIds) != -1) {
    return true;
    }
  }
  }
  return false;
}

function all_jobs_by_courier (timeframe) {
  if (currentFilterMode == FILTER_MODE_MY_CLIENTS) {
    let myClientIds = [];
    for (let charlie in myClients) {
    myClientIds.push(myClients[charlie].id);
    }

    let myClientSets = JSON.parse(localStorage.myClientSets);
    let myIds = [];
    for (let india in myClientSets) {
    myIds.push(myClientSets[india].id);
    }
  }

  // console.log('all_jobs_by_courier');
  activeCouriers = sortByKey(activeCouriers);
  for (let ddd in activeCouriers){
    let query = activeCouriers[ddd];
    let jobbers = jerbs.chain();
    jobbers.find({'is_cancelled': false});
    jobbers.find({'status':{'$ne':'Undeliverable'}});
    if (!showCompleted) {
      jobbers.find({'status':{'$ne':'Completed'}});
    }
    jobbers.find({'ready_timestamp':{'$lt':timeframe.getTime()}});
    jobbers.find({'courier_id': query.id});
    // jobbers.compoundsort(['due_timestamp', 'id']);

    let showCourier;
    if (currentFilterMode == FILTER_MODE_ALL_CLIENTS) {
      showCourier = true;
    } else {
      showCourier = courierFilter(activeCouriers[ddd], jobbers);
    }

    let jobList = jobbers.data();

    if ((jobList.length > 0) && (showCourier)){

      let aaas = jobbers.copy().find({'status': 'Assigned'}).data().length.toString();
      let pees = jobbers.copy().find({'status': 'Picked Up'}).data().length.toString();
      let headerCount =  'A' + aaas + ' | P' + pees;
      let headerString = query.courier_number + ' ' + query.user.first_name + ' ' + query.user.last_name;

      let jobject = {
        header_count: headerCount,
        header_name: headerString,
        header_id: headerString.replace(/[^a-zA-Z1-9]+/g, ''),
        jobs: jobList
      };
      currentJobs.push(jobject);
    }
  }
  let unassignedJobbers = jerbs.addDynamicView('unassignedByDeadline');
  unassignedJobbers.applyFind({'ready_timestamp':{'$lt':timeframe.getTime()}});
  unassignedJobbers.applyFind({'is_cancelled': false});
  unassignedJobbers.applyFind({'status':'Unassigned'});
  if (currentFilterMode == FILTER_MODE_MY_CLIENTS && myClients.length > 0){
    let idarray = [];
    for (let client in myClients) {
      idarray.push(myClients[client].id);
    }
    unassignedJobbers.applyFind({'client.id':{'$in':idarray}});

  }
  // unassignedJobbers.applySortCriteria(['due_timestamp', 'id']);

  if (unassignedJobbers.data().length) {
    currentJobs.unshift({
      header_count: unassignedJobbers.data().length,
      header_id: 'all_jobs_by_courier',
      header_name: 'Unassigned',
      jobs: unassignedJobbers.data()
    });
  }
}

function all_jobs_by_status (timeframe) {
  // console.log('all_jobs_by_status');
  let stati = ['Unassigned', 'Assigned', 'Picked Up', 'Delivered'];
  if (showCompleted) {
    stati.push('Completed');
  }
  let idarray = [];
  for (let client in myClients) {
    idarray.push(myClients[client].id);
  }
  for (let status in stati){
    let jobbers = jerbs.addDynamicView('allByStatus');
    jobbers.applyFind({'ready_timestamp':{'$lt':timeframe.getTime()}});
    jobbers.applyFind({'is_cancelled': false});
    jobbers.applyFind({'status':stati[status]});
    if (currentFilterMode == FILTER_MODE_MY_CLIENTS && myClients.length > 0){
      jobbers.applyFind({'client.id':{'$in':idarray}});

    }
    // jobbers.applySortCriteria(['due_timestamp', 'id']);
    jobbers = jobbers.data();
    if (jobbers.length > 0) {
      let jobject = {
        header_count: jobbers.length,
        header_id: stati[status].replace(/ /g, ''),
        // header_id: status+currentViewMode+currentFilterMode,
        header_name: stati[status],
        jobs: jobbers
      };
      currentJobs.push(jobject);
    }
  }
}

function unassigned_jobs_by_deadline (timeframe) {
  // console.log('unassigned_jobs_by_deadline');
  let unassignedJobbers = jerbs.addDynamicView('unassignedByDeadline');
  unassignedJobbers.applyFind({'is_cancelled': false});
  unassignedJobbers.applyFind({'ready_timestamp':{'$lt':timeframe.getTime()}});
  unassignedJobbers.applyFind({'status':'Unassigned'});

  if (currentFilterMode == FILTER_MODE_MY_CLIENTS){
  let exZones = JSON.parse(localStorage.excludedZones);
  unassignedJobbers.applyWhere(function exCluded(job) {
       if (job.origin_address.zone && job.destination_address.zone) {
        return (exZones.indexOf(job.origin_address.zone.id) == -1 || exZones.indexOf(job.destination_address.zone.id) == -1);
      } else {
        return true;
      }
    });
    if (myClients.length > 0){
      let idarray = [];
      for (let client in myClients) {
        idarray.push(myClients[client].id);
      }
      unassignedJobbers.applyFind({'client.id':{'$in':idarray}});
    }
  }

  // unassignedJobbers.applySortCriteria(['due_timestamp', 'id']);
  unassignedJobbers = unassignedJobbers.data();
  if (unassignedJobbers.length>0){
    currentJobs.push({
      header_count: unassignedJobbers.length,
      header_id: 'unassigned_jobs_by_deadline',
      // header_id: currentViewMode + currentFilterMode + 'unassigned_jobs_by_deadline' +currentViewMode + currentFilterMode,
      header_name: 'Deadline',
      jobs: unassignedJobbers
    });
  }
}

function unassigned_jobs_by_client (timeframe) {
  // console.log('unassigned_jobs_by_client');
  for (let ddd in activeClients){
    let jobbers = jerbs.addDynamicView('unassigned_jobs_client');
    jobbers.applyFind({'is_cancelled': false});
    jobbers.applyFind({'client.name':activeClients[ddd].name});
    jobbers.applyFind({'ready_timestamp':{'$lt':timeframe.getTime()}});
    jobbers.applyFind({'status': 'Unassigned'});

    if (currentFilterMode == FILTER_MODE_MY_CLIENTS){
  let exZones = JSON.parse(localStorage.excludedZones);
  jobbers.applyWhere(function exCluded(job) {
         if (job.origin_address.zone && job.destination_address.zone) {
          return (exZones.indexOf(job.origin_address.zone.id) == -1 || exZones.indexOf(job.destination_address.zone.id) == -1);
        } else {
          return true;
        }
      });
      if (myClients.length > 0){
        let idarray = [];
        for (let client in myClients) {
          idarray.push(myClients[client].id);
        }
        jobbers.applyFind({'client.id':{'$in':idarray}});
      }
    }

    // jobbers.applySortCriteria(['due_timestamp', 'id']);
    jobbers = jobbers.data();
    if (jobbers.length > 0) {
      let jobject = {
        header_count: jobbers.length,
        header_id: activeClients[ddd].name.replace(/[^a-zA-Z1-9]+/g, ''),
        header_name: activeClients[ddd].name,
        jobs: jobbers
      };
      currentJobs.push(jobject);
    }
  }
}

function my_jobs_by_status () {
  // console.log('my_jobs_by_status');
  let stati = ['Unassigned', 'Assigned', 'Picked Up', 'Delivered'];
  if (showCompleted) {
    stati.push('Completed');
  }
  let idarray = [];
  for (let client in myClients) {
    idarray.push(myClients[client].id);
  }
  let query = JSON.parse(localStorage.profile);
  query = query.id;

  for (let status in stati){
    let jobbers = jerbs.addDynamicView('my_jobs_by_status');
    jobbers.applyFind({'is_cancelled': false});
    jobbers.applyFind({'status':stati[status]});
    jobbers.applyFind({'courier_id': query});
    // jobbers.applySortCriteria(['due_timestamp', 'id']);
    jobbers = jobbers.data();
    if (jobbers.length > 0) {
      let jobject = {
        header_count: jobbers.length,
        header_id: stati[status].replace(/ /g, ''),
        // header_id: status+currentViewMode+currentFilterMode,
        header_name: stati[status],
        jobs: jobbers
      };
      currentJobs.push(jobject);
    }
  }
}

function my_jobs_by_deadline () {
  // console.log('my_jobs_by_deadline');
  let query = JSON.parse(localStorage.profile);
  query = query.id;
  let jobbers = jerbs.addDynamicView('my_jobs_by_deadline');
  jobbers.applyFind({'courier_id': query});
  jobbers.applyFind({'is_cancelled': false});
  jobbers.applyFind({'status':{'$ne':'Undeliverable'}});
  if (!showCompleted) {
    jobbers.applyFind({'status':{'$ne':'Completed'}});
  }

  // jobbers.applySortCriteria(['due_timestamp', 'id']);
  currentJobs.push({
    header_count: jobbers.data().length,
    header_id: 'my_jobs_by_deadline',
    // header_id: currentViewMode + currentFilterMode + 1 + currentViewMode + currentFilterMode,
    header_name: 'Deadline',
    jobs: jobbers.data()
  });
}

function my_jobs_by_client () {
  // console.log('my_jobs_by_client');
  let query = JSON.parse(localStorage.profile);
  query = query.id;
  for (let ddd in activeClients){
    let jobbers = jerbs.addDynamicView('my_jobs_by_client');
    jobbers.applyFind({'courier_id': query});
    jobbers.applyFind({'is_cancelled': false});
    jobbers.applyFind({'status':{'$ne':'Undeliverable'}});
    if (!showCompleted) {
      jobbers.applyFind({'status':{'$ne':'Completed'}});
    }
    jobbers.applyFind({'client.name':activeClients[ddd].name});
    // jobbers.applySortCriteria(['due_timestamp', 'id']);
    jobbers = jobbers.data();
    if (jobbers.length > 0) {
      let jobject = {
        header_count: jobbers.length,
        header_id: activeClients[ddd].name.replace(/[^a-zA-Z1-9]+/g, ''),
        header_name: activeClients[ddd].name,
        jobs: jobbers
      };
      currentJobs.push(jobject);
    }
  }
}

function unassigned_jobs_by_zone (timeframe) {
  // console.log('unassigned_jobs_by_zone');
  let unassignedJobbers = jerbs.addDynamicView('unassignedByDeadline');
  unassignedJobbers.applyFind({
    'is_cancelled': false
  });
  unassignedJobbers.applyFind({
    'ready_timestamp': {
      '$lt': timeframe.getTime()
    }
  });
  unassignedJobbers.applyFind({
    'status': 'Unassigned'
  });
  if (currentFilterMode == FILTER_MODE_MY_CLIENTS && myClients.length > 0) {
    let idarray = [];
    for (let client in myClients) {
      idarray.push(myClients[client].id);
    }
    unassignedJobbers.applyFind({
      'client.id': {
        '$in': idarray
      }
    });

  }
  // unassignedJobbers.applySortCriteria(['due_timestamp', 'id']);
  unassignedJobbers = unassignedJobbers.data();
  if (unassignedJobbers.length > 0) {
    let jobject = {};

    unassignedJobbers.forEach(function(item){
      let zipString = item.destination_address.zone ? item.destination_address.zone.zone_name : 'Zone Unknown';
      if (jobject[zipString]){
        jobject[zipString].jobs.push(item);
        jobject[zipString].header_count = jobject[zipString].jobs.length.toString();
      } else{
        jobject[zipString] = {
          header_count: '1',
          header_id: item.destination_address.zone ? item.destination_address.zone.id.toString() : 'ZoneUnknown',
          header_name: zipString,
          jobs: [item]
        };
      }
    });

    for (let item in jobject) {
      currentJobs.push(jobject[item]);
    }
  }
}

function unassigned_jobs_by_zipcode (timeframe) {
  // console.log('unassigned_jobs_by_zipcode');
  let unassignedJobbers = jerbs.addDynamicView('unassignedByDeadline');
  unassignedJobbers.applyFind({
    'is_cancelled': false
  });
  unassignedJobbers.applyFind({
    'ready_timestamp': {
      '$lt': timeframe.getTime()
    }
  });
  unassignedJobbers.applyFind({
    'status': 'Unassigned'
  });
  if (currentFilterMode == FILTER_MODE_MY_CLIENTS && myClients.length > 0) {
    let idarray = [];
    for (let client in myClients) {
      idarray.push(myClients[client].id);
    }
    unassignedJobbers.applyFind({
      'client.id': {
        '$in': idarray
      }
    });
  }
  // unassignedJobbers.applySortCriteria(['due_timestamp', 'id']);
  unassignedJobbers = unassignedJobbers.data();
  if (unassignedJobbers.length > 0) {
    let jobject = {};

    unassignedJobbers.forEach(function(item){
      let zipString = item.destination_address.postal_code;
      if(typeof zipString == 'number'){
        zipString = zipString.toString();
      } else if (zipString) {
        zipString = zipString.replace(/ /g, '');
      }

      if (!zipString) {
        zipString = 'Post Code Unknown';
      }

      if (jobject[zipString]){
        jobject[zipString].jobs.push(item);
        jobject[zipString].header_count = jobject[zipString].jobs.length.toString();
      } else{
        jobject[zipString] = {
          header_count: '1',
          header_id: zipString,
          header_name: zipString,
          jobs: [item]
        };
      }
    });

    for (let item in jobject) {
      currentJobs.push(jobject[item]);
    }
  }
}

function twinget (geturl, successCallback) {
  console.log('twinget', geturl);
  let auth_token = localStorage['tj_id-access_token'];
  return fetch(geturl, {
  headers: {
    'Authorization': 'Bearer ' + auth_token,
    'Content-Type': 'application/json'
  },
  method: 'get'
  }).then((response) => {
  if (response.status >= 400 && response.status < 600) {
    localStorage.clear();
    ReactDOM.render(
    login_container,
    document.getElementById('root')
    );
  }
  return response.json();
  }, (err) => {
  console.log(err);
  ReactDOM.render(
    login_container,
    document.getElementById('root')
  );
  }).then((data) => {
    successCallback ? successCallback(data) : console.log(data);
  });
}

const top_nav = (
  <Navbar bg="dark" variant="dark" fixed="top" >
  <Nav className="d-none d-md-block">
    <Navbar.Brand href="#home">
      <img src={logo} className="logo-image" width="131px" height="31px"/>
    </Navbar.Brand>
  </Nav>
  <Nav className="d-md-none">
    <Navbar.Brand href="#home">
      <img src={tile} className="logo-image" width="31px" height="31px"/>
    </Navbar.Brand>
  </Nav>
  <Nav variant="pills" className="ml-auto" activeKey="#unassigned">
    <Nav.Item>
    <Nav.Link href="#myjobs">My Jobs</Nav.Link>
    </Nav.Item>
    <Nav.Item>
    <Nav.Link href="#alljobs">All Jobs</Nav.Link>
    </Nav.Item>
    <Nav.Item>
    <Nav.Link href="#unassigned">Unassigned</Nav.Link>
    </Nav.Item>
  </Nav>
  </Navbar>
);

const top_nav_anon = (
  <Navbar bg="dark" variant="dark" fixed="top" >
  <Navbar.Brand href="#home">
    <img src={logo} className="logo-image" width="131px" height="31px"/>
  </Navbar.Brand>
  </Navbar>
);

const bottom_nav = (
  <Navbar bg="light" variant="light" fixed="bottom" >
  <Nav justify variant="pill" defaultActiveKey="/myjobs">
    <Nav.Item>
    <Nav.Link href="/myjobs">My Jobs</Nav.Link>
    </Nav.Item>
    <Nav.Item>
    <Nav.Link href="#alljobs">All Jobs</Nav.Link>
    </Nav.Item>
    <Nav.Item>
    <Nav.Link href="#unassigned">Unassigned</Nav.Link>
    </Nav.Item>
  </Nav>
  </Navbar>
);

const login_container = (
  <Container className="h-100">
  <Row className="h-100">
    <Col id="mid" className="my-auto">
    <Jumbotron>
      <LoginForm />
    </Jumbotron>
    </Col>
  </Row>
  </Container>
);

ReactDOM.render(
  top_nav_anon,
  document.getElementById('top_nav')
);

initFetch(() => {
  if (localStorage['tj-head']) {
    let auth_token = localStorage['tj_id-access_token'];

    twinget('https://twinjet.co/boardapi/v1/jobdeltas/head/', (responseJson) => {
      localStorage['tj-head'] = responseJson['head'];
      console.log(responseJson);
      ffwdDB(responseJson);
      ReactDOM.render(
        top_nav,
        document.getElementById('top_nav')
      );
      // ReactDOM.render(
      //   bottom_nav,
      //   document.getElementById('bottom_nav')
      // );
    });
  } else {
    ReactDOM.render(
      login_container,
      document.getElementById('root')
    );
  } 
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();