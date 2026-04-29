
import React from "react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  Input,
  Label,
  Row,
  Spinner,
} from "reactstrap";

const TermsForm = ({ title, formError, formData, isEditMode, saving, onChange, onSubmit, onClose }) => (
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
            <Label>Terms<span style={{ color: "red" }}>*</span></Label>
            <Input
              name="terms"
              value={formData.terms}
              onChange={onChange}
              placeholder="Enter terms"
              maxLength={150}
            />
          </Col>
          <Col md={6}>
            <Label>Display Seq No<span style={{ color: "red" }}>*</span></Label>
<Input
              name="displaySeqNo"
              type="number"
              value={formData.displaySeqNo}
              onChange={(e) => {
                const val = e.target.value;
                if (val.length <= 2) {
                  onChange(e);
                }
              }}
              placeholder="Enter display sequence number"
              min={1}
              max={99}
              onKeyDown={(e) => {
                const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
                if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                  e.preventDefault();
                }
                if (e.key === "0" && !e.target.value) {
                  e.preventDefault();
                }
              }}
            />
          </Col>
        </Row>
        <div className="app-form-actions mt-4">
          <Button color="light" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button color="success" type="submit" disabled={saving} className="ms-2">
            {saving ? <Spinner size="sm" className="me-2" /> : null}
            Save
          </Button>
        </div>
      </Form>
    </CardBody>
  </Card>
);

export default TermsForm;
