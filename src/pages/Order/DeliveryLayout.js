import React, { useEffect, useState } from "react";
import { Button, Col, Row, Spinner } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { getDeliveryLayoutData } from "../../helpers/fakebackend_helper";
import { showError } from "../../Pop_show/alertService";
import logo from "../../assets/images/ChamperOfimg/HridhayConnect-Logo.png";
import html2pdf from "html2pdf.js";
import { DASHBOARD_NAME } from "../../config";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";

const DeliveryLayout = props => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  const logoColor = '#5a318c';

  useEffect(() => {
    document.title = `Delivery Preview | ${DASHBOARD_NAME}`;
    props.setBreadcrumbItems("");
  }, []);

  useEffect(() => {
    loadDeliveryLayout();
  }, [id]);

  const loadDeliveryLayout = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getDeliveryLayoutData(id);
      if (response?.isSuccess && response?.data) {
        setOrderData(response.data.order || null);
        setOrderItems(response.data.orderItems || []);
      } else {
        setError(response?.message || "Failed to load delivery layout");
      }
    } catch (err) {
      setError(err?.message || "Error loading delivery layout");
      showError(err?.message || "Error loading delivery layout");
    }
    setLoading(false);
  };

  const handleBack = () => {
    navigate("/Order");
  };

const handleDownloadPDF = () => {
  const element = document.getElementById("order-layout-print");

  const options = {
    margin: 0,
    filename: `Delivery-${orderData?.delivery_Challan_No || "layout"}.pdf`,
    image: { type: "jpeg", quality: 1 },

    html2canvas: {
      scale: 2,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    },

    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait"
    },

    pagebreak: {
      mode: ["css"]
    }
  };

  html2pdf().set(options).from(element).save();
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid #5a318c', paddingBottom: '10px' }}>
          <div>
            <img src={logo} alt="Hridhay Connect" style={{ width: '198px', height: '176px' }} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0', color: logoColor }}>Hridhay Connect</h1>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'inline-block', borderBottom: '2px solid #5a318c', paddingBottom: '5px', color: '#333' }}>Delivery Information</h2>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div style={{ width: '48%' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #5a318c', paddingBottom: '4px' }}>Bill To :</div>
                <div style={{ marginBottom: '4px', display: 'flex' }}><strong>{orderData?.customerName}</strong></div>
                <div style={{ marginBottom: '4px', display: 'flex' }}>{orderData?.address}</div>
                 <div style={{ marginBottom: '4px', display: 'flex' }}><span style={{ minWidth: '35px', display: 'inline-block' }}>Phone :</span> {orderData?.phone}</div>
                 <div style={{ marginBottom: '4px', display: 'flex' }}><span style={{ minWidth: '35px', display: 'inline-block' }}>Email :</span> {orderData?.email}</div>
                 {orderData?.gsT_NO && <div style={{ marginBottom: '4px', display: 'flex' }}><span style={{ minWidth: '35px', display: 'inline-block' }}>GST :</span> {orderData.gsT_NO}</div>}
            </div>
            <div style={{ width: '48%' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #5a318c', paddingBottom: '4px' }}>Delivery Details</div>
              <div style={{ marginBottom: '4px', display: 'flex' }}><span style={{ minWidth: '80px', display: 'inline-block' }}><strong>Delivery Challan No :</strong></span> {orderData?.delivery_Challan_No}</div>
              <div style={{ marginBottom: '4px', display: 'flex' }}><span style={{ minWidth: '80px', display: 'inline-block' }}><strong>Delivery Date :</strong></span> {formatDate(orderData?.delivery_Date)}</div>
              <div style={{ marginBottom: '4px', display: 'flex' }}><span style={{ minWidth: '80px', display: 'inline-block' }}><strong>Status :</strong></span>{' '}
                <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', backgroundColor: getStatusColor(orderData?.order_Status), color: 'white' }}>
                  {orderData?.order_Status_Text}
                </span>
              </div>
              <div style={{ marginBottom: '4px', display: 'flex' }}><span style={{ minWidth: '80px', display: 'inline-block' }}><strong>Salesperson :</strong></span> {orderData?.salesPersonName}</div>
            </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
          <thead>
            <tr>
              <th style={{ borderLeft: '1px solid #5a318c', borderRight: '1px solid white', borderTop: '1px solid white', borderBottom: '1px solid white', padding: '6px', backgroundColor: '#5a318c', fontWeight: 'bold', fontSize: '11px', color: 'white' }}>#</th>
              <th style={{ border: '1px solid white', padding: '6px', backgroundColor: '#5a318c', fontWeight: 'bold', fontSize: '11px', color: 'white' }}>Item Name</th>
              <th style={{ border: '1px solid white', padding: '6px', backgroundColor: '#5a318c', fontWeight: 'bold', fontSize: '11px', color: 'white', textAlign: 'center' }}>Quantity</th>
              <th style={{ border: '1px solid white', padding: '6px', backgroundColor: '#5a318c', fontWeight: 'bold', fontSize: '11px', color: 'white', textAlign: 'right' }}>Rate</th>
              <th style={{ borderLeft: '1px solid white', borderRight: '1px solid #5a318c', borderTop: '1px solid white', borderBottom: '1px solid white', padding: '6px', backgroundColor: '#5a318c', fontWeight: 'bold', fontSize: '11px', color: 'white', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #5a318c', padding: '6px', fontSize: '11px' }}>{index + 1}</td>
                <td style={{ border: '1px solid #5a318c', padding: '6px', fontSize: '11px' }}>{item.itemName}</td>
                <td style={{ border: '1px solid #5a318c', padding: '6px', fontSize: '11px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ border: '1px solid #5a318c', padding: '6px', fontSize: '11px', textAlign: 'right' }}>₹{item.rate?.toLocaleString()}</td>
                <td style={{ border: '1px solid #5a318c', padding: '6px', fontSize: '11px', textAlign: 'right' }}>₹{((item.quantity || 0) * (item.rate || 0)).toLocaleString()}</td>
              </tr>
            ))}
            <tr>
              <td className="order-items-total-label" colSpan="4" style={{ border: '1px solid #5a318c', padding: '8px', fontSize: '11px', textAlign: 'right', fontWeight: 'bold' }}>Total Amount</td>
              <td style={{ border: '1px solid #5a318c', padding: '8px', fontSize: '12px', textAlign: 'right', fontWeight: 'bold' }}>₹{orderData?.total_Amount?.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

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

        <div style={{ textAlign: 'right', marginBottom: '10px', marginTop: '15px' }}>
          <span style={{ color: logoColor, fontWeight: 'bold', fontSize: '12px' }}>For Hridhay Connect</span>
        </div>

        <div style={{ textAlign: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #5a318c', color: '#666', fontSize: '11px', marginBottom: '0', paddingBottom: '0' }}>
          <p style={{ margin: '0', paddingBottom: '0' }}>Thank you for your business !</p>
        </div>
      </div>
    </div>
  );
};

export default connect(null, { setBreadcrumbItems })(DeliveryLayout);
