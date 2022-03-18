import React ,{ Component } from 'react';
import logo from './logo.svg';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import './App.css';
import {lockingTx} from "./profitSharing";

type State = {
  lockingTx: string,
}

class App extends Component<{}, State> {
  state = {
    lockingTx: 'unknown'
  };

  lock = async () => {
    this.setState({lockingTx: await lockingTx(2)})
  }

  render() {
    return (
        <Container sx={{m: 5}}>
          <div>
            <Button variant="contained" sx={{m: 2}} onClick={() => {this.lock()}}>
              Get Wallet Address
            </Button>
            <TextField
                disabled
                sx={{m: 1}}
                style={{width: 600}}
                id="outlined-address"
                value={this.state.lockingTx}
            />
          </div>
        </Container>
    );
  }


}

export default App;
