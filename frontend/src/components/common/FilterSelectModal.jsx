import { Button, Modal } from "react-bootstrap";

const FilterSelectModal = ({
  show,
  title,
  options = [],
  selectedValue = "",
  onSelect,
  onClose,
  onApply,
}) => {
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      dialogClassName="filter-select-modal"
      contentClassName="filter-select-modal__content"
    >
      <Modal.Header closeButton className="filter-select-modal__header">
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="filter-select-modal__body">
        <div className="filter-select-modal__list">
          {options.map((option) => {
            const isSelected = selectedValue === option.value;

            return (
              <button
                key={option.value}
                type="button"
                className={`filter-select-modal__item ${isSelected ? "is-selected" : ""}`}
                onClick={() => onSelect(option.value)}
              >
                {option.icon ? (
                  <span className="material-symbols-outlined">
                    {option.icon}
                  </span>
                ) : null}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </Modal.Body>

      <Modal.Footer className="filter-select-modal__footer">
        <Button
          type="button"
          className="filter-select-modal__apply"
          onClick={onApply}
        >
          Áp dụng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FilterSelectModal;
