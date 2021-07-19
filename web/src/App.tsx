import Navbar from "./components/Navbar";
import GameView from "./components/GameView";
import Home from "./components/Home";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import GamesDashboard from "./components/Dashboard";

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
