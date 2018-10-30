import React from 'react';

import {
  BrowserRouter,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Landing from '../components/Landing';
import CreateChallenge from '../components/CreateChallenge';
import UserChallenges from '../components/UserChallenges';
import MentorChallenges from '../components/MentorChallenges';
import User from '../components/User';
import Users from '../components/Users';
import Account from '../components/Account';
import NotFoundPage from '../components/NotFoundPage';

const AppRouter = () => (
  <BrowserRouter>
    <div>
      <Header />
      <Switch>
        <Route path="/" component={Landing} exact />
        <Route path="/account" component={Account} exact />
        <Route path="/new" component={CreateChallenge} exact />
        <Route path="/challenges" component={UserChallenges} exact />
        <Route path="/mentor" component={MentorChallenges} exact />
        <Route path="/users" component={Users} exact />
        <Route path="/404/" component={NotFoundPage} />
        <Route path="/:id" component={User} exact />
        <Redirect from="*" to="/404" />
      </Switch>
      <Footer />
    </div>
  </BrowserRouter>
);

export default AppRouter;
