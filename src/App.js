import './App.css';
import Grid from "./components/Grid";
import data from "./components/textData.js";

function App() {
    const {help, about} = data;
  return (
    <div className="App">
      <Grid help={help} about={about}/>
    </div>
  );
}

export default App;
