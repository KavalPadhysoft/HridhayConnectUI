import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardBody, CardHeader, Button, Form, Row, Col, Label, Input, Spinner, Alert } from "reactstrap";
import { getCompanyMasterById, saveCompanyMaster } from "../../helpers/fakebackend_helper";
import { showSuccess, showError } from "../../Pop_show/alertService";

const initialState = {
  id: 0,
  accountNo: "",
  accountName: "",
  bank: "",
  ifscCode: "",
  pan: "",
  mobile: "",
  email: "",
  address: "",
};

const CompanyMasterForm = () => {
  const [form, setForm] = useState(initialState);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  useEffect(() => {
    if (id) fetchData(id);
  }, [id]);

  const fetchData = async (id) => {
    setLoading(true);
    setFormError("");
    try {
      const res = await getCompanyMasterById(id);
      const data = res?.data || {};
      // Map API response to form state structure, fallback to initialState for missing fields
      const mapped = {
        id: data.id ?? initialState.id,
        accountNo: data.accountNo ?? initialState.accountNo,
        accountName: data.accountName ?? initialState.accountName,
        bank: data.bank ?? initialState.bank,
        ifscCode: data.ifscCode ?? initialState.ifscCode,
        pan: data.pan ?? initialState.pan,
        mobile: data.mobile ?? initialState.mobile,
        email: data.email ?? initialState.email,
        address: data.address ?? initialState.address,
      };
      setForm(mapped);
    } catch (err) {
      setFormError("Failed to load company master");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile") {
      // Only allow digits and max 10 characters
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setForm({ ...form, [name]: digits });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });
      if (file) formData.append("file", file);
      const response = await saveCompanyMaster(formData);
      if (response?.isSuccess || response?.statusCode === 1) {
        await showSuccess(response?.message || "Saved successfully");
        navigate("/company-master");
        return;
      }
      throw new Error(response?.message || "Failed to save company master");
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save company master";
      await showError(errorMessage);
      setFormError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4 app-form-card">
      <CardHeader className="bg-white d-flex align-items-center justify-content-between">
        <h5 className="mb-0">{isEditMode ? "Edit Company Master" : "Add Company Master"}</h5>
        <Button color="link" className="p-0" type="button" onClick={() => navigate("/company-master")}>Close</Button>
      </CardHeader>
      <CardBody className="app-form-body">
        {formError ? <Alert color="danger">{formError}</Alert> : null}
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Row className="g-3">
            <Col md={6}>
              <Label>Account No<span style={{ color: "red" }}>*</span></Label>
              <Input name="accountNo" value={form.accountNo} onChange={handleChange} placeholder="Enter account no" />
            </Col>
            <Col md={6}>
              <Label>Account Name<span style={{ color: "red" }}>*</span></Label>
              <Input name="accountName" value={form.accountName} onChange={handleChange} placeholder="Enter account name"  />
            </Col>
            <Col md={6}>
              <Label>Bank<span style={{ color: "red" }}>*</span></Label>
              <Input name="bank" value={form.bank} onChange={handleChange} placeholder="Enter bank"  />
            </Col>
            <Col md={6}>
              <Label>IFSC Code<span style={{ color: "red" }}>*</span></Label>
              <Input name="ifscCode" value={form.ifscCode} onChange={handleChange} placeholder="Enter IFSC code"  />
            </Col>
            <Col md={6}>
              <Label>PAN<span style={{ color: "red" }}>*</span></Label>
              <Input name="pan" value={form.pan} onChange={handleChange} placeholder="Enter PAN"  />
            </Col>
            <Col md={6}>
              <Label>Mobile<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="Enter mobile"
                maxLength={10}
                inputMode="numeric"
                pattern="^[0-9]{10}$"
                title="Mobile number must be exactly 10 digits."
              />
            </Col>
            <Col md={6}>
              <Label>Email<span style={{ color: "red" }}>*</span></Label>
              <Input name="email" value={form.email} onChange={handleChange} placeholder="Enter email"  />
            </Col>
            <Col md={6}>
              <Label>Address<span style={{ color: "red" }}>*</span></Label>
              <Input name="address" value={form.address} onChange={handleChange} placeholder="Enter address"  />
            </Col>
            <Col md={6}>
              <Label>Signature File</Label>
              <Input type="file" name="file" onChange={handleFileChange} />
            </Col>
          </Row>
          <div className="app-form-actions mt-4">
            <Button color="light" type="button" onClick={() => navigate("/company-master")}>Cancel</Button>
            <Button color="success" type="submit" disabled={loading} className="ms-2">
              {loading ? <Spinner size="sm" className="me-2" /> : null}
              Save
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};

export default CompanyMasterForm;
