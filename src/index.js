import React from 'react';
import ReactDOM from 'react-dom';
import SignIn from './SignIn';
import Button from '@material-ui/core/Button';

function App() {
  return (
    <SignIn></SignIn>
  );
}

ReactDOM.render(<App />, document.querySelector('#root'));
