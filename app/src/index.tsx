import { ApolloClient, ApolloProvider, createHttpLink, InMemoryCache } from '@apollo/client';
import { CssBaseline } from '@material-ui/core';
import whyDidYouRender from '@welldone-software/why-did-you-render';
import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClientProvider } from 'react-query';
import { HashRouter, Route, Switch } from 'react-router-dom';

import BaseLayout from './layouts/BaseLayout';
import { store, StoreContext } from './stores/RootStore';
import Explore from './views/Explore';
import Landing from './views/Landing';
import Projects from './views/Projects';

export const API = 'http://localhost';
export const PROJECT = `${API}/project`;
export const DATA = `${API}/data`;
export const PREDICT = `${API}/predict`;

const httpLink = createHttpLink({
  uri: 'http://localhost/graphql/',
});

export const apolloClient = new ApolloClient({
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
    <ApolloProvider client={apolloClient}>
      <StoreContext.Provider value={store}>
        <QueryClientProvider client={store.query}>
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
        </QueryClientProvider>
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
