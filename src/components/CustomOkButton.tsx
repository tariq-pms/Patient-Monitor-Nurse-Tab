import React from 'react'
import { Button } from '@mui/material'
export const CustomOkButton = (props: { text: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined }) => {
    return (
    <Button sx={{backgroundImage: 'linear-gradient(#E4A400, #A47600, #E4A400)', width:'100%', height:'100%', borderRadius:'15%', color:'white'}}>{props.text}</Button>
    )
}
