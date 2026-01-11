import { Link } from "react-router"
import Appbar  from "@mui/material/AppBar";
import { Toolbar, Typography } from "@mui/material";
import { type CSSProperties } from "react";

export function NavBar() {


    const CSS: CSSProperties = {
        color: 'white',
        textDecoration: 'none',
        marginInline: '20px',
    }
    
    return (
        <Appbar position="static"  sx={{margin: 0, padding: 0}}>
            <Toolbar color="inherit">
                <Link to="/">
                    <Typography variant="h6" sx={CSS}>Home</Typography>
                </Link>
                <Link to="/forecast">
                    <Typography variant="h6" sx={CSS}>Forecast</Typography>
                </Link>
            </Toolbar>
        </Appbar>
    )
}