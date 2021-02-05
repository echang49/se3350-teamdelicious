import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import AddCourses from "./components/addCourses";
import AddDescriptions from "./components/addDescriptions";
import Login from "./components/login";
import Register from "./components/register";

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
