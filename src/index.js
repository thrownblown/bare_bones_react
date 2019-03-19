import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Collapse from 'react-bootstrap/Collapse';
import logo from './img/tj_logo.png';
import tile from './img/light_logo.png';


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

var jerbs = databaseInitialize();

function ffwdDB(data) {
  jerbs = databaseInitialize();
    for (var i = data.jobs.length - 1; i >= 0; i--) {
        var jerb = jerbs.by('id',data.jobs[i].id);
        if (jerb){
            for (var p in data.jobs[i]){
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
    all_jobs_by_deadline(timeframe)
}




function all_jobs_by_deadline(timeframe){
    let currentJobs = [];
    // console.log('all_by_deadline');
    var jobbers = jerbs.addDynamicView('unassignedByDeadline');
    jobbers.applyFind({'is_cancelled': false});
    jobbers.applyFind({'status':{'$ne':'Undeliverable'}});
    // if (!showCompleted) {
        jobbers.applyFind({'status':{'$ne':'Completed'}});
    // }
    jobbers.applyFind({'ready_timestamp':{'$lt':timeframe.getTime()}});
    // jobbers.applySortCriteria(['due_timestamp', 'id']);
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
    const stack = (
        <Container style={{marginTop:'90px', marginBottom:'90px'}}>
        <JobBucket jobs={jrbs} />
        </Container>
      );

    ReactDOM.render(
      stack,
      document.getElementById('root')
    );

}


const TJ_APP_KEY = 'XgxsVrC19N9t2a5LdD0Ask9Y4dCBReDRMXHtioCf';
const TJ_APP_SECRET = 'xCxElvOFdmNZDNYnLio5zFb4ybSKqDbBwrRhs9m6MdvsnqL6DuH6sidYQubmSmNDmyNblsf2hWqYYczJwmjZwZrZRGednyM3EoZdvvX31hSvgQngfgfo84MFV5YrbRvG';

const top_nav = (
  <Navbar bg="dark" variant="dark" fixed="top" >
    <Navbar.Brand href="#home">
      <img src={logo} className="logo-image" width="131px" height="31px"/>
    </Navbar.Brand>
    <Nav className="mr-auto">
      <Nav.Link href="#myjobs">My Jobs</Nav.Link>
      <Nav.Link href="#alljobs">All Jobs</Nav.Link>
      <Nav.Link href="#unassigned">Unassigned</Nav.Link>
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
    <Navbar.Brand href="#home">TJ</Navbar.Brand>
    <Nav className="mr-auto">
      <Nav.Link href="#myjobs">My Jobs</Nav.Link>
      <Nav.Link href="#alljobs">All Jobs</Nav.Link>
      <Nav.Link href="#unassigned">Unassigned</Nav.Link>
    </Nav>
  </Navbar>
);

class LoginForm extends React.Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: "",
      isLoading: false
    };
  }

  handleEmailChange = evt => {
    this.setState({ email: evt.target.value });
  };

  handlePasswordChange = evt => {
    this.setState({ password: evt.target.value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState(state => ({
      isLoading: !state.isLoading
    }));
    const { email, password, isLoading } = this.state;
    let loggedIn = login_oauth(email, password);
    if (loggedIn)  {
      this.setState(state => ({
        isLoading: false
      }));
    }

  };

  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Group controlId="formBasicEmail" className="justify-content-center text-center">
          <img src={tile} height="72" width="72"  />
          <br />
          <Form.Label >TwinJet Login</Form.Label>
          <Form.Control type="text" placeholder="Username or Email" 
            value={this.state.email}
            onChange={this.handleEmailChange}
          />
        </Form.Group>
        <Form.Group controlId="formBasicPassword">
          <Form.Control type="password" placeholder="Password" 
              value={this.state.password}
              onChange={this.handlePasswordChange}
          />
        </Form.Group>
        <LoadingButton isLoading={this.state.isLoading} />
      </Form>
    );
  }
}

class LoadingButton extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {

    return (
      <Button
        variant="dark"
        type="submit"
        disabled={this.props.isLoading}
      >
        {this.props.isLoading ? 'Hang Tight...' : 'Login'}
      </Button>
    );
  }
}

const job_container = (
  <Container className="h-100" id="board">
  </Container>
);

class JobBucket extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      jobs : this.props.jobs

    }
  }

  renderJobCards () {
    return this.state.jobs.map((jerb) => {
        return <JobCard job={jerb}/>
      })
  } 

  render() {
    return(
    <div>
    {this.renderJobCards()}
    </div>
    )
  }
};

class JobCard extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {

    return (
      <Row id="">
        <AddressCard address={this.props.job.origin_address} />
        <Col>
        </Col>
        <AddressCard address={this.props.job.destination_address} />
      </Row>
    );
  }
} 

class AddressCard extends React.Component {
  constructor(props, context) {
    super(props, context);

  }

  render() {

    return (
      <Col>
        <div style={{margin: '5px'}}>
          {this.props.address.name}<br/>
          {this.props.address.street_address}<br/>
          {this.props.address.city} {this.props.address.state} {this.props.address.postal_code}<br/>
          {this.props.address.contact}<br/>
          {this.props.address.special_instructions}
        </div>
      </Col>
    );
  }
}

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
  }).then((response) => response.json(), (err) => {
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

function login_oauth(email, password) {
  let body = `grant_type=password&username=${email}&password=${password}`;
  let client_cred = btoa(`${TJ_APP_KEY}:${TJ_APP_SECRET}`)
  fetch("https://twinjet.co/api/oauth2/token/", {
    body: body,
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + client_cred
    },
    method: "post"
  })
  .then((response) => response.json())
  .then((responseJson) => {
    console.log(responseJson);
    for (let item in responseJson) {
      localStorage['tj_id-' + item] = responseJson[item]
    }
    console.log(localStorage)
    return true;
  }).then((vale) => {
    fetch_board_head();
    return vale;
  });
}

function fetch_board_head() {
  let auth_token = localStorage['tj_id-access_token'];
  fetch("https://twinjet.co/boardapi/v1/jobdeltas/head/", {
    headers: {
        "Authorization": "Bearer " + auth_token,
        "Content-Type": "application/json",
    },
    method: "get"
  }).then((response) => response.json())
  .then((responseJson) => {
    localStorage['tj-head'] = responseJson['head'];
    console.log(responseJson);
    ffwdDB(responseJson);
  });
}


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();