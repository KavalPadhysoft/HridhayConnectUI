import React from "react"
import { Alert, Button, Card, CardBody, CardHeader, Col, Form, Input, Label, Row, Spinner } from "reactstrap"

const ServiceForm = ({
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
              <Label>Service Name<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="serviceName"
                value={formData.serviceName}
                onChange={onChange}
                placeholder="Enter service name"
              />
            </Col>
            <Col md={6}>
              <Label>DefaultPrice<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="defaultPrice"
                value={formData.defaultPrice}
                onChange={onChange}
                placeholder="Enter Default Price"
                maxLength={9} 
                 onKeyDown={(e) => {
      const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];

      // Allow only digits + control keys
      if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
        e.preventDefault();
      }
    }}             />
            </Col>
            <Col md={6}>
              <Label>Description</Label>
              <Input
                name="description"
                value={formData.description}
                onChange={onChange}
                placeholder="Enter description"
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

export default ServiceForm
