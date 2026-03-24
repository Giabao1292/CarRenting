import { Card, Table } from "react-bootstrap";

const statusVariantClass = {
  completed: "text-bg-success-subtle text-success-emphasis",
  confirmed: "text-bg-primary-subtle text-primary-emphasis",
  approved: "text-bg-primary-subtle text-primary-emphasis",
  cancelled: "text-bg-danger-subtle text-danger-emphasis",
  pending: "text-bg-warning-subtle text-warning-emphasis",
};

const toTitleCase = (value) => {
  const text = String(value || "unknown");
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

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
          {rows.length ? (
            rows.map((row) => (
              <tr key={row.id}>
                <td className="fw-bold">{row.car}</td>
                <td>{row.dates}</td>
                <td>
                  <span
                    className={`badge ${
                      statusVariantClass[row.status] ||
                      "text-bg-secondary-subtle text-secondary-emphasis"
                    }`}
                  >
                    {toTitleCase(row.status)}
                  </span>
                </td>
                <td className="text-end fw-bold">{row.amount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center text-muted py-4">
                Chưa có dữ liệu doanh thu gần đây.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Card>
  );
};

export default EarningsTable;
