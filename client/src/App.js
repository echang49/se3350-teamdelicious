import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import AddCourses from "./components/adminCourses";
import AddDescriptions from "./components/profDescriptions";
import Login from "./components/login";
import Register from "./components/adminRegister";
import MatchingTA from "./components/adminMatching";

function App() {
  
  return (
    <div>
      <Router>
        <Switch> 
          <Route path="/admin/register">
            <Register />
          </Route>
          <Route path="/admin/courses">
            <AddCourses />
          </Route>
          <Route path="/admin/matchTA">
            <MatchingTA />
          </Route>
          <Route path="/prof/descriptions">
            <AddDescriptions />
          </Route>
          <Route path="/">
            <Login />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
