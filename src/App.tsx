import React, {useEffect, useState} from 'react';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';
import FormHelperText from '@mui/material/FormHelperText';
import CardHeader from '@mui/material/CardHeader';

import bg from './images/bg.jpg'

import './App.css';
import {lockingTx, chargingTx, unlockingTx} from "./profitSharing/profitSharing";
import {BaseConfig} from "./config/configs";
import {ApiNetwork} from "./network/Network";
import ActionResult from "./components/actionResult";

const App: React.FC = () => {
    const [lockTx, setLockTx] = useState<string>("No Transaction")
    const [lockAmount, setLockAmount] = useState<number>(0)
    const [lockDialog, setLockDialog] = useState<boolean>(false)
    const [chargeTx, setChargeTx] = useState<string>("No Transaction")
    const [tokenCharge, setTokenCharge] = useState<string>("")
    const [chargeAmount, setChargeAmount] = useState<number>(0)
    const [chargeDialog, setChargeDialog] = useState<boolean>(false)
    const [unlockTx, setUnlockTx] = useState<string>("No Transaction")
    const [unlockToken, setUnlockToken] = useState<string>("")
    const [unlockDialog, setUnlockDialog] = useState<boolean>(false)
    const [config, setConfig] = useState<BaseConfig|undefined>(undefined)

    useEffect(() => {
        ApiNetwork.getBackendConfig().then(conf => {
            setConfig(conf)
        })
    }, []);

    const lock = () => {
        lockingTx(lockAmount, config!).then(res => {
            setLockTx(res)
            if(res !== "Error") setLockDialog(true)
        })
    }
    const onCloseLock = () => setLockDialog(false)
    const charge = () => {
        chargingTx(tokenCharge, chargeAmount*1e9, config!).then(res =>{
            setChargeTx(res)
            if(res !== "Error") setChargeDialog(true)
        })
    }
    const onCloseCharge = () => setChargeDialog(false)
    const unlock = () => {
        unlockingTx(unlockToken, config!).then(res =>{
            setUnlockTx(res)
            if(res !== "Error") setUnlockDialog(true)
        })
    }
    const onCloseUnlock = () => setUnlockDialog(false)
    return (
        <Paper sx={{backgroundImage: `url(${bg})`, backgroundAttachment: 'fixed'}}>
        <Container sx={{pt: 4, pb: 12}}>
            <Card sx={{m: 8}}>
                <CardHeader sx={{pl: 4}}
                    title="Register Your Stakes"
                />
                <CardContent>
                    <FormControl>
                        <InputLabel>Stake Amount</InputLabel>
                        <Input style = {{minWidth: 300}}
                               onChange={event => {
                                   const {value} = event.target;
                                   setLockAmount(parseInt(value))
                               }}
                        />
                        <FormHelperText> How many tokens do you want to register?
                        </FormHelperText>
                    </FormControl>
                    <Button variant="contained" sx={{m:2, ml: 50}}
                        onClick={() => {lock()}}>
                        Send Request to Wallet
                    </Button>
                    <ActionResult txId={lockTx} open={lockDialog} name={"Lock"} onClose={onCloseLock} />
                </CardContent>
            </Card>

            <Card sx={{m: 8}}>
                <CardHeader sx={{pl: 4}}
                    title= "Charge Your Stake Payment"
                />
                <CardContent>
                    <FormControl>
                        <InputLabel>Amount (ERG)</InputLabel>
                        <Input style = {{minWidth: 300}}
                            onChange={event => {
                                   const {value} = event.target;
                                   setChargeAmount(parseInt(value))
                               }}
                        />
                        <FormHelperText> How much do you want to charge?
                        </FormHelperText>
                    </FormControl>
                    <br/>
                    <FormControl>
                        <InputLabel>Reserved Token Id</InputLabel>
                        <Input style = {{minWidth: 600}}
                            onChange={event => {
                                const {value} = event.target;
                                setTokenCharge(value)
                            }}
                        />
                        <FormHelperText> Please enter your stake identifier token id
                        </FormHelperText>
                    </FormControl>
                    <Button variant="contained" sx={{m: 2, ml: 11}}
                            onClick={() => {charge()}}>
                        Send Request to Wallet
                    </Button>
                    <ActionResult txId={chargeTx} open={chargeDialog} name={"Charge"} onClose={onCloseCharge} />
                </CardContent>
            </Card>

            <Card sx={{m: 8}}>
                <CardHeader sx={{pl: 4}}
                    title= "Free Up Your Stakes"
                />
                <CardContent>
                    <FormControl>
                        <InputLabel>Reserved Token Id</InputLabel>
                        <Input style = {{minWidth: 600}}
                               onChange={event => {
                                   const {value} = event.target;
                                   setUnlockToken(value)
                               }}
                        />
                        <FormHelperText> Please enter your stake identifier token id
                        </FormHelperText>
                    </FormControl>
                    <Button variant="contained" sx={{m: 2, ml: 11}}
                            onClick={() => {unlock()}}>
                        Send Request to Wallet
                    </Button>
                    <ActionResult txId={unlockTx} open={unlockDialog} name={"Unlock"} onClose={onCloseUnlock} />
                </CardContent>
            </Card>
        </Container>
        </Paper>
    );
}

export default App;
