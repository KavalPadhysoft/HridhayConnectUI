import React, { useEffect, useState, useMemo } from "react";
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact";
import { Eye, DollarSign, PlusSquare } from "react-feather";

import { IndianRupee } from "lucide-react";
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
          { label: "Invoice No.", field: "invoiceNumber", sort: "asc" },
          { label: "Client", field: "clientName", sort: "asc" },
          { label: "Invoice Date", field: "invoiceDate", sort: "asc" },
          { label: "Due Date", field: "dueDate", sort: "asc" },
          { label: "Invoice Amount", field: "finalAmount", sort: "asc" },
          { label: "Advance Amount", field: "advanceAmount", sort: "asc" },
          { label: "Remaining Amount", field: "remainingAmount", sort: "asc" },
          { label: "Pending Amount", field: "pendingAmount", sort: "asc" },
         // { label: "Status", field: "statusName", sort: "asc" },
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
          <div className="d-flex justify-content-center gap-2">
            {/* <Eye
              style={{ cursor: 'pointer', color: '#8f6ed5' }}
              size={20}
              title="View"
              onClick={() => navigate(`/PendingPaymentFollowUp?invoiceId=${row.invoiceId}`)}
            /> */}
             <Eye
                         // style={{ cursor: 'pointer', color: '#8f6ed5' }}
                           style={{ cursor: 'pointer', color: '#8f6ed5', marginTop: '3px' }}
                          size={20}
                          title="View"
                          onClick={() => navigate(`/PaymentFollowUp?invoiceId=${row.invoiceId}`)}
                        />
            {(!row.remainingAmount || row.remainingAmount === 0) ? (
              <Button
                color="primary"
                size="sm"
                title="Add Payment"
                onClick={() => navigate(`/PendingPaymentFollowUp/AddPayment?invoiceId=${row.invoiceId}&clientId=${row.clientId}&pendingAmount=${row.pendingAmount}`)}
              >
                <PlusSquare size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />Add Payment
              </Button>
            ) : (
              <Button
                color="warning"
                size="sm"
                title="Adjust Advance Payment"
               onClick={() => navigate(`/PendingPaymentFollowUp/AdjustAdvance?invoiceId=${row.invoiceId}&clientId=${row.clientId}&pendingAmount=${row.pendingAmount}&advance_ID=${row.advance_ID} `)}
              >
               <IndianRupee size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />Advance
              </Button>
            )}
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
                <h5 >
        Pending Payment
    </h5>
                    {/* <h4 style={{ 
      marginBottom: "15px", 
      fontWeight: "600",
      color: "#2f4b6e"
    }}>
      Pending Payment
    </h4> */}
                {error ? <Alert color="danger">{error}</Alert> : null}
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                ) : (
<MDBDataTable
  className={rows && rows.length > 0 ? "table-auto-sr" : undefined}
  striped
  bordered
  small
  noBottomColumns
  data={data}
  noRecordsFoundLabel={
    <span style={{
      display: 'block',
      textAlign: 'center',
      fontWeight: 'bold',
      color: '#888'
    }}>
      You don't have any record
    </span>
  }
/>
                )}
              </CardBody>
            </Card>
         
        </Col>
      </Row>
    </React.Fragment>
  )

};

export default PendingPaymentFollowUp;
