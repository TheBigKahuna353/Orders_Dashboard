import React from "react";

import { FileUpload } from 'primereact/fileupload';

import { onTXTFileUpload } from "./import_data";

import './Workload.css';

function Workload() {

    const style: React.CSSProperties = {
          width: '80vw',
          margin: '20px auto',
          position: 'absolute',
          top: '70px',
          left: '20px',
        };

    const fileRef = React.useRef<FileUpload>(null);

    const import_data = async (file: File) => {
        const data = await onTXTFileUpload(file);
        console.log("Parsed Data:", data);
        fileRef.current?.clear();
    };

    return (
        <div>
            <h1>Workload</h1>
            <FileUpload 
                ref={fileRef}
                style={style} 
                mode="basic" 
                name="demo[]" 
                accept=".txt" 
                maxFileSize={1000000} 
                auto 
                chooseLabel="Import TXT"
                customUpload
                uploadHandler={(e) => import_data(e.files[0])}/>
        </div>
    );
}

export default Workload;