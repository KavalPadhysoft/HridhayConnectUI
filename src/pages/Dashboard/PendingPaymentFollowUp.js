import React, { useEffect, useState, useMemo } from "react";
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact";
import { Eye } from "react-feather";
import { get } from "../../helpers/api_helper";
import { useNavigate } from "react-router-dom";
import { buildServerSortColumns, withAutoSrColumn } from "../../common/common";
import { formatDateDMY } from "../../utils/dateFormat";

const PendingPaymentFollowUp = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState("invoiceDate");
  const [sortDir, setSortDir] = useState("asc");

  const fetchData = async (page, pageSize, sortColumn, sortDir) => {
    setLoading(true);
    setError("");
    try {
      const response = await get(`/Invoice/PendingPayment?start=${page * pageSize}&length=${pageSize}&sortColumnDir=${sortDir}`);
      if (!(response?.isSuccess && response?.statusCode === 1)) {
        throw new Error(response?.message || "Failed to load data");
      }
      setRows(Array.isArray(response?.data?.data) ? response.data.data : []);
      setTotal(response?.data?.recordsTotal || 0);
    } catch (err) {
      setError(err?.message || err || "Failed to load data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page, pageSize, sortColumn, sortDir);
    // eslint-disable-next-line
  }, [page, pageSize, sortColumn, sortDir]);

  const handleSortChange = fieldName => {
    setSortColumn(fieldName);
    setSortDir(sortDir === "asc" ? "desc" : "asc");
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(0);
  };

  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Invoice #", field: "invoiceNumber", sort: "asc" },
          { label: "Client", field: "clientName", sort: "asc" },
          { label: "Invoice Date", field: "invoiceDate", sort: "asc" },
          { label: "Due Date", field: "dueDate", sort: "asc" },
          { label: "Final Amount", field: "finalAmount", sort: "asc" },
          { label: "Status", field: "statusName", sort: "asc" },
          { label: "Action", field: "action", sort: "disabled" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir: sortDir,
      }),
      rows: rows.map(row => ({
        ...row,
        invoiceDate: formatDateDMY(row.invoiceDate),
        dueDate: formatDateDMY(row.dueDate),
        action: (
          <div className="d-flex justify-content-center">
            <Eye
              style={{ cursor: 'pointer', color: '#8f6ed5' }}
              size={20}
              title="View"
              onClick={() => navigate(`/PendingPaymentFollowUp?invoiceId=${row.invoiceId}`)}
            />
          </div>
        ),
      })),
    });
  }, [rows, sortColumn, sortDir, navigate]);
  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
  
            <Card>
              <CardBody>
                
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
         
        </Col>
      </Row>
    </React.Fragment>
  )

};

export default PendingPaymentFollowUp;
