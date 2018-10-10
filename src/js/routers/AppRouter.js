import React from 'react';
import { BrowserRouter, Route, Switch, Link, NavLink, Redirect } from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Landing from '../components/Landing';
import CreateChallenge from '../components/CreateChallenge';
import Challenges from '../components/Challenges';
import Mentor from '../components/Mentor';
import User from '../components/User';
import NotFoundPage from '../components/NotFoundPage';
import FAQ from '../components/FAQ';

const AppRouter = () => (
  <BrowserRouter>
    <div>
      <Header />
      <Switch>
        <Route path="/" component={Landing} exact={true} />
        <Route path="/new" component={CreateChallenge} exact={true} />
        <Route path="/challenges" component={Challenges} exact={true} />
        <Route path="/mentor" component={Mentor} exact={true} />
        <Route path="/faq" component={FAQ} exact={true} />
        <Route path="/404/" component={NotFoundPage}></Route>
        <Route path="/:id" component={User} exact={true} />
        <Redirect from='*' to='/404' />
      </Switch>
      <Footer />
    </div>
  </BrowserRouter>
);

export default AppRouter;