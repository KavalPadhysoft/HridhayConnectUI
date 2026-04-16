import React from "react";
import { Alert, Button, Card, CardBody, CardHeader, Col, Form, Input, Label, Row, Spinner } from "reactstrap";
import Select from "react-select";

const AdvancePaymentForm = ({
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
}) => {
  const clientSelectOptions = (clientList || []).map(client => ({
    value: client.id,
    label: client.name,
  }));
  const selectedClient = clientSelectOptions.find(option => Number(option.value) === Number(formData.clientId)) || null;

  const statusSelectOptions = (statusList || []).map(status => ({
    value: status.code || status.value || status.id,
    label: status.name || status.label,
  }));
  const selectedStatus = statusSelectOptions.find(option => String(option.value) === String(formData.status)) || null;

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
              <Label>Select Client<span style={{ color: "red" }}>*</span></Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select client"
                options={clientSelectOptions}
                value={selectedClient}
                onChange={onClientChange}
                isClearable
              />
            </Col>
            <Col md={6}>
              <Label>Total Amount<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="totalAmount"
                type="number"
                value={formData.totalAmount}
                onChange={onChange}
                placeholder="Enter total amount"
              />
            </Col>
            {isEditMode && (
              <>
                <Col md={6}>
                  <Label>Remaining Amount<span style={{ color: "red" }}>*</span></Label>
                  <Input
                    name="remainingAmount"
                    type="number"
                    value={formData.remainingAmount}
                    onChange={onChange}
                    placeholder="Enter remaining amount"
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
                    isClearable
                  />
                </Col>
              </>
            )}
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

export default AdvancePaymentForm;
