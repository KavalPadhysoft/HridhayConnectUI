import React, { useState } from "react";
import { toast } from 'react-toastify';
import { Alert, Button, Card, CardBody, CardHeader, Col, Form, Input, Label, Row, Spinner, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import Select from "react-select";

const OrderForm = ({
  title,
  formError,
  formData,
  isEditMode,
  saving,
  onChange,
  onSubmit,
  onClose,
  customerList = [],
  onCustomerChange,
  statusList = [],
  onStatusChange,
  salesmanList = [],
  onSalesmanChange,
  itemList = [],
  orderItems,
  setOrderItems,
}) => {
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState('add');
  const [itemModalIndex, setItemModalIndex] = useState(null);
  const [itemModalData, setItemModalData] = useState({
    itemId: "",
    itemName: "",
    Quantity: "",
    Rate: "",
    Total_Amount: 0,
  });
  const [itemModalError, setItemModalError] = useState("");

  const openAddModal = () => {
    setItemModalData({
      itemId: "",
      itemName: "",
      Quantity: "1",
      Rate: "0",
      Total_Amount: 0,
    });
    setItemModalMode('add');
    setItemModalIndex(null);
    setItemModalOpen(true);
  };

  const openEditModal = (idx) => {
    setItemModalData({ ...orderItems[idx] });
    setItemModalMode('edit');
    setItemModalIndex(idx);
    setItemModalOpen(true);
  };

  const closeItemModal = () => {
    setItemModalOpen(false);
    setItemModalError("");
  };

  const handleItemModalChange = (eOrValue, fieldName) => {
    setItemModalData(prev => {
      let updated = { ...prev };
      let name, value;
      if (typeof eOrValue === 'object' && eOrValue.target) {
        name = eOrValue.target.name;
        value = eOrValue.target.type === 'number' ? Number(eOrValue.target.value) : eOrValue.target.value;
      } else {
        name = fieldName;
        value = eOrValue;
      }
      if (name === 'Quantity') {
        const qty = value === "" ? "" : Math.max(1, Number(value));
        updated.Quantity = qty;
        const rate = updated.Rate === "" ? 0 : Number(updated.Rate);
        updated.Total_Amount = (qty === "" ? 0 : qty) * rate;
      } else if (name === 'Rate') {
        updated.Rate = value;
        const qty = updated.Quantity === "" ? 0 : Number(updated.Quantity);
        updated.Total_Amount = qty * (value === "" ? 0 : Number(value));
      }
      return updated;
    });
  };

  const handleItemSelectChange = (option) => {
    setItemModalData(prev => {
      const updated = { ...prev };
      updated.itemId = option ? option.value : "";
      updated.itemName = option ? option.label : "";
      updated.Rate = option ? option.rate : "";
      const qty = updated.Quantity === "" ? 0 : Number(updated.Quantity);
      updated.Total_Amount = qty * (Number(updated.Rate) || 0);
      return updated;
    });
  };

  const handleSaveItemModal = () => {
    if (!itemModalData.itemId) {
      setItemModalError("Please select an item.");
      toast.error("Please select an item.");
      return;
    }
    if (itemModalData.Quantity === "" || itemModalData.Quantity === null || itemModalData.Quantity === undefined) {
      setItemModalError("Quantity is required.");
      toast.error("Quantity is required.");
      return;
    }
    if (itemModalData.Rate === "" || itemModalData.Rate === null || itemModalData.Rate === undefined) {
      setItemModalError("Rate is required.");
      toast.error("Rate is required.");
      return;
    }
    if (Number(itemModalData.Quantity) < 1) {
      setItemModalError("Quantity must be at least 1.");
      toast.error("Quantity must be at least 1.");
      return;
    }
    setItemModalError("");
    const quantity = Number(itemModalData.Quantity);
    const rate = Number(itemModalData.Rate);
    const calculatedAmount = quantity * rate;
    const itemToSave = { ...itemModalData, Quantity: quantity, Rate: rate, Total_Amount: calculatedAmount };
    if (itemModalMode === 'add') {
      setOrderItems(items => [...items, itemToSave]);
      toast.success("Item added successfully!");
    } else if (itemModalMode === 'edit' && itemModalIndex !== null) {
      setOrderItems(items => items.map((it, idx) => idx === itemModalIndex ? itemToSave : it));
      toast.success("Item updated successfully!");
    }
    setItemModalOpen(false);
  };

  const handleRemoveItem = (idx) => {
    setOrderItems(items => items.filter((_, i) => i !== idx));
  };

  const customerSelectOptions = (customerList || []).map(customer => ({
    value: customer.id,
    label: customer.name,
  }));
  const selectedCustomer = customerSelectOptions.find(option => Number(option.value) === Number(formData.customerId)) || null;

  const statusSelectOptions = (statusList || []).map(status => ({
    value: status.code,
    label: status.name,
  }));
  const selectedStatus = statusSelectOptions.find(option => String(option.value) === String(formData.order_Status)) || null;

  const salesmanSelectOptions = (salesmanList || []).map(salesman => ({
    value: salesman.id,
    label: salesman.name,
  }));
  const selectedSalesman = salesmanSelectOptions.find(option => Number(option.value) === Number(formData.salesPerson_Id)) || null;

  const itemSelectOptions = (itemList || []).map(item => ({
    value: item.id,
    label: item.item_Name,
    rate: item.rate,
  }));
  const selectedItemModal = itemSelectOptions.find(option => String(option.value) === String(itemModalData.itemId)) || null;

  const totalAmount = orderItems.reduce((sum, it) => sum + Number(it.Total_Amount), 0);

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
              <Label>Order No<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="order_No"
                value={formData.order_No}
                placeholder="Auto-generated"
                readOnly
                style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold', color: '#888' }}
              />
            </Col>
            <Col md={6}>
              <Label>Customer<span style={{ color: "red" }}>*</span></Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select customer"
                options={customerSelectOptions}
                value={selectedCustomer}
                onChange={onCustomerChange}
                isSearchable
                isClearable
              />
            </Col>
            <Col md={6}>
              <Label>Order Date<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="order_Date"
                value={formData.order_Date}
                onChange={onChange}
                placeholder="YYYY-MM-DD"
                type="date"
              />
            </Col>
            <Col md={6}>
              <Label>Salesman<span style={{ color: "red" }}>*</span></Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select salesman"
                options={salesmanSelectOptions}
                value={selectedSalesman}
                onChange={onSalesmanChange}
                isSearchable
                isClearable
              />
            </Col>

            <Col md={12}>
              <div className="mb-3">
                <label>Order Items</label>
                <div className="d-flex justify-content-end mb-2">
                  <Button color="success" size="sm" type="button" onClick={openAddModal}>
                    + Add Item
                  </Button>
                </div>
                <Modal isOpen={itemModalOpen} toggle={closeItemModal}>
                  <ModalHeader toggle={closeItemModal}>{itemModalMode === 'add' ? 'Add Order Item' : 'Edit Order Item'}</ModalHeader>
                  <ModalBody>
                    {itemModalError && (
                      <div className="alert alert-danger py-2 mb-2" style={{ fontSize: '0.95rem' }}>{itemModalError}</div>
                    )}
                    <Form>
                      <Row className="g-2">
                        <Col md={12}>
                          <Label>Item Name<span style={{ color: "red" }}>*</span></Label>
                          <Select
                            classNamePrefix="select2-selection"
                            placeholder="Select item"
                            options={itemSelectOptions}
                            value={selectedItemModal}
                            onChange={handleItemSelectChange}
                            isSearchable
                            isClearable
                          />
                        </Col>
<Col md={6}>
  <Label>Rate</Label>
  <input
    className="form-control form-control-sm"
    name="Rate"
    type="text"
    value={itemModalData.Rate}
    readOnly
  />
</Col>
<Col md={6}>
  <Label>Rate</Label>
  <input
    className="form-control form-control-sm"
    name="Rate"
    type="text"
    value={itemModalData.Rate}
    readOnly
  />
</Col>
                        <Col md={12}>
                          <Label>Total Amount</Label>
                          <input
                            className="form-control form-control-sm"
                            name="Total_Amount"
                            value={itemModalData.Total_Amount}
                            readOnly
                          />
                        </Col>
                      </Row>
                    </Form>
                  </ModalBody>
                  <ModalFooter style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                    <Button color="success" onClick={handleSaveItemModal} style={{ minWidth: 100, fontWeight: 500 }}>Save</Button>
                    <Button color="secondary" onClick={closeItemModal} style={{ minWidth: 100, fontWeight: 500 }}>Cancel</Button>
                  </ModalFooter>
                </Modal>
                <div className="table-responsive">
                  <table className="table table-bordered table-striped table-sm mb-0">
                    <thead>
                      <tr>
                        <th>Sr.No</th>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Total Amount</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.length === 0 ? (
                        <tr style={{ height: 48 }}>
                          <td colSpan={6} style={{ textAlign: 'center', color: '#888', verticalAlign: 'middle', height: 48 }}>
                            No items added
                          </td>
                        </tr>
                      ) : (
                        orderItems.map((item, idx) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{item.itemName || (itemList.find(s => String(s.id) === String(item.itemId))?.item_Name) || ''}</td>
                            <td>{item.Quantity}</td>
                            <td>{item.Rate}</td>
                            <td>{item.Total_Amount}</td>
                            <td>
                              <div className="d-flex gap-2 align-items-center">
                                <button
                                  type="button"
                                  title="Edit"
                                  onClick={() => openEditModal(idx)}
                                  style={{ background: 'none', border: 'none', padding: 0, color: '#6f42c1', fontSize: 20, cursor: 'pointer' }}
                                >
                                  <i className="mdi mdi-pencil font-size-18" />
                                </button>
                                <button
                                  type="button"
                                  title="Remove"
                                  onClick={() => handleRemoveItem(idx)}
                                  style={{ background: 'none', border: 'none', padding: 0, color: '#e74c3c', fontSize: 20, cursor: 'pointer' }}
                                >
                                  <i className="mdi mdi-trash-can-outline font-size-18" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Amount</td>
                       <td style={{ fontWeight: 'bold' }}>
                          {orderItems.length > 0 ? totalAmount : 0}
                        </td>
                        <td></td>
                         
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </Col>

            <Col md={6}>
              <Label>Total Amount</Label>
              <Input
                name="total_Amount"
                value={totalAmount}
                readOnly
                style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold', color: '#888' }}
                tabIndex={-1}
              />
            </Col>

            <Col md={6}>
              <Label>Notes</Label>
              <Input
                name="notes"
                value={formData.notes}
                onChange={onChange}
                placeholder="Enter notes"
                type="textarea"
                rows={3}
              />
            </Col>
          </Row>
          <div className="app-form-actions">
             <Button color="success" type="submit" disabled={saving}>
              {saving ? <Spinner size="sm" className="me-2" /> : null}
              Save
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

export default OrderForm;
