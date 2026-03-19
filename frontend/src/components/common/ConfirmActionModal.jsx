import { Button, Modal } from "react-bootstrap";

const ConfirmActionModal = ({
  show,
  title,
  message,
  confirmText = "Confirm",
  confirmVariant = "primary",
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-muted">{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancel}>
          Close
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmActionModal;
