import React, {useRef, useEffect, useState} from 'react';
import TextField from '@mui/material/TextField';
import {ApiNetwork} from "../network/Network";

interface txProps {
    txId: string
}

const ActionResult: React.FC<txProps> = ({ txId }) => {
    const [status, setStatus] = useState("No result")

    useEffect(() => {
        const interval = setInterval(() => {
            updateStatus().then(res => {if(res === 0) clearInterval(interval)})
        }, 1000);
        return () => clearInterval(interval);
    }, [txId]);

    const updateStatus = async() =>{
        if(txId !== "No Transaction"){
            const confNum = await ApiNetwork.getConfNum(txId)
            console.log(confNum)
            if(confNum === 0){
                setStatus("your transaction is in mempool")
            } else if(confNum === -1){
                setStatus("Please wait more your tx is not considered")
            } else {
                setStatus("your transaction is mined successfully")
                return 0
            }
            return 1
        }
    }

    return(
        <TextField
            disabled
            sx={{m: 1}}
            style={{width: 600}}
            id="outlined-address"
            multiline
            value={status +"\n"+ txId}
        />
    );
}

export default ActionResult;

