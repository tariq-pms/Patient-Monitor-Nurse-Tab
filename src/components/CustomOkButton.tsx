import React from 'react'
import { Button } from '@mui/material'
export const CustomOkButton = (props: { text: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined }) => {
    return (
    <Button sx={{
        ':hover': {
            bgcolor: '#FD8D14', // theme.palette.primary.main
            color: 'white',
          },
        backgroundColor:'#E4A400',  width:'100%', height:'100%', borderRadius:'10px', color:'white',boxShadow: `0px 0px 40px 0.2px #808080`, border:'0.1px solid #A8A8A8'}}>{props.text}</Button>
    )
}
