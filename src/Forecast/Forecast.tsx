import React from "react";
import parseCliboard from "./parseWW";
import { createTheme, Table, TableCell, TableContainer, TableHead, TableRow, ThemeProvider } from "@mui/material";

import useSystemTheme from "../useSystemTheme";

import './Forecast.css';

function Forecast() {

    const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
        return parseCliboard(event);
    }

    const isDarkMode = useSystemTheme();

    const theme = createTheme({
        palette: {
            mode: isDarkMode ? 'dark' : 'light',
        },
    });

    return (
        <div>
            <ThemeProvider theme={theme}>
            <h1>Forecast Page</h1>
            <TableContainer onPaste={handlePaste}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>PO Number</TableCell>
                            <TableCell>Delivery Date </TableCell>
                            <TableCell>Delivery Time </TableCell>
                            <TableCell>Booking Quantity</TableCell>
                            <TableCell>Comments</TableCell>
                        </TableRow>
                    </TableHead>
                    <tbody>
                        <TableRow>
                            <TableCell><input/></TableCell>
                            <TableCell><input/></TableCell>
                            <TableCell><input/></TableCell>
                            <TableCell><input/></TableCell>
                            <TableCell><input/></TableCell>
                        </TableRow>
                    </tbody>
                </Table>
            </TableContainer>
            </ThemeProvider>
        </div>
    );
}

export default Forecast