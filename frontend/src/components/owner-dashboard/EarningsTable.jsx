import { Card, Table } from "react-bootstrap";

const EarningsTable = ({ rows }) => {
  return (
    <Card className="border-0 shadow-sm rounded-4 overflow-hidden mt-4">
      <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
        <h5 className="fw-bold mb-0">Recent Earnings</h5>
        <small className="text-muted">Last 7 days</small>
      </div>
      <Table responsive hover className="mb-0 align-middle">
        <thead className="table-light">
          <tr>
            <th>Car</th>
            <th>Dates</th>
            <th>Status</th>
            <th className="text-end">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="fw-bold">{row.car}</td>
              <td>{row.dates}</td>
              <td>
                <span className="badge text-bg-success-subtle text-success-emphasis">
                  Completed
                </span>
              </td>
              <td className="text-end fw-bold">{row.amount}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default EarningsTable;
