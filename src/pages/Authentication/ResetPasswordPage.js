import { DASHBOARD_NAME } from "../../config";
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardBody, Col, Container, FormFeedback, Input, Label, Row } from 'reactstrap';
import logoDark from "../../assets/images/logo-dark.png";
import logoLight from "../../assets/images/logo-light.png";
import hridhayConnectLogo from "../../assets/images/ChamperOfimg/HridhayConnect.jpeg";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { post } from "../../helpers/api_helper";

const ResetPasswordPage = () => {
  document.title = `Reset Password | ${DASHBOARD_NAME}`;
  const navigate = useNavigate();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Remove local error/success state, use toast instead
  const email = localStorage.getItem("reset_email") || "";

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      newPassword: Yup.string().required("Please enter new password"),
      confirmPassword: Yup.string().oneOf([Yup.ref('newPassword'), null], 'Passwords must match').required("Please confirm your password"),
    }),
    onSubmit: async (values) => {
      try {
        const data = await post(
          "/User/ForgotPassword_ResetPassword",
          null,
          {
            params: {
              Email: email,
              NewPassword: values.newPassword,
              ConfirmPassword: values.confirmPassword,
            },
          }
        );
        if (data.statusCode === 1) {
          toast.success(data.message || "Password reset successfully");
          setTimeout(() => navigate("/login"), 1500);
        } else {
          toast.error(data.message || "Failed to reset password");
        }
      } catch (err) {
        toast.error("Something went wrong. Please try again.");
      }
    }
  });

  return (
    <React.Fragment>
      <ToastContainer />
      <div className="account-pages my-5 pt-sm-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card className="overflow-hidden">
                <CardBody className="pt-0">
                  <h3 className="text-center mt-3 mb-2">
                    <img src={hridhayConnectLogo} alt="Logo" height="100" style={{ objectFit: 'contain' }} />
                  </h3>
                  <div className="p-2">
                    <h4 className="text-muted font-size-18 mb-3 text-center">Reset Password</h4>
                    <form className="form-horizontal mt-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                      }}>
                      <div className="mb-3">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="password-wrapper">
                          <Input
                            name="newPassword"
                            className="form-control password-input"
                            placeholder="Enter new password"
                            type={showNewPassword ? "text" : "password"}
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.newPassword || ""}
                            invalid={
                              validation.touched.newPassword && validation.errors.newPassword ? true : false
                            }
                          />
                          <button
                            type="button"
                            className="password-toggle-btn"
                            title={showNewPassword ? "Hide password" : "Show password"}
                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                            onClick={() => setShowNewPassword(previous => !previous)}
                          >
                            <i className={`mdi ${showNewPassword ? "mdi-eye-off-outline" : "mdi-eye-outline"} font-size-18`} />
                          </button>
                        </div>
                        {validation.touched.newPassword && validation.errors.newPassword ? (
                          <FormFeedback type="invalid" className="d-block">{validation.errors.newPassword}</FormFeedback>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="password-wrapper">
                          <Input
                            name="confirmPassword"
                            className="form-control password-input"
                            placeholder="Confirm new password"
                            type={showConfirmPassword ? "text" : "password"}
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.confirmPassword || ""}
                            invalid={
                              validation.touched.confirmPassword && validation.errors.confirmPassword ? true : false
                            }
                          />
                          <button
                            type="button"
                            className="password-toggle-btn"
                            title={showConfirmPassword ? "Hide password" : "Show password"}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            onClick={() => setShowConfirmPassword(previous => !previous)}
                          >
                            <i className={`mdi ${showConfirmPassword ? "mdi-eye-off-outline" : "mdi-eye-outline"} font-size-18`} />
                          </button>
                        </div>
                        {validation.touched.confirmPassword && validation.errors.confirmPassword ? (
                          <FormFeedback type="invalid" className="d-block">{validation.errors.confirmPassword}</FormFeedback>
                        ) : null}
                      </div>
                      <Row className="mb-3">
                        <div className="col-12 d-flex justify-content-between">
                          <button className="btn btn-primary w-md waves-effect waves-light" type="submit">Submit</button>
                          <Link to="/login" className="btn btn-secondary w-md waves-effect waves-light">Back</Link>
                        </div>
                      </Row>
                    </form>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ResetPasswordPage;
