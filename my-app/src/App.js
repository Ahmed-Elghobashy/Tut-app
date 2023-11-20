import './App.css';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import ConventionalComponent from './Components/ConventionalComponent/ConventionalComponent';
import AIComponent from './Components/AIComponent/AIComponent';

import * as React from 'react';


function App() {

  const [isSwitchToggled, setIsSwitchToggled] = React.useState(false);

  const handleSwitchToggle = () => {
    setIsSwitchToggled(!isSwitchToggled);
  };

  return (

    <div className="App">

      <FormControlLabel
        value="AI"
        control={<Switch color="primary" checked={isSwitchToggled} onChange={handleSwitchToggle} />}
        label="AI"
        labelPlacement="start"
      />

      {isSwitchToggled ? <AIComponent /> : <ConventionalComponent />}

    </div>
  );
}

export default App;
