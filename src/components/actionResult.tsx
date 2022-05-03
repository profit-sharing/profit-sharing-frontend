import React, {useEffect, useState} from 'react';
import {ApiNetwork} from "../network/Network";
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';

interface txProps {
    txId: string
    open: boolean
    name: string
    onClose: () => void
}

/**
 * Shows the transaction status in the network
 * @param txId, the transaction id
 * @param open, when the dialog should appear
 * @param name, transaction name
 * @param onClose, what to do when the dialog closes
 */
const ActionResult: React.FC<txProps> = ({ txId, open, name, onClose }) => {
    const [status, setStatus] = useState("")

    useEffect(() => {
        const interval = setInterval(() => {
            updateStatus().then(res => {if(res === 0) clearInterval(interval)})
        }, 1000);
        return () => clearInterval(interval);
    }, [txId]);

    /**
     * Sets the related transaction status:
     * confirmation count = -1 => transaction is not accepted by the node
     * confirmation count = 0 => is in mempool
     * confirmation count > 0 => transaction is mined
     */
    const updateStatus = async() =>{
        if(txId !== "No Transaction"){
            const confNum = await ApiNetwork.getConfNum(txId)
            console.log(confNum)
            if(confNum === 0){
                setStatus("Your transaction is in mempool")
            } else if(confNum === -1){
                setStatus("Please wait more, your tx is not considered yet")
            } else {
                setStatus("Your transaction is mined successfully")
                return 0
            }
            return 1
        }
    }

    const handleClose = () => {
        onClose()
    }

    return(
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
        >
            <DialogTitle>Your {name} Tx is in Progress</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Your transaction is submitted with txId :
                </DialogContentText>
                <DialogContentText>
                    {txId}
                </DialogContentText>
                <DialogContentText>
                    {status}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

export default ActionResult;

