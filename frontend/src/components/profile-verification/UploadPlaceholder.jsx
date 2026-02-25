const UploadPlaceholder = ({ label }) => (
  <div className="profile-upload-box">
    <div className="text-center text-muted">
      <div className="mb-2">
        <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
          add_photo_alternate
        </span>
      </div>
      <div className="small fw-semibold">{label}</div>
    </div>
  </div>
);

export default UploadPlaceholder;
