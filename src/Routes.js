import React, { Component } from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import HomePage from './Components/HomePage/HomePage';
import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import LoginFor from './Components/LoginFor/LoginFor';
import Consultancy from './Components/Consultancy/Consultancy'
import ConsultancyForm from './Components/Consultancy/ConsultancyForm';
import ThankYou from './Components/ThankYou/ThankYou';
import Prescriptions from './Components/Prescriptions/Prescriptions';
import Appointments from './Components/Appointments/Appointments';

import { createBrowserHistory } from 'history';

const history = createBrowserHistory();

const Routes = () => (
    <Router history={history}>
        <Switch>
            <Route exact path='/' component={HomePage}/>
            <Route exact path='/:handle/' component={Login}/>
            <Route exact path='/:handle/Register' component={Register} />
            <Route exact path='/:handle/Consultancy' component={Consultancy} />
            <Route exact path='/:handle/ConsultancyForm' component={ConsultancyForm} />
            <Route exact path='/:handle/Thankyou' component={ThankYou} />
            <Route exact path="/:handle/Prescriptions" component={Prescriptions} />
            <Route exact path="/:handle/Appointments" component={Appointments} />
        </Switch>
    </Router>


);

export default Routes;