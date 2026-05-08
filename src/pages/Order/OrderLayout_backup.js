import React, { useEffect, useState } from "react";
import { Button, Col, Row, Spinner } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderLayoutData } from "../../helpers/fakebackend_helper";
import { showError } from "../../Pop_show/alertService";
import logo from "../../assets/images/ChamperOfimg/HridhayConnect-Logo.png";
import html2pdf from "html2pdf.js";
import { DASHBOARD_NAME } from "../../config";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";

const OrderLayout = props => {
  const navigate = useNavigate();
  const { id, status } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  const logoColor = '#5a318c';

  useEffect(() => {
    document.title = `Order Preview | ${DASHBOARD_NAME}`;
    props.setBreadcrumbItems("");
  }, []);

  useEffect(() => {
    loadOrderLayout();
  }, [id, status]);

  const loadOrderLayout = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getOrderLayoutData(id, status);
      if (response?.isSuccess && response?.data) {
        setOrderData(response.data.order || null);
        setOrderItems(response.data.orderItems || []);
      } else {
        setError(response?.message || "Failed to load order layout");
      }
    } catch (err) {
      setError(err?.message || "Error loading order layout");
      showError(err?.message || "Error loading order layout");
    }
    setLoading(false);
  };

  const handleBack = () => {
    navigate("/Order");
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById("order-layout-print");
    const opt = {
      margin: 0,
      filename: `Order-${orderData?.order_No || 'layout'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: [210, 160], orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all'] }
    };
    html2pdf().set(opt).from(element).save();
  };
    html2pdf().set(opt).from(element).save();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    const day = String(d.getDate()).padStart(2, '0');
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getStatusColor = (status) => {
    const colors = { "1": "#ffc107", "2": "#17a2b8", "4": "#007bff", "5": "#dc3545" };
    return colors[status] || "#6c757d";
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
      <Row className="mb-3">
        <Col className="text-center">
          <div className="d-flex gap-2 justify-content-center">
            <Button color="secondary" onClick={handleBack}>
              <i className="mdi mdi-arrow-left me-1" />
              Back to List
            </Button>
            <Button color="primary" onClick={handleDownloadPDF}>
              <i className="mdi mdi-download me-1" />
              Download PDF
            </Button>
          </div>
        </Col>
      </Row>

      <div id="order-layout-print" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: '1.4', color: '#333', width: '210mm', margin: '0 auto', backgroundColor: 'white', padding: '15mm 15mm 5mm 15mm' }}>
        {/* Header with Logo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
          <div>
            <img src={logo} alt="Hridhay Connect" style={{ width: '120px', height: 'auto' }} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0', color: logoColor }}>Hridhay Connect</h1>
          </div>
        </div>

        {/* Order Information Centered with Underline */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'inline-block', borderBottom: '2px solid #333', paddingBottom: '5px', color: '#333' }}>Order Information</h2>
        </div>

        {/* Order & Customer Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div style={{ width: '48%' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>Bill To:</div>
            <div style={{ marginBottom: '4px' }}><strong>{orderData?.customerName}</strong></div>
            <div style={{ marginBottom: '4px' }}>{orderData?.address}</div>
            <div style={{ marginBottom: '4px' }}>Phone: {orderData?.phone}</div>
            <div style={{ marginBottom: '4px' }}>Email: {orderData?.email}</div>
            {orderData?.gsT_NO && <div style={{ marginBottom: '4px' }}>GST: {orderData.gsT_NO}</div>}
          </div>
          <div style={{ width: '48%', textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>Order Details:</div>
            <div style={{ marginBottom: '4px' }}><strong>Order No:</strong> {orderData?.order_No}</div>
            <div style={{ marginBottom: '4px' }}><strong>Order Date:</strong> {formatDate(orderData?.order_Date)}</div>
            {orderData?.delivery_Date && (
              <div style={{ marginBottom: '4px' }}><strong>Delivery Date:</strong> {formatDate(orderData.delivery_Date)}</div>
            )}
            <div style={{ marginBottom: '4px' }}>
              <strong>Status:</strong>{' '}
              <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', backgroundColor: getStatusColor(orderData?.order_Status), color: 'white' }}>
                {orderData?.order_Status_Text}
              </span>
            </div>
            <div style={{ marginBottom: '4px' }}><strong>Salesperson:</strong> {orderData?.salesPersonName}</div>
          </div>
        </div>

        {/* Items Table with Total */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '6px', backgroundColor: '#f5f5f5', fontWeight: 'bold', fontSize: '11px' }}>#</th>
              <th style={{ border: '1px solid #ddd', padding: '6px', backgroundColor: '#f5f5f5', fontWeight: 'bold', fontSize: '11px' }}>Item Name</th>
              <th style={{ border: '1px solid #ddd', padding: '6px', backgroundColor: '#f5f5f5', fontWeight: 'bold', fontSize: '11px', textAlign: 'center' }}>Quantity</th>
              <th style={{ border: '1px solid #ddd', padding: '6px', backgroundColor: '#f5f5f5', fontWeight: 'bold', fontSize: '11px', textAlign: 'right' }}>Rate</th>
              <th style={{ border: '1px solid #ddd', padding: '6px', backgroundColor: '#f5f5f5', fontWeight: 'bold', fontSize: '11px', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ddd', padding: '6px', fontSize: '11px' }}>{index + 1}</td>
                <td style={{ border: '1px solid #ddd', padding: '6px', fontSize: '11px' }}>{item.itemName}</td>
                <td style={{ border: '1px solid #ddd', padding: '6px', fontSize: '11px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ border: '1px solid #ddd', padding: '6px', fontSize: '11px', textAlign: 'right' }}>â‚¹{item.rate?.toLocaleString()}</td>
                <td style={{ border: '1px solid #ddd', padding: '6px', fontSize: '11px', textAlign: 'right' }}>â‚¹{((item.quantity || 0) * (item.rate || 0)).toLocaleString()}</td>
              </tr>
            ))}
            {/* Total Row inside Table */}
            <tr>
              <td colSpan="4" style={{ border: '1px solid #ddd', padding: '8px', fontSize: '11px', textAlign: 'right', fontWeight: 'bold' }}>Total Amount:</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px', textAlign: 'right', fontWeight: 'bold' }}>â‚¹{orderData?.total_Amount?.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        {/* Notes/Remarks */}
        {(orderData?.notes || orderData?.remarks) && (
          <div style={{ marginTop: '20px' }}>
            {orderData?.notes && (
              <div style={{ marginBottom: '8px' }}>
                <strong>Notes:</strong>
                <p style={{ marginTop: '4px', marginBottom: '0' }}>{orderData.notes}</p>
              </div>
            )}
            {orderData?.remarks && (
              <div style={{ marginBottom: '8px' }}>
                <strong>Remarks:</strong>
                <p style={{ marginTop: '4px', marginBottom: '0' }}>{orderData.remarks}</p>
              </div>
            )}
          </div>
        )}

        {/* For Hridhay Connect - Logo Color */}
        <div style={{ textAlign: 'right', marginBottom: '10px', marginTop: '15px' }}>
          <span style={{ color: logoColor, fontWeight: 'bold', fontSize: '12px' }}>For Hridhay Connect</span>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd', color: '#666', fontSize: '11px', marginBottom: '0', paddingBottom: '0' }}>
          <p style={{ margin: '0', paddingBottom: '0' }}>Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
};

export default connect(null, { setBreadcrumbItems })(OrderLayout);
