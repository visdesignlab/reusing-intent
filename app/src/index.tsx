import { ApolloClient, ApolloProvider, createHttpLink, InMemoryCache } from '@apollo/client';
import { CssBaseline } from '@material-ui/core';
import whyDidYouRender from '@welldone-software/why-did-you-render';
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch } from 'react-router-dom';

import BaseLayout from './layouts/BaseLayout';
import RootStore, { StoreContext } from './stores/RootStore';
import Explore from './views/Explore';
import Landing from './views/Landing';
import Projects from './views/Projects';

const httpLink = createHttpLink({
  uri: 'http://localhost/graphql/',
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    'Access-Control-Allow-Credentials': true as any,
  },
});

whyDidYouRender(React, {
  trackAllPureComponents: true,
  exclude: [/XGrid|RowCells|GridCell/],
});

const App = () => {
  return (
    <ApolloProvider client={client}>
      <StoreContext.Provider value={new RootStore()}>
        <CssBaseline>
          <BaseLayout>
            <HashRouter>
              <Switch>
                <Route component={Landing} path="/" exact />
                <Route component={Projects} path="/project" exact />
                <Route component={Explore} path="/explore" exact />
              </Switch>
            </HashRouter>
          </BaseLayout>
        </CssBaseline>
      </StoreContext.Provider>
    </ApolloProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// TODO: Uncomment
// reportWebVitals(console.log);
