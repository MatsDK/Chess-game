import Navbar from "./Navbar";
import GameView from "./GameView";
import Home from "./Home";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import GamesDashboard from "./Dashboard";

const App = () => {
  return (
    <div>
      <Router>
        <Navbar />
        <Switch>
          <Route path="/games">
            <GamesDashboard />
          </Route>
          <Route path="/game/:id">
            <GameView />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default App;
