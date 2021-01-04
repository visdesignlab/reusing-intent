import whyDidYouRender from '@welldone-software/why-did-you-render';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import App from './App';
import Upload from './components/Upload/Upload';
import './index.css';

whyDidYouRender(React, {
  trackAllPureComponents: true,
});

const app = (
  <BrowserRouter>
    <Switch>
      <Route component={App} path="/" exact />
      <Route component={Upload} path="/upload" exact />
    </Switch>
  </BrowserRouter>
);

ReactDOM.render(app, document.getElementById('root'));
// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root'),
// );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// TODO: Uncomment
// reportWebVitals();
