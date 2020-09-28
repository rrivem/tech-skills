import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import './App.css';
import { HomePage } from './Home';
import { SurveyPage } from './Survey';

import 'bootstrap/dist/css/bootstrap.css';

export default function SurveyJSReactApplication() {
	return (
		<Router basename="/tech-skills">
			<div>
				<nav className="navbar navbar-default">
					<div className="container-fluid">
						<div className="navbar-header">
							<a className="navbar-brand" href="/">
								SurveyJS + ReactJS
							</a>
						</div>
						<ul className="nav navbar-nav">
							<li>
								<Link to="/">Home</Link>
							</li>
							<li>
								<Link to="/survey">Survey</Link>
							</li>
						</ul>
					</div>
				</nav>

				<Switch>
					<Route exact path="/">
						<HomePage />
					</Route>
					<Route path="/survey">
						<SurveyPage />
					</Route>
				</Switch>
			</div>
		</Router>
	);
}
