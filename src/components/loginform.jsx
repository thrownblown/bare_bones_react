import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import tile from '../img/light_logo.png';



const TJ_APP_KEY = 'XgxsVrC19N9t2a5LdD0Ask9Y4dCBReDRMXHtioCf';
const TJ_APP_SECRET = 'xCxElvOFdmNZDNYnLio5zFb4ybSKqDbBwrRhs9m6MdvsnqL6DuH6sidYQubmSmNDmyNblsf2hWqYYczJwmjZwZrZRGednyM3EoZdvvX31hSvgQngfgfo84MFV5YrbRvG';

function login_oauth(email, password) {
  let body = `grant_type=password&username=${email}&password=${password}`;
  let client_cred = btoa(`${TJ_APP_KEY}:${TJ_APP_SECRET}`);
  fetch('https://twinjet.co/api/oauth2/token/', {
    body: body,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + client_cred
    },
    method: 'post'
  })
  .then((response) => response.json())
  .then((responseJson) => {
    console.log(responseJson);
    for (let item in responseJson) {
      localStorage['tj_id-' + item] = responseJson[item]
    }
    console.log(localStorage)
    init();
    return true;
  }).then((vale) => {
    // fetch_board_headi();
    return vale;
  });
}

function fetch_board_head() {
  let auth_token = localStorage['tj_id-access_token'];
  fetch('https://twinjet.co/boardapi/v1/jobdeltas/head/', {
    headers: {
        'Authorization': 'Bearer ' + auth_token,
        'Content-Type': 'application/json',
    },
    method: 'get'
  }).then((response) => response.json())
  .then((responseJson) => {
    localStorage['tj-head'] = responseJson['head'];
    console.log(responseJson);
    ffwdDB(responseJson);
  });
}


class LoginForm extends React.Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
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
        <Form.Group controlId='formBasicEmail' className='justify-content-center text-center'>
          <img src={'static/' + tile} height='72' width='72'  />
          <br />
          <Form.Label >TwinJet Login</Form.Label>
          <Form.Control type='text' placeholder='Username or Email' 
            value={this.state.email}
            onChange={this.handleEmailChange}
          />
        </Form.Group>
        <Form.Group controlId='formBasicPassword'>
          <Form.Control type='password' placeholder='Password' 
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
        variant='dark'
        type='submit'
        disabled={this.props.isLoading}
      >
        {this.props.isLoading ? 'Hang Tight...' : 'Login'}
      </Button>
    );
  }
}

export default LoginForm;
