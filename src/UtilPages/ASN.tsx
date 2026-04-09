
interface ASNProps {
    ASNs: Asn[]
}

import React, { useState } from 'react';
import './ASN.css';

// Group ASNs by material and deliveryNo
function groupASNs(asns: Asn[]) {
  const groups: Record<string, { material: string; deliveryNo: string; asns: Asn[] }> = {};
  asns.forEach(asn => {
    const key = `${asn.material}__${asn.deliveryNo}`;
    if (!groups[key]) {
      groups[key] = { material: asn.material, deliveryNo: asn.deliveryNo, asns: [] };
    }
    groups[key].asns.push(asn);
  });
  return Object.values(groups);
}

export default function ASN({ ASNs }: ASNProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const grouped = groupASNs(ASNs);

  const toggleExpand = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="asn-table-container">
      <h2>ASN Table</h2>
      <table className="asn-table">
        <thead>
          <tr>
            <th>Material</th>
            <th>Delivery No</th>
            <th>No. of Pallets</th>
            <th>Expand</th>
          </tr>
        </thead>
        <tbody>
          {grouped.map(group => {
            const key = `${group.material}__${group.deliveryNo}`;
            return (
              <React.Fragment key={key}>
                <tr>
                  <td>{group.material}</td>
                  <td>{group.deliveryNo}</td>
                  <td>{group.asns.length}</td>
                  <td>
                    <button className="asn-expand-btn" onClick={() => toggleExpand(key)}>
                      {expanded[key] ? 'Hide' : 'Show'}
                    </button>
                  </td>
                </tr>
                {expanded[key] && (
                  <tr>
                    <td colSpan={4} style={{ padding: 0 }}>
                      <table className="asn-details-table">
                        <thead>
                          <tr>
                            <th>Quantity</th>
                            <th>SSCC</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.asns.map((asn, idx) => (
                            <tr key={idx}>
                              <td>{asn.qty}</td>
                              <td>{asn.sscc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
