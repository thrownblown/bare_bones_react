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
import moment from 'moment'
import Image from 'react-bootstrap/Image'


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

let jerbs = databaseInitialize();

function ffwdDB(data) {
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
    <Nav className="ml-auto" activeKey="/unassigned">
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
    this.state = this.props;
  }

  renderJobCards () {
    return this.state.jobs.map((jerb) => {
        return <JobCard key={jerb.id} job={jerb}/>
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

  jobTimeframeString(){
    const DELIVERY_STATUS_NO_STATUS = -1,
          DELIVERY_STATUS_NEW = 0,
          DELIVERY_STATUS_NOT_PICKED = 1,
          DELIVERY_STATUS_PICKED = 2,
          DELIVERY_STATUS_STOPS_MADE = 3,
          DELIVERY_STATUS_DELIVERED = 4,
          DELIVERY_STATUS_POD_ENTERED = 5,
          DELIVERY_STATUS_COMPLETE = 6,
          DELIVERY_STATUS_SIGNED = 7,
          DELIVERY_STATUS_UNDELIVERABLE = 8,
          JOB_STATUS_UNDELIVERABLE = 9;

      let timediff,
          now = new Date();

      if (this.props.job.delivery_status == DELIVERY_STATUS_DELIVERED || this.props.job.delivery_status == DELIVERY_STATUS_COMPLETE) {
          let drop_time_localized = new Date(this.props.job.drop_timestamp);
          if (typeof moment != "undefined") {
              if (drop_time_localized.getDate() == now.getDate()){
                  return "Delivered " + moment(drop_time_localized).format('h:mm a');
              } else {
                  return "Delivered " + moment(drop_time_localized).format('M/D h:mm a');
              }
          } else {
              return "Delivered " + drop_time_localized;
          }

      } else if (this.props.job.assignment_status == JOB_STATUS_UNDELIVERABLE) {
          return "Undeliverable";
      } else if (this.props.job.is_cancelled) {
          return "Cancelled";
      }

      let ready_time_localized = new Date(this.props.job.ready_timestamp);

      let due_time_localized = new Date(this.props.job.due_timestamp);

      if (ready_time_localized > now){
          timediff = ready_time_localized - now;
          return "Ready in " + moment.duration(timediff).humanize();
      } else if (due_time_localized > now) {
          timediff = due_time_localized - now;
          return "Due in " + moment.duration(timediff).humanize();
      }

      timediff = now - due_time_localized;
      return "Due " + moment.duration(timediff).humanize() + " ago";
  }

  pick_map() { 
    return 'https://twinjet-static.s3.amazonaws.com/routemaps/' + this.props.job.id + '_pick_map.png';
  }
  drop_map() { 
    return 'https://twinjet-static.s3.amazonaws.com/routemaps/' + this.props.job.id + '_drop_map.png';
  }


  render() {

    let fin_info;

    if (this.props.job.payment_method == 1) {
      fin_info = <span class="text-warning"> {this.props.job.financial_info }</span>
    } else if (this.props.job.payment_method == 6 || this.props.job.payment_method == 5) { 
      fin_info = <span class="text-danger"> {this.props.job.financial_info }</span>; 
    } else if (this.props.job.payment_method == 2 || this.props.job.payment_method == 4 || this.props.job.payment_method == 3 || this.props.job.payment_method == 7) {
      fin_info = <span class="text-success">  {this.props.job.financial_info }</span>;
    } 

    return (
      <div style={{border: '1px', borderStyle: 'solid', borderColor: 'black', borderRadius: '4px', padding: '10px'}}>
      <Row>
        <Col>
          <AddressCard address={this.props.job.origin_address} />
          <p>
          <em>{this.props.job.ready_due_times}</em>
          <br/>
          {this.jobTimeframeString()}
          </p>
        </Col>
        <Col>
        <Image fluid rounded src={this.pick_map()}/>
        </Col>
        <Col>
          <AddressCard address={this.props.job.destination_address} />
          <p>{fin_info}</p>
        </Col>
        <Col>
        <Image fluid rounded src={this.drop_map()}/>
        </Col>
      </Row>
      </div>
    );
  }
} 

class AddressCard extends React.Component {
  constructor(props, context) {
    super(props, context);

  }

  render() {

    return (
      <div style={{margin: '5px'}}>
        <strong>{this.props.address.name}</strong><br/>
        {this.props.address.street_address}<br/>
        {this.props.address.city} {this.props.address.state} {this.props.address.postal_code}<br/>
        {this.props.address.contact}<br/>
      </div>
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