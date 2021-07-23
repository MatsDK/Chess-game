import Navbar from "./components/Navbar";
import GameView from "./components/GameView";
import Home from "./components/Home";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import GamesDashboard from "./components/Dashboard";
import styled from "styled-components";

const AppWrapper = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: #060c16;
  color: white;
`;

const App = () => {
  return (
    <AppWrapper>
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
    </AppWrapper>
  );
};

export default App;
