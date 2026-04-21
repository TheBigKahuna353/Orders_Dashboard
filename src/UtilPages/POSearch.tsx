import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import './POSearch.css';

interface POSearchProps {
  orders: Order[];
}

export default function POSearch({ orders }: POSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Order[]>([]);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }
    setResults(
      orders.filter(order => order.PO && order.PO.toLowerCase().includes(q))
    );
  };

  return (
    <div className="po-search-container">
      <h2>PO Search</h2>
      <form onSubmit={handleSearch} className="po-search-form">
        <input
          type="text"
          placeholder="Enter PO number..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="po-search-input"
        />
        <button type="submit" className="po-search-btn">Search</button>
      </form>
      <div className="po-search-results">
        {results.length > 0 ? (
          <table className="po-search-table">
            <thead>
              <tr>
                <th>PO</th>
                <th>Delivery No</th>
                <th>Customer</th>
                <th>City</th>
                <th>Status</th>
                <th>Deliver Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((order, idx) => (
                <tr
                  key={idx}
                  className="po-search-row"
                  onClick={() => navigate(`/group/${order.groupId}`)}
                  title="View order group"
                >
                  <td>{order.PO}</td>
                  <td>{order.deliveryNo}</td>
                  <td>{order.customer}</td>
                  <td>{order.city}</td>
                  <td>{order.status}</td>
                  <td>{order.deliverDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );
}
