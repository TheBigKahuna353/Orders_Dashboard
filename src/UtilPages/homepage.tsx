import { useState } from "react";
import Header from "../Bars/Header";
import { importTxtFile } from "../Data/ASNs";
import ASN from "../UtilPages/ASN";
import POSearch from "../UtilPages/POSearch";
import { useOrdersStore } from "../Stores/OrdersStore";
import "./utils.css";

type Page = "menu" | "asn" | "posearch";

export default function UtilsPage() {
  const [asns, setASNs] = useState<Asn[]>([]);
  const [page, setPage] = useState<Page>("menu");
  const orders = useOrdersStore(s => s.orders);

  const import_data = async (file: File) => {
    if (!file) return;
    const importedASNs = await importTxtFile(file);
    setASNs(importedASNs);
  };

  let content = null;
  if (page === "menu") {
    content = (
        <div>
        <Header/>
        <div className="utils-menu-btns" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 300, margin: "40px auto" }}>
            <button className="utils-menu-btn" onClick={() => setPage("asn")}>ASN Table</button>
            <button className="utils-menu-btn" onClick={() => setPage("posearch")}>PO Search</button>
        </div>
        </div>
    );
  } else if (page === "asn") {
    content = (
      <div>
        <Header onImportClick={import_data} />
        <div className="utils-content">
            <button className="utils-back-btn" onClick={() => setPage("menu")} style={{ position: "absolute", top: 16, left: 16 }}>Back</button>
          <ASN ASNs={asns} />
        </div>
      </div>
    );
  } else if (page === "posearch") {
    content = (
      <div>
        <Header />
        <div className="utils-content">
            <button className="utils-back-btn" onClick={() => setPage("menu")} style={{ position: "absolute", top: 16, left: 16 }}>Back</button>
          <POSearch orders={Object.values(orders)} />
        </div>
      </div>
    );
  }

  return (
    <div className="utils-page">
      {content}
    </div>
  );
}
