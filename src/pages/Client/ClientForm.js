import React from "react"
import { Alert, Button, Card, CardBody, CardHeader, Col, Form, Input, Label, Row, Spinner } from "reactstrap"

const ClientForm = ({
  title,
  formError,
  formData,
  isEditMode,
  saving,
  onChange,
  onSubmit,
  onClose,
}) => {
  return (
    <Card className="mb-4 app-form-card">
      <CardHeader className="bg-white d-flex align-items-center justify-content-between">
        <h5 className="mb-0">{title}</h5>
        <Button color="link" className="p-0" type="button" onClick={onClose} style={{ color: '#6c63ff', fontWeight: 500 }}>
          Close
        </Button>
      </CardHeader>
      <CardBody className="app-form-body">
        {formError ? <Alert color="danger">{formError}</Alert> : null}
        <Form onSubmit={onSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Label>Client Name<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="clientName"
                value={formData.clientName}
                onChange={onChange}
                placeholder="Enter client name"
              />
            </Col>
            <Col md={6}>
              <Label>Company Name</Label>
              <Input
                name="companyName"
                value={formData.companyName}
                onChange={onChange}
                placeholder="Enter company name"
              />
            </Col>
            <Col md={6}>
              <Label>Email<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="email"
                value={formData.email}
                onChange={onChange}
                placeholder="Enter email"
              />
            </Col>
            <Col md={6}>
              <Label>Phone</Label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={onChange}
                placeholder="Enter phone"
                maxLength={10}
                inputMode="numeric"
                pattern="^[0-9]{10}$"
                title="Phone number must be exactly 10 digits."
                onKeyPress={e => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </Col>
            <Col md={6} className="display-non"> 
              <Label>GST Number</Label>
              <Input
                name="gstNumber"
                value={formData.gstNumber}
                onChange={onChange}
                placeholder="Enter GST number"
              />
            </Col>
            <Col md={12}>
              <Label>Address</Label>
              <Input
                name="address"
                value={formData.address}
                onChange={onChange}
                placeholder="Enter address"
              />
            </Col>
          </Row>
          <div className="app-form-actions d-flex justify-content-center mt-4">
            <Button color="light" type="button" onClick={onClose} style={{ minWidth: 120, marginRight: 16 }}>
              Cancel
            </Button>
            <Button color="success" type="submit" disabled={saving} style={{ minWidth: 120 }}>
              {saving ? <Spinner size="sm" className="me-2" /> : null}
              Save
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  )
}

export default ClientForm
