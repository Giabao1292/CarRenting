import { Card } from "react-bootstrap";
import FilterCheckbox from "../shared/FilterCheckbox";

const SidebarFilters = () => {
  return (
    <div className="d-none d-md-block" style={{ width: 280 }}>
      <Card className="mb-4 border-0 shadow-sm rounded-4 overflow-hidden">
        <div
          className="w-100 rounded-4 position-relative overflow-hidden"
          style={{ height: 160 }}
        >
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{
              backgroundImage:
                "url(https://lh3.googleusercontent.com/aida-public/AB6AXuCWct6Cvx5h3ekSuJtsPk40L_cCWJjOI_XvHE1ziUxzac-M8rQVH4TvNs0KWCes2pmyGeOzqVU6ZlL5DOIbCFgFiFUdPGiU1sbHIt4Tre50-APUTBetOl40Qes-nO0VPNA4SUwq6rupMEjw0h_QUMYpR31tTQXjXK428WIBREDfJlM-Bi-WeOyw9RJAfONEG2-7Xzk2Z59QdHZ_XOD6P8pSLERdpmn6va4iHnonM8BVmwyPtxugqyGK3NuCr9TVYU0l7Gi9HQC6-zk)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="position-absolute bottom-2 start-2 bg-white px-3 py-1 rounded-3 fw-bold small shadow">
            <span className="material-symbols-outlined align-middle me-1">
              map
            </span>
            View Map
          </div>
        </div>
      </Card>

      <Card className="mb-4 border-0 shadow-sm rounded-4">
        <Card.Body className="p-4">
          <h5 className="fw-bold mb-3">Price Range</h5>
          <div
            className="bg-muted rounded-pill"
            style={{ height: 10, position: "relative" }}
          >
            <div
              className="bg-primary rounded-pill"
              style={{ width: "50%", height: "100%" }}
            />
            <div
              className="position-absolute top-50 start-50 translate-middle bg-white border border-success rounded-circle"
              style={{ width: 20, height: 20 }}
            />
          </div>
          <div className="d-flex gap-2 mt-3">
            <div className="flex-grow-1 bg-white border rounded-3 p-2">
              <small className="text-muted">Min</small>
              <div className="fw-bold">$50</div>
            </div>
            <div className="flex-grow-1 bg-white border rounded-3 p-2">
              <small className="text-muted">Max</small>
              <div className="fw-bold">$280</div>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-4 border-0 shadow-sm rounded-4">
        <Card.Body className="p-4">
          <h5 className="fw-bold mb-3">Vehicle Type</h5>
          <div className="d-grid gap-2">
            <FilterCheckbox label="Sedan" count={45} checked />
            <FilterCheckbox label="SUV" count={32} />
            <FilterCheckbox label="Electric" count={18} />
            <FilterCheckbox label="Luxury" count={12} />
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-4 border-0 shadow-sm rounded-4">
        <Card.Body className="p-4">
          <h5 className="fw-bold mb-3">Features</h5>
          <div className="d-grid gap-2">
            <FilterCheckbox label="Self-Driving Capable" checked />
            <FilterCheckbox label="Instant Book" />
            <FilterCheckbox label="Pet Friendly" />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SidebarFilters;
