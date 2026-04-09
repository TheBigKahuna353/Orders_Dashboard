import { useState } from "react"
import Header from "../Bars/Header"
import { importTxtFile } from "../Data/ASNs"
import ASN from "../UtilPages/ASN"
import "./utils.css"

export default function UtilsPage() {

  const [asns, setASNs] = useState<Asn[]>([])

  const import_data = async (file: File) => {
    if (!file) return
    const importedASNs = await importTxtFile(file)
    setASNs(importedASNs)
  }


  return (
    <div className="utils-page">

      <Header onImportClick={import_data} showFilters={{ date: true }} />

      <div className="utils-content">
        <ASN ASNs={asns} />

      </div>
    </div>
  )
}
