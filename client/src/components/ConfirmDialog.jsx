// Small in-app confirmation modal used instead of the native window.confirm.
const ConfirmDialog = ({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel }) => {
    if (!open) return null;

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onCancel}>
            <div className="modal-card" onClick={(event) => event.stopPropagation()}>
                <h2 className="modal-title">{title}</h2>
                <p className="modal-message">{message}</p>
                <div className="modal-actions">
                    <button className="btn btn-secondary" type="button" onClick={onCancel}>{cancelLabel}</button>
                    <button className="btn" type="button" onClick={onConfirm}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
