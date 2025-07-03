import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import Businesses from './pages/Businesses';
import Customers from './pages/Customers';
import Packages from './pages/Packages';

function App() {
    return (
        <Router>
            <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/businesses" component={Businesses} />
                <Route path="/customers" component={Customers} />
                <Route path="/packages" component={Packages} />
            </Switch>
        </Router>
    );
}

export default App;