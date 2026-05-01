import React, { useState } from "react";
// If not already in your project, ensure FontAwesome or similar icon library is imported globally
import { toast } from 'react-toastify';
import { Alert, Button, Card, CardBody, CardHeader, Col, Form, Input, Label, Row, Spinner, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import Select from "react-select";

const InvoiceForm = ({
  title,
  formError,
  formData,
  isEditMode,
  saving,
  onChange,
  onSubmit,
  onClose,
  clientList = [],
  onClientChange,
  statusList = [],
  onStatusChange,
  invoiceTypeList = [],
  onInvoiceTypeChange,
  dueDaysList = [],
  onDueDaysChange,
  serviceList = [],
  invoiceItems,
  setInvoiceItems,
}) => {
  // invoiceItems and setInvoiceItems are now controlled from parent

  // --- Modal state for Add/Edit Item ---
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState('add'); // 'add' or 'edit'
  const [itemModalIndex, setItemModalIndex] = useState(null); // index for edit
  const [itemModalData, setItemModalData] = useState({
    serviceId: "",
    ServiceName: "",
    ItemType: "Service",
    Description: "",
    Quantity: "",
    Rate: "",
    Amount: 0,
  });
  const [itemModalError, setItemModalError] = useState("");

  const openAddModal = () => {
    setItemModalData({
      serviceId: "",
      ServiceName: "",
      ItemType: "Service",
      Description: "",
      Quantity: "1",
      Rate: "0",
      Amount: 0,
    });
    setItemModalMode('add');
    setItemModalIndex(null);
    setItemModalOpen(true);
  };
  const openEditModal = (idx) => {
    setItemModalData({ ...invoiceItems[idx] });
    setItemModalMode('edit');
    setItemModalIndex(idx);
    setItemModalOpen(true);
  };
  const closeItemModal = () => {
    setItemModalOpen(false);
    setItemModalError("");
  };

  // Handle changes in the modal form (add/edit)
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
      if (name === 'serviceId') {
        const found = serviceList.find(s => String(s.serviceId) === String(value));
        updated.serviceId = value;
        updated.ServiceName = found ? found.ServiceName : '';
        // Only auto-fill Description if in edit mode, not add mode
        if (itemModalMode === 'edit' && !prev.Description && found && found.Description) {
          updated.Description = found.Description;
        }
        updated.Rate = found ? found.Rate : "";
        const qty = updated.Quantity === "" ? 0 : Number(updated.Quantity);
        updated.Amount = qty * (Number(updated.Rate) || 0);
      } else if (name === 'Quantity') {
        const qty = value === "" ? "" : Math.max(1, Number(value));
        updated.Quantity = qty;
        const rate = updated.Rate === "" ? 0 : Number(updated.Rate);
        updated.Amount = (qty === "" ? 0 : qty) * rate;
      } else if (name === 'Rate') {
        updated.Rate = value;
        const qty = updated.Quantity === "" ? 0 : Number(updated.Quantity);
        updated.Amount = qty * (value === "" ? 0 : Number(value));
      } else if (name === 'ItemType') {
        updated.ItemType = value;
      } else if (name === 'Description') {
        updated.Description = value;
      }
      return updated;
    });
  };

  // Save new or edited item from modal
  const handleSaveItemModal = () => {
    // Validation: require service and description
    if (!itemModalData.serviceId) {
      setItemModalError("Please select a service.");
      toast.error("Please select a service.");
      return;
    }
    if (!itemModalData.Description || itemModalData.Description.trim() === "") {
      setItemModalError("Please enter a description.");
      toast.error("Please enter a description.");
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
    const itemToSave = { ...itemModalData, Quantity: quantity, Rate: rate, Amount: calculatedAmount };
    if (itemModalMode === 'add') {
      setInvoiceItems(items => [...items, itemToSave]);
      toast.success("Item added successfully!");
    } else if (itemModalMode === 'edit' && itemModalIndex !== null) {
      setInvoiceItems(items => items.map((it, idx) => idx === itemModalIndex ? itemToSave : it));
      toast.success("Item updated successfully!");
    }
    setItemModalOpen(false);
  };

  // Use serviceList prop for dropdown

  // --- Handlers ---

  // Old inline add replaced by modal
  // const handleAddService = () => { ... };

  const handleRemoveItem = (idx) => {
    setInvoiceItems(items => items.filter((_, i) => i !== idx));
  };

  // Live edit handler for invoice items
  const handleInvoiceItemChange = (idx, eOrValue, fieldName) => {
    setInvoiceItems(items => {
      const updatedItems = [...items];
      let updated = { ...updatedItems[idx] };
      let name, value;
      if (typeof eOrValue === 'object' && eOrValue.target) {
        name = eOrValue.target.name;
        value = eOrValue.target.value;
      } else {
        name = fieldName;
        value = eOrValue;
      }
      if (name === 'serviceId') {
        const found = serviceList.find(s => String(s.serviceId) === String(value));
        updated.serviceId = value;
        updated.ServiceName = found ? found.ServiceName : '';
        // Only update Description if it was previously auto-filled and not edited by user
        if (!updated.Description || updated.Description === updatedItems[idx].Description) {
          updated.Description = found ? found.Description : '';
        }
        updated.Rate = found ? found.Rate : "";
        const qty = updated.Quantity === "" ? 0 : Number(updated.Quantity);
        updated.Amount = qty * (Number(updated.Rate) || 0);
      } else if (name === 'Quantity') {
        updated.Quantity = value;
        const qty = value === "" ? 0 : Number(value);
        const rate = updated.Rate === "" ? 0 : Number(updated.Rate);
        updated.Amount = qty * rate;
      } else if (name === 'ItemType') {
        updated.ItemType = value;
      } else if (name === 'Description') {
        updated.Description = value;
      }
      updatedItems[idx] = updated;
      return updatedItems;
    });
  };


  // Prepare options for react-select
  const clientSelectOptions = (clientList || []).map(client => ({
    value: client.id,
    label: client.name,
  }));
  const selectedClient = clientSelectOptions.find(option => Number(option.value) === Number(formData.clientId)) || null;

  // Status dropdown options
  const statusSelectOptions = (statusList || []).map(status => ({
    value: status.code,
    label: status.name,
  }));
  const selectedStatus = statusSelectOptions.find(option => String(option.value) === String(formData.status)) || null;

  // Invoice Type dropdown options
  const invoiceTypeSelectOptions = (invoiceTypeList || []).map(item => ({
    value: item.code,
    label: item.name,
  }));
  const selectedInvoiceType = invoiceTypeSelectOptions.find(option => String(option.value) === String(formData.invoiceType)) || null;

  // Due Days dropdown options
  const dueDaysSelectOptions = (dueDaysList || []).map(item => ({
    value: item.name,
    label: `${item.name} Days`,
  }));
  const selectedDueDays = dueDaysSelectOptions.find(option => String(option.value) === String(formData.duedays)) || null;

  // Calculate Sub Total and Final Amount
  const subTotal = invoiceItems.reduce((sum, it) => sum + Number(it.Amount), 0);
  const discountRaw = formData.discount === undefined || formData.discount === null ? "" : formData.discount;
  const discountPercent = Math.min(Number(discountRaw) || 0, 100);
  const finalAmount = subTotal - (subTotal * discountPercent / 100);

  return (
    <Card className="mb-4 app-form-card">
      <CardHeader className="bg-white d-flex align-items-center justify-content-between">
              <h5 className="mb-0">{title}</h5>
              {/* <Button color="link" className="p-0" type="button" onClick={onClose}>
                Close
              </Button> */}
                  <Button color="secondary" type="button" onClick={onClose}>
                            <i className="mdi mdi-arrow-left me-1" />Back
                          </Button>
            </CardHeader>
      <CardBody className="app-form-body">
        {formError ? <Alert color="danger">{formError}</Alert> : null}
        <Form onSubmit={onSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Label>Invoice Number<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="invoiceNumber"
                value={formData.invoiceNumber}
                placeholder="Enter invoice number"
                readOnly
                style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold', color: '#888' }}
              />
            </Col>
            <Col md={6}>
              <Label>Select Client<span style={{ color: "red" }}>*</span></Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select client"
                options={clientSelectOptions}
                value={selectedClient}
                onChange={onClientChange}
                isSearchable
                isClearable
              />
            </Col>
            <Col md={6}>
              <Label>Invoice Date<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={onChange}
                placeholder="YYYY-MM-DD"
                type="date"
                max={new Date().toISOString().split("T")[0]}
              />
            </Col>
             <Col md={6}>
              <Label>Due Days</Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select due days"
                options={dueDaysSelectOptions}
                value={selectedDueDays}
                onChange={onDueDaysChange}
                isSearchable
                isClearable
              />
            </Col>
            {/* <Col md={6}>
              <Label>Due Date</Label>
              <Input
                name="dueDate"
                value={formData.dueDate}
                onChange={onChange}
                placeholder="YYYY-MM-DD"
                type="date"
                min={(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })()}
              />
            </Col> */}
            <Col md={6}>
              <Label>Invoice Type<span style={{ color: "red" }}>*</span></Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select invoice type"
                options={invoiceTypeSelectOptions}
                value={selectedInvoiceType}
                onChange={onInvoiceTypeChange}
                isSearchable
                isClearable
              />
            </Col>
           




 <Col md={12}>
              <div className="mb-3">
                <label>Invoice Items</label>
                <div className="d-flex justify-content-end mb-2">
                  <Button color="success" size="sm" type="button" onClick={openAddModal}>
                    + Add Item
                  </Button>
                </div>
                {/* Add/Edit Item Modal */}
                <Modal isOpen={itemModalOpen} toggle={closeItemModal}>
                  <ModalHeader toggle={closeItemModal}>{itemModalMode === 'add' ? 'Add Invoice Item' : 'Edit Invoice Item'}</ModalHeader>
                  <ModalBody>
                    {itemModalError && (
                      <div className="alert alert-danger py-2 mb-2" style={{ fontSize: '0.95rem' }}>{itemModalError}</div>
                    )}
                    <Form>
                      <Row className="g-2">
                        <Col md={12}>
                          <Label>Service Name<span style={{ color: "red" }}>*</span></Label>
                          <select
                            className="form-control form-control-sm"
                            name="serviceId"
                            value={itemModalData.serviceId}
                            onChange={e => handleItemModalChange(e)}
                          >
                            <option value="">Select Service</option>
                            {serviceList.map((s, i) => (
                              <option key={s.serviceId || i} value={s.serviceId}>{s.ServiceName}</option>
                            ))}
                          </select>
                        </Col>
                        {/* <Col md={12}>
                          <Label>Item Type</Label>
                          <div className="d-flex align-items-center gap-2">
                            <button
                              type="button"
                              className={`btn btn-sm ${itemModalData.ItemType === 'Service' ? 'btn-primary' : 'btn-outline-primary'}`}
                              onClick={() => handleItemModalChange('Service', 'ItemType')}
                            >
                              Service
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm ${itemModalData.ItemType === 'GovtFee' ? 'btn-primary' : 'btn-outline-primary'}`}
                              onClick={() => handleItemModalChange('GovtFee', 'ItemType')}
                            >
                              GovtFee
                            </button>
                          </div>
                        </Col> */}
                        <Col md={12}>
                          <Label>Description<span style={{ color: "red" }}>*</span></Label>
                          <textarea
                            className="form-control form-control-sm"
                            name="Description"
                            value={itemModalData.Description}
                            onChange={e => handleItemModalChange(e)}
                            rows={3}
                          />
                        </Col>
                        <Col md={6}>
                          <Label>Quantity</Label>
                          <input
                            className="form-control form-control-sm"
                            name="Quantity"
                            type="text"
                            value={itemModalData.Quantity}
                            onChange={e => handleItemModalChange(e)}
                            onKeyDown={(e) => {
                              const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
                              if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                          />
                        </Col>
                        <Col md={6}>
                          <Label>Rate</Label>
                          <input
                            className="form-control form-control-sm"
                            name="Rate"
                            type="text"
                            value={itemModalData.Rate}
                            onChange={e => handleItemModalChange(e)}
                            onKeyDown={(e) => {
                              const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "."];
                              if (!/[0-9.]/.test(e.key) && !allowedKeys.includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                          />
                        </Col>
                        <Col md={12}>
                          <Label>Amount</Label>
                          <input
                            className="form-control form-control-sm"
                            name="Amount"
                            value={itemModalData.Amount}
                            readOnly
                          />
                        </Col>
                      </Row>
                    </Form>
                  </ModalBody>
                  <ModalFooter style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                    <Button color="secondary" onClick={closeItemModal} style={{ minWidth: 100, fontWeight: 500 }}>Cancel</Button>
                    <Button color="success" onClick={handleSaveItemModal} style={{ minWidth: 100, fontWeight: 500 }}>Save</Button>
                  </ModalFooter>
                </Modal>
                <div className="table-responsive">
                  <table className="table table-bordered table-striped table-sm mb-0">
                    <thead>
                      <tr>
                        <th>Sr.No</th>
                        <th>Service Name</th>
                        {/* <th>Item Type</th> */}
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Amount</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceItems.length === 0 ? (
                        <tr style={{ height: 48 }}>
                          <td colSpan={7} style={{ textAlign: 'center', color: '#888', verticalAlign: 'middle', height: 48 }}>
                            No items added
                          </td>
                        </tr>
                      ) : (
                        invoiceItems.map((item, idx) => (
                          <tr key={idx}>
                            {/* Sr. */}
                            <td>{idx + 1}</td>
                            {/* Service Name */}
                            <td>{item.ServiceName || (serviceList.find(s => String(s.serviceId) === String(item.serviceId))?.ServiceName) || ''}</td>
                            {/* Description */}
                            <td>{item.Description}</td>
                            {/* Quantity */}
                            <td>{item.Quantity}</td>
                            {/* Rate */}
                            <td>{item.Rate}</td>
                            {/* Amount */}
                            <td>{item.Amount}</td>
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
                      {/* Total row always visible, now under Amount column */}
                      <tr>
                        <td colSpan={5}></td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Amount</td>
                        <td style={{ fontWeight: 'bold' }}>
                          {invoiceItems.length > 0 ? invoiceItems.reduce((sum, it) => sum + Number(it.Amount), 0) : 0}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </Col>


            
            <Col md={4}>
              <Label>Sub Total</Label>
              <Input
                name="subTotal"
                value={subTotal}
                readOnly
                style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold', color: '#888' }}
                tabIndex={-1}
              />
            </Col>
            <Col md={4}>
              <Label>Discount (%)</Label>
<div style={{ position: 'relative' }}>
  <Input
    name="discount"
    value={discountRaw ?? ""}
    onChange={(e) => {
      let value = e.target.value;

      if (value === "") {
        onChange({
          target: { name: "discount", value: "" }
        });
        return;
      }

      let num = Number(value);

      if (num > 100) num = 100;
      if (num < 0) num = 0;

      onChange({
        target: { name: "discount", value: num }
      });
    }}
    onBlur={(e) => {
      let value = e.target.value;

      if (value === "") return;

      let num = Number(value);

      if (num > 100) {
        onChange({
          target: { name: "discount", value: 100 }
        });
      }
      if (num > 0 && num < 0.01) {
        onChange({
          target: { name: "discount", value: "" }
        });
      }
    }}
    placeholder="Enter discount %"
    type="text"
    onKeyDown={(e) => {
      const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "."];
      if (!/[0-9.]/.test(e.key) && !allowedKeys.includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "0" && !e.target.value) {
        e.preventDefault();
      }
    }}
    style={{ paddingRight: 30 }}
  />

  <span
    style={{
      position: 'absolute',
      right: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#888'
    }}
  >
    %
  </span>
</div>
            </Col>
            <Col md={4}>
              <Label>Final Amount</Label>
              <Input
                name="finalAmount"
                value={finalAmount}
                readOnly
                style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold', color: '#888' }}
                tabIndex={-1}
              />
            </Col>
            {/* Status input only visible in edit mode */}
            {isEditMode && (
              <Col md={6}>
                <Label>Status<span style={{ color: "red" }}>*</span></Label>
                <Select
                  classNamePrefix="select2-selection"
                  placeholder="Select status"
                  options={statusSelectOptions}
                  value={selectedStatus}
                  onChange={onStatusChange}
                  isSearchable
                  isClearable
                />
              </Col>
            )}
            <Col md={6}>
              <Label>Notes</Label>
              <Input
                name="notes"
                value={formData.notes}
                onChange={onChange}
                placeholder="Enter notes"
                maxLength={100}
              />
            </Col>
          </Row>
          <div className="app-form-actions">
                      <Button color="light" type="button" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button color="success" type="submit" disabled={saving}>
                        {saving ? <Spinner size="sm" className="me-2" /> : null}
                        Save
                      </Button>
                    </div>
        </Form>
      </CardBody>
    </Card>
  );
};

export default InvoiceForm;
