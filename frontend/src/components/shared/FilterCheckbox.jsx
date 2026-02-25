import { Form } from "react-bootstrap";

const FilterCheckbox = ({ label, count, checked = false }) => {
  return (
    <Form.Check
      type="checkbox"
      defaultChecked={checked}
      label={
        <div className="d-flex align-items-center w-100 gap-2">
          <span className="fw-semibold text-body">{label}</span>
          {count ? (
            <span className="ms-auto px-2 py-1 rounded-pill bg-muted text-muted-soft small fw-semibold">
              {count}
            </span>
          ) : null}
        </div>
      }
    />
  );
};

export default FilterCheckbox;
