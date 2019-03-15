import React from 'react';
import ReactDOM from 'react-dom';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

const TJ_APP_KEY = 'XgxsVrC19N9t2a5LdD0Ask9Y4dCBReDRMXHtioCf';
const TJ_APP_SECRET = 'xCxElvOFdmNZDNYnLio5zFb4ybSKqDbBwrRhs9m6MdvsnqL6DuH6sidYQubmSmNDmyNblsf2hWqYYczJwmjZwZrZRGednyM3EoZdvvX31hSvgQngfgfo84MFV5YrbRvG';

const top_nav = (
  <Navbar bg="dark" variant="dark" fixed="top" >
    <Navbar.Brand href="#home">TJ</Navbar.Brand>
    <Nav className="mr-auto">
      <Nav.Link href="#home">My Jobs</Nav.Link>
      <Nav.Link href="#features">All Jobs</Nav.Link>
      <Nav.Link href="#pricing">Unassigned</Nav.Link>
    </Nav>
  </Navbar>
);

const bottom_nav = (
  <Navbar bg="light" variant="light" fixed="bottom" >
    <Navbar.Brand href="#home">TJ</Navbar.Brand>
    <Nav className="mr-auto">
      <Nav.Link href="#home">My Jobs</Nav.Link>
      <Nav.Link href="#features">All Jobs</Nav.Link>
      <Nav.Link href="#pricing">Unassigned</Nav.Link>
    </Nav>
  </Navbar>
);


const conty = (
  <Container className="h-100">
    <Row className="h-100">
      <Col id="mid" className="my-auto"></Col>
    </Row>
  </Container>
);

const jumb = (
  <Jumbotron>
    <div id="board"></div>
  </Jumbotron>
);

class SignUpForm extends React.Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: ""
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
    const { email, password } = this.state;
    // alert(`Signed up with email: ${email} password: ${password}`);
    login_oauth(email, password);

  };

  render() {
    return (
  <Form  onSubmit={this.handleSubmit}>
    <Form.Group controlId="formBasicEmail">
      <Form.Label>TwinJet Login</Form.Label>
      <Form.Control type="text" placeholder="Enter Username/Email" 
        value={this.state.email}
        onChange={this.handleEmailChange}
      />
      <Form.Text className="text-muted">
      somthin jazzy
      </Form.Text>
    </Form.Group>

    <Form.Group controlId="formBasicPassword">
      <Form.Label>Password</Form.Label>
      <Form.Control type="password" placeholder="Password" 
          value={this.state.password}
          onChange={this.handlePasswordChange}
      />
    </Form.Group>
    <Form.Group controlId="formBasicChecbox">
      <Form.Check type="checkbox" label="Check me out" />
    </Form.Group>
    <Button variant="primary" type="submit" className="pull-rigt" id="login-submit">
      Submit
    </Button>
  </Form>
    );
  }
}


ReactDOM.render(
    top_nav,
    document.getElementById('top_nav')
);
ReactDOM.render(
    bottom_nav,
    document.getElementById('bottom_nav')
);
ReactDOM.render(
    conty,
    document.getElementById('root')
);

ReactDOM.render(
    jumb,
    document.getElementById('mid')
);

ReactDOM.render(
    <SignUpForm />,
    document.getElementById('board')
);

function login_oauth(email, password) {
  let body = `grant_type=password&username=${email}&password=${password}`;
  let client_cred = btoa(`${TJ_APP_KEY}:${TJ_APP_SECRET}`)
  console.log(body);
  fetch("https://twinjet.co/api/oauth2/token/", {
    body: body,
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + client_cred
    },
    method: "post",
  })
  .then((response) => response.json())
  .then((responseJson) => {
    console.log(responseJson);
  })
}

const CLIENT_ID = 'G0LoROgS6U8jBg0NGeCogtt2jE3Lx6oIoyexCGQo';
const CLIENT_SECRET = 'zwFDzisOT4kscnYBDg67SMMiHFLEYecZowvWTY4nFcoO62rHMZjEblEP0sEbun8ePBIzyQSnMfOhGp5r7CgaW2G3SIMGrNHyTRJ2gfh4smpmeE6mZtitBwONELnZS3Nf';




let client_cred = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

let oauthtest = fetch("http://localhost:8000/api/oauth2/token/", {
  body: "grant_type=password&username=thrownblown&password=nickmarzu0",
  headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + client_cred
  },
  method: "post",
}).then((response) => response.json()).then((responseJson) => {
 console.log(responseJson); })