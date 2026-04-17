import React, { useState } from "react";
import { Alert, Button, Card, CardBody, CardHeader, Col, Form, Input, Label, Row, Spinner } from "reactstrap";
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
  serviceList = [],
  invoiceItems,
  setInvoiceItems,
}) => {
  // invoiceItems and setInvoiceItems are now controlled from parent

  // Use serviceList prop for dropdown

  // --- Handlers ---
  const handleAddService = () => {
    setInvoiceItems(items => [
      ...items,
      {
        serviceId: "",
        ServiceName: "",
        ItemType: "Service",
        Description: "",
        Quantity: 1,
        Rate: 0,
        Amount: 0,
      },
    ]);
  };

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
        value = eOrValue.target.type === 'number' ? Number(eOrValue.target.value) : eOrValue.target.value;
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
        updated.Rate = found ? found.Rate : 0;
        updated.Amount = updated.Quantity * updated.Rate;
      } else if (name === 'Quantity') {
        updated.Quantity = Number(value);
        updated.Amount = updated.Quantity * updated.Rate;
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

  // Calculate Sub Total and Final Amount
  const subTotal = invoiceItems.reduce((sum, it) => sum + Number(it.Amount), 0);
  const discountRaw = formData.discount === undefined || formData.discount === null ? "" : formData.discount;
  const discountPercent = Math.min(Number(discountRaw) || 0, 100);
  const finalAmount = subTotal - (subTotal * discountPercent / 100);

  return (
    <Card className="mb-4 app-form-card">
      <CardHeader className="bg-white d-flex align-items-center justify-content-between">
              <h5 className="mb-0">{title}</h5>
              <Button color="link" className="p-0" type="button" onClick={onClose}>
                Close
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
                onChange={onChange}
                placeholder="Enter invoice number"
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
              <Label>Due Date<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="dueDate"
                value={formData.dueDate}
                onChange={onChange}
                placeholder="YYYY-MM-DD"
                type="date"
                min={(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })()}
              />
            </Col>




 <Col md={12}>
              <div className="mb-3">
                <label>Invoice Items</label>
                <div className="d-flex justify-content-end mb-2">
                  <Button color="success" size="sm" type="button" onClick={handleAddService}>
                    + Add Item
                  </Button>
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered table-sm mb-0">
                    <thead>
                      <tr>
                        <th>Service Name</th>
                        <th>Item Type</th>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Amount</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceItems.map((item, idx) => (
                        <tr key={idx}>
                          {/* Service Name */}
                          <td>
                            <select
                              className="form-control form-control-sm"
                              name="serviceId"
                              value={item.serviceId}
                              onChange={e => handleInvoiceItemChange(idx, e)}
                            >
                              <option value="">Select Service</option>
                              {serviceList.map((s, i) => (
                                <option key={s.serviceId || i} value={s.serviceId}>{s.ServiceName}</option>
                              ))}
                            </select>
                          </td>
                          {/* Item Type as buttons */}
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <button
                                type="button"
                                className={`btn btn-sm ${item.ItemType === 'Service' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => handleInvoiceItemChange(idx, 'Service', 'ItemType')}
                              >
                                Service
                              </button>
                              <button
                                type="button"
                                className={`btn btn-sm ${item.ItemType === 'GovtFee' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => handleInvoiceItemChange(idx, 'GovtFee', 'ItemType')}
                              >
                                GovtFee
                              </button>
                            </div>
                          </td>
                          {/* Description */}
                          <td>
                            <input
                              className="form-control form-control-sm"
                              name="Description"
                              value={item.Description}
                              onChange={e => handleInvoiceItemChange(idx, e)}
                            />
                          </td>
                          {/* Quantity */}
                          <td>
                            <input
                              className="form-control form-control-sm"
                              name="Quantity"
                              type="number"
                              min="1"
                              value={item.Quantity}
                              onChange={e => handleInvoiceItemChange(idx, e)}
                            />
                          </td>
                          {/* Rate */}
                          <td>
                            <input
                              className="form-control form-control-sm"
                              name="Rate"
                              type="number"
                              step="0.01"
                              value={item.Rate}
                              readOnly
                            />
                          </td>
                          {/* Amount */}
                          <td>
                            <input
                              className="form-control form-control-sm"
                              name="Amount"
                              value={item.Amount}
                              readOnly
                            />
                          </td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                     
                    {/* Summary row for total amount */}
                      {/* ...existing code... */}
                      {/* Total row at the end */}
                      {invoiceItems.length > 0 && (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Amount</td>
                          <td style={{ fontWeight: 'bold' }}>
                            {invoiceItems.reduce((sum, it) => sum + Number(it.Amount), 0)}
                          </td>
                          <td></td>
                          <td></td>
                        </tr>
                      )}
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

      // allow empty
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

      if (value === "") return; // don't force 0

      let num = Number(value);

      if (num > 100) {
        onChange({
          target: { name: "discount", value: 100 }
        });
      }
    }}
    placeholder="Enter discount %"
    type="number"
    min={0}
    max={100}
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
            <Col md={6}>
              <Label>Notes</Label>
              <Input
                name="notes"
                value={formData.notes}
                onChange={onChange}
                placeholder="Enter notes"
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
