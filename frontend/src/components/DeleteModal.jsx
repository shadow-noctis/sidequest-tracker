function DeleteModal({ itemName, onConfirm, onCancel}){
    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h3>Confirm delete</h3>
                <p>Are you sure you want to delete "{itemName}"?</p>
                <button onClick={onConfirm} style={dangerBtn}>Delete</button>
                <button onClick={onCancel} style={cancelBtn}>Cancel</button>
            </div>
        </div>
    );
}

const overlayStyle = {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalStyle = {
  background: "black",
  padding: "20px",
  borderRadius: "8px",
  minWidth: "300px",
  textAlign: "center",
};

const dangerBtn = { marginRight: "10px", background: "red", color: "white" };
const cancelBtn = { background: "grey", color:"white" };

export default DeleteModal