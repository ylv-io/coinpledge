import React from 'react';
import { BrowserRouter, Route, Switch, Link, NavLink } from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Landing from '../components/Landing';
import CreateChallenge from '../components/CreateChallenge';
import Challenges from '../components/Challenges';

const AppRouter = () => (
  <BrowserRouter>
    <div>
      <Header />
      <Switch>
        <Route path="/" component={Landing} exact={true} />
        <Route path="/create" component={CreateChallenge} exact={true} />
        <Route path="/challenges" component={Challenges} exact={true} />
      </Switch>
      <Footer />
    </div>
  </BrowserRouter>
);

export default AppRouter;