import { DASHBOARD_NAME } from "../../config";
import React, { useEffect, useMemo, useState } from "react"
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"

import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";



import { useNavigate, useLocation, useParams } from "react-router-dom"
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common"
import { getServicesPages, deleteServiceById, getServiceById, saveService } from "../../helpers/fakebackend_helper"
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService"
import ServiceForm from "./ServiceForm"

const Service_LIST_SORT_COLUMN = "ServiceName"
const Service_LIST_SORT_DIR = "asc"

const Service = props => {
  document.title = `Service | ${DASHBOARD_NAME}`;
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const ServiceId = Number(params.id || 0);
  const isFormPage = location.pathname.startsWith("/Service/manage");
  const isEditMode = isFormPage && ServiceId > 0;

  // List state
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(0);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [sortColumn, setSortColumn] = useState(Service_LIST_SORT_COLUMN);
  const [sortColumnDir, setSortColumnDir] = useState(Service_LIST_SORT_DIR);

  // Form state
  const [formLoading, setFormLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit Service" : "Create Service");
  const [formData, setFormData] = useState({
        serviceId: 0,
        serviceName: "",
        defaultPrice: 0,
        description: "",
  });

  // List logic
  const loadServices = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getServicesPages({
        start: 0,
        length: 10,
        sortColumnDir,
      });
      if (response.isSuccess && response.data && response.data.data) {
        setRows(response.data.data);
      } else {
        setRows([]);
        setError(response.message || "Failed to load Services.");
      }
    } catch (err) {
      setError("Error loading Services.");
    }
    setLoading(false);
  };

 useEffect(() => {
    props.setBreadcrumbItems("Service")
  }, [])

  useEffect(() => {
    if (!isFormPage) {
      loadServices();
    }
  }, [isFormPage, sortColumn, sortColumnDir]);

  const handleSortChange = (fieldName) => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName);
    setSortColumn(nextState.sortColumn);
    setSortColumnDir(nextState.sortColumnDir);
  };

  const handleEdit = (id) => {
    navigate(`/Service/manage/${id}`);
  };

  const handleDelete = async (id) => {
    if (await showConfirm("Are you sure you want to delete this Service?")) {
      setDeletingId(id);
      try {
        const response = await deleteServiceById(id);
        if (response.isSuccess) {
          await showSuccess(response.message || "Service deleted successfully.");
          setTimeout(() => loadServices(), 600);
        } else {
          await showError(response.message || "Failed to delete Service.");
        }
      } catch (err) {
        await showError("Error deleting Service.");
      }
      setDeletingId(0);
    }
  };

  const handleAdd = () => {
    navigate("/Service/manage");
  };

  // Form logic
  useEffect(() => {
    if (!isFormPage) return;
    if (!isEditMode) {
      setFormTitle("Create Service");
      setFormData({
        serviceId: 0,
        serviceName: "",
        defaultPrice: 0,
        description: "",
      });
      setFormError("");
      setFormLoading(false);
      return;
    }
    setFormLoading(true);
    setFormError("");
    getServiceById(ServiceId)
      .then((response) => {
        if (response?.isSuccess && response?.data) {
          setFormTitle("Edit Service");
          setFormData(response.data);
        } else {
          setFormError(response?.message || "Failed to load Service");
        }
      })
      .catch((err) => setFormError(err?.message || err || "Failed to load Service"))
      .finally(() => setFormLoading(false));
  }, [isFormPage, isEditMode, ServiceId]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      // Ensure defaultPrice is a number, not a string or empty string
      const payload = {
        ...formData,
        defaultPrice: formData.defaultPrice === "" || formData.defaultPrice === null ? 0 : Number(formData.defaultPrice)
      };
      const response = await saveService(payload);
      console.log("Service save response:", response);
      if (response?.statusCode === 1 || response?.isSuccess) {
        await showSuccess(response?.message || "Saved successfully");
        setTimeout(() => navigate("/Service"), 600);
        return;
      }
      throw new Error(response?.message || "Failed to save Service");
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save Service";
      await showError(errorMessage);
      setFormError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Table data
  //Filed alwasy small case
  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Service Name", field: "serviceName", sort: "asc" },
          { label: "Default Price", field: "defaultPrice", sort: "asc" },
          { label: "Description", field: "description", sort: "asc" },
          { label: "Action", field: "action", sort: "disabled" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map(item => ({
  serviceId: item.serviceId,
  serviceName: item.serviceName || "",
  defaultPrice: item.defaultPrice ?? 0,
  description: item.description || "",
        action: (
          <div className="d-flex gap-2 justify-content-center">
            <Button
              color="link"
              className="p-0 text-primary"
              title="Edit"
              type="button"
              onClick={() => handleEdit(item.serviceId)}
            >
              <i className="mdi mdi-pencil font-size-18" />
            </Button>
            <Button
              color="link"
              className="p-0 text-danger"
              title="Delete"
              type="button"
              disabled={deletingId === item.serviceId}
              onClick={() => handleDelete(item.serviceId)}
            >
              {deletingId === item.serviceId ? (
                <Spinner size="sm" />
              ) : (
                <i className="mdi mdi-trash-can-outline font-size-18" />
              )}
            </Button>
          </div>
        ),
      })),
    });
  }, [rows, sortColumn, sortColumnDir, deletingId]);

  // Render (User-style)
  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          {isFormPage ? (
            formLoading ? (
              <Card>
                <CardBody>
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                </CardBody>
              </Card>
            ) : (
              <ServiceForm
                title={formTitle}
                formError={formError}
                formData={formData}
                isEditMode={isEditMode}
                saving={saving}
                onChange={handleFormChange}
                onSubmit={handleFormSubmit}
                onClose={() => navigate("/Service")}
              />
            )
          ) : (
            <Card>
              <CardBody>
                <div className="d-flex justify-content-end mb-3">
                  <Button color="primary" type="button" onClick={() => navigate("/Service/manage")}> 
                    <i className="mdi mdi-plus me-1" />Add Service
                  </Button>
                </div>
                {error ? <Alert color="danger">{error}</Alert> : null}
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                ) : (
                  <MDBDataTable className="table-auto-sr" striped bordered small noBottomColumns data={data} />
                )}
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </React.Fragment>
  );
}


export default connect(null, { setBreadcrumbItems })(Service);

