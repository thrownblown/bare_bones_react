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

const login_form = (
	<Form>
	  <Form.Group controlId="formBasicEmail">
	    <Form.Label>Email address</Form.Label>
	    <Form.Control type="email" placeholder="Enter email" />
	    <Form.Text className="text-muted">
	      We'll never share your email with anyone else.
	    </Form.Text>
	  </Form.Group>

	  <Form.Group controlId="formBasicPassword">
	    <Form.Label>Password</Form.Label>
	    <Form.Control type="password" placeholder="Password" />
	  </Form.Group>
	  <Form.Group controlId="formBasicChecbox">
	    <Form.Check type="checkbox" label="Check me out" />
	  </Form.Group>
	  <Button variant="primary" type="submit" className="pull-rigt">
	    Submit
	  </Button>
	</Form>
);







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
    login_form,
    document.getElementById('board')
);