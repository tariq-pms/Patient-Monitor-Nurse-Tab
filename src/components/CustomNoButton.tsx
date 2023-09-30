import React from 'react'
import { Button, Typography } from '@mui/material'
export const CustomNoButton = (props: { text: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined }) => {
    return (
    <Button sx={{backgroundColor:'#111522', width:'100%', height:'100%', borderRadius:'10px', color:'white', boxShadow: `0px 0px 20px 0.2px #808080`, border:'0.1px solid #A8A8A8'}}>

    {/* <Button sx={{backgroundImage: 'linear-gradient(to bottom, #465782, #070B13, #34405D)', width:'100%', height:'100%', borderRadius:'20%', color:'white', boxShadow: `0px 0px 20px 0.2px #808080`}}> */}
        {props.text}
    </Button>
    )
}
