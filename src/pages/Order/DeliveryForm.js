import React, { useState, useEffect } from "react";
import { Alert, Button, Card, CardBody, CardHeader, Col, Form, Input, Label, Row, Spinner } from "reactstrap";

const DeliveryForm = ({
  title,
  formError,
  formData = {},
  saving,
  onChange,
  onSubmit,
  onClose,
  deliveryItems,
  setDeliveryItems,
  orderItemsCount = 0,
}) => {
  // Ensure deliveryItems is always an array
  const safeDeliveryItems = deliveryItems || [];
  
  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState({ quantity: "", rate: "", total_Amount: 0 });

  // Prevent deleting all items - check if this is the last item
  const canDelete = (idx) => {
    return safeDeliveryItems.length > 1;
  };

  const handleEdit = (idx) => {
    setEditingIndex(idx);
    setEditData({
      quantity: safeDeliveryItems[idx].quantity,
      rate: safeDeliveryItems[idx].rate,
      total_Amount: safeDeliveryItems[idx].total_Amount,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => {
      const updated = { ...prev };
      if (name === 'quantity') {
        const qty = value === "" ? "" : Math.max(1, Number(value));
        updated.quantity = qty;
        const rate = prev.rate === "" ? 0 : Number(prev.rate);
        updated.total_Amount = (qty === "" ? 0 : qty) * rate;
      }
      return updated;
    });
  };

  const handleSaveEdit = (idx) => {
    if (editData.quantity === "" || editData.quantity < 1) {
      alert("Quantity must be at least 1");
      return;
    }
    setDeliveryItems(items =>
      items.map((item, i) =>
        i === idx
          ? { ...item, quantity: Number(editData.quantity), total_Amount: editData.quantity * item.rate }
          : item
      )
    );
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleRemoveItem = (idx) => {
    if (!canDelete(idx)) {
      alert("Cannot delete all items. At least one item must remain.");
      return;
    }
    setDeliveryItems(items => items.filter((_, i) => i !== idx));
  };

  const totalAmount = safeDeliveryItems.reduce((sum, it) => sum + Number(it.total_Amount || 0), 0);

  return (
    <Card className="mb-4 app-form-card">
      <CardHeader className="bg-white d-flex align-items-center justify-content-between">
        <h5 className="mb-0">{title}</h5>
        <Button color="secondary" type="button" onClick={onClose}>
          <i className="mdi mdi-arrow-left me-1" />Back
        </Button>
      </CardHeader>
      <CardBody className="app-form-body">
        {formError ? <Alert color="danger">{formError}</Alert> : null}
        <Form onSubmit={onSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Label>Order No</Label>
              <Input
                name="order_No"
                value={formData?.order_No || ""}
                readOnly
                style={{ backgroundColor: '#f0f0f0' }}
              />
            </Col>
            <Col md={6}>
              <Label>Customer</Label>
              <Input
                name="customerName"
                value={formData?.customerName || ""}
                readOnly
                style={{ backgroundColor: '#f0f0f0' }}
              />
            </Col>
            <Col md={6}>
              <Label>Salesperson</Label>
              <Input
                name="salesPersonName"
                value={formData?.salesPersonName || ""}
                readOnly
                style={{ backgroundColor: '#f0f0f0' }}
              />
            </Col>
            <Col md={6}>
              <Label>Order Date</Label>
              <Input
                name="order_Date"
                value={formData?.order_Date || ""}
                readOnly
                style={{ backgroundColor: '#f0f0f0' }}
              />
            </Col>
            <Col md={6}>
              <Label>Delivery Date<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="delivery_Date"
                value={formData?.delivery_Date || ""}
                onChange={onChange}
                type="date"
              />
            </Col>

            <Col md={12}>
              <div className="mb-3">
                <label>Order Items</label>
                <div className="table-responsive">
                  <table className="table table-bordered table-striped table-sm mb-0">
                    <thead>
                      <tr>
                        <th>Sr.No</th>
                        <th>Item Name</th>
                        <th>Rate</th>
                        <th>Quantity</th>
                        <th>Total Amount</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeDeliveryItems.length === 0 ? (
                        <tr style={{ height: 48 }}>
                          <td colSpan={6} style={{ textAlign: 'center', color: '#888', verticalAlign: 'middle' }}>
                            No items added
                          </td>
                        </tr>
                      ) : (
                        safeDeliveryItems.map((item, idx) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{item.itemName || `Item ID: ${item.item_ID}`}</td>
                            <td>{item.rate}</td>
                            <td>
                              {editingIndex === idx ? (
                                <input
                                  className="form-control form-control-sm"
                                  name="quantity"
                                  type="text"
                                  value={editData.quantity}
                                  onChange={handleEditChange}
                                  onKeyDown={(e) => {
                                    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
                                    if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                                      e.preventDefault();
                                    }
                                  }}
                                />
                              ) : (
                                item.quantity
                              )}
                            </td>
                            <td>
                              {editingIndex === idx ? editData.quantity * item.rate : item.total_Amount}
                            </td>
                            <td>
                              <div className="d-flex gap-2 align-items-center">
                                {editingIndex === idx ? (
                                  <>
                                    <button
                                      type="button"
                                      title="Save"
                                      onClick={() => handleSaveEdit(idx)}
                                      style={{ background: 'none', border: 'none', padding: 0, color: '#28a745', fontSize: 20, cursor: 'pointer' }}
                                    >
                                      <i className="mdi mdi-check font-size-18" />
                                    </button>
                                    <button
                                      type="button"
                                      title="Cancel"
                                      onClick={handleCancelEdit}
                                      style={{ background: 'none', border: 'none', padding: 0, color: '#6c757d', fontSize: 20, cursor: 'pointer' }}
                                    >
                                      <i className="mdi mdi-close font-size-18" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      title="Edit"
                                      onClick={() => handleEdit(idx)}
                                      style={{ background: 'none', border: 'none', padding: 0, color: '#6f42c1', fontSize: 20, cursor: 'pointer' }}
                                    >
                                      <i className="mdi mdi-pencil font-size-18" />
                                    </button>
                                    <button
                                      type="button"
                                      title="Remove"
                                      onClick={() => handleRemoveItem(idx)}
                                      disabled={!canDelete(idx)}
                                      style={{ background: 'none', border: 'none', padding: 0, color: canDelete(idx) ? '#e74c3c' : '#ccc', fontSize: 20, cursor: canDelete(idx) ? 'pointer' : 'not-allowed' }}
                                    >
                                      <i className="mdi mdi-trash-can-outline font-size-18" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                      <tr>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }} colSpan={4}>Total Amount</td>
                        <td style={{ fontWeight: 'bold' }}>{totalAmount}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </Col>

            <Col md={12}>
              <Label>Remarks</Label>
              <Input
                name="remarks"
                value={formData?.remarks || ''}
                onChange={onChange}
                placeholder="Enter remarks"
                type="textarea"
                rows={3}
              />
            </Col>
          </Row>
          <div className="app-form-actions">
            <Button color="success" type="submit" disabled={saving}>
              {saving ? <Spinner size="sm" className="me-2" /> : null}
              Deliver
            </Button>
            <Button color="light" type="button" onClick={onClose}>
              Cancel
            </Button>  
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};

export default DeliveryForm;
