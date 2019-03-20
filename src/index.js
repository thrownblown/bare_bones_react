import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';

import Button from 'react-bootstrap/Button';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';



import logo from './img/tj_logo.png';
import tile from './img/light_logo.png';
import LoginForm from './loginform.jsx';
import JobBucket from './jobbucket.jsx';


const loki = require('lokijs')

const board_stack = (
  <Container>

  </Container>
);

let tjdb = new loki('twinjet_db', {
  env: 'BROWSER',
  // autoload: true,
  // autoloadCallback : databaseInitialize,
  // autosave: true,
  // autosaveInterval: 10000
});

function databaseInitialize() {
  jerbs = tjdb.getCollection('jobs');
  if (jerbs === null) {
    jerbs = tjdb.addCollection('jobs', { indices: ['id','client.id']});
    jerbs.ensureUniqueIndex('id');    
  }
  return jerbs;
}

let jerbs = databaseInitialize();

window.ffwdDB = function(data) {
  jerbs = databaseInitialize();
    for (let i = data.jobs.length - 1; i >= 0; i--) {
        let jerb = jerbs.by('id',data.jobs[i].id);
        if (jerb){
            for (let p in data.jobs[i]){
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
    } catch (e){
        console.log(e);
        errCount += 1;
        localStorage.head = '';

        if (errCount < 3) {
            loadOrInitLoki();
        } else {
            localStorage.clear();
            initAjax();
            loadOrInitLoki();
            reloadBoard();
        }
    }
    let timeframe = new Date();
    timeframe.setMinutes(59);
    timeframe.setHours(24);
    timeframe.setYear(3000);

    all_jobs_by_deadline(timeframe)
}

function all_jobs_by_deadline(timeframe){
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
    let jrbs = currentJobs[0].jobs;
    const stack =currentJobs.map((jerb) => {
        return (
        <Container style={{marginTop:'90px', marginBottom:'90px'}}>
        <JobBucket  {...jerb} />
        </Container>
      );
    });

    ReactDOM.render(
      stack,
      document.getElementById('root')
    );
}


const top_nav = (
  <Navbar bg="dark" variant="dark" fixed="top" >
    <Nav className="d-sm-none d-md-block">
    <Navbar.Brand href="#home">
      <img src={logo} className="logo-image" width="131px" height="31px"/>
    </Navbar.Brand>
    </Nav>
    <Nav variant="pills" className="ml-auto" activeKey="/unassigned">
      <Nav.Item>
        <Nav.Link href="/myjobs">My Jobs</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link href="/alljobs">All Jobs</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link href="/unassigned">Unassigned</Nav.Link>
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

if (localStorage['tj-head']){
  let auth_token = localStorage['tj_id-access_token'];
  fetch("https://twinjet.co/boardapi/v1/jobdeltas/head/", {
    headers: {
        "Authorization": "Bearer " + auth_token,
        "Content-Type": "application/json",
    },
    method: "get"
  }).then((response) =>{
    if (response.status >= 400 && response.status < 600) {
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
  }).then((responseJson) => {
    localStorage['tj-head'] = responseJson['head'];
    console.log(responseJson);
    ffwdDB(responseJson);
    ReactDOM.render(
      top_nav,
      document.getElementById('top_nav')
    );

    ReactDOM.render(
      bottom_nav,
      document.getElementById('bottom_nav')
    );
  });
} else {
    ReactDOM.render(
      login_container,
      document.getElementById('root')
    );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();