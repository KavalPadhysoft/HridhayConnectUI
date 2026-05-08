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
  const [error, setError] = useState('');
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
    setError('');
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

    // Calculate exact height needed
    const heightInPx = element.scrollHeight;
    const heightInMm = Math.min(Math.ceil(heightInPx * 0.264583) + 10, 160);

    const opt = {
      margin:0,
      filename: `Order-${orderData?.order_No || 'layout'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, height: heightInPx, windowHeight: heightInPx },
      jsPDF: { unit: 'mm', format: [210, heightInMm], orientation: 'portrait' },
    };
    html2pdf().set(opt).from(element).save();
  };
    html2pdf().set(opt).from(element).save();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getStatusColor = (status) => {
    const colors = { '1': '#ffc107', '2': '#17a2b8', '4': '#007bff', '5': '#dc3545' };
    return colors[status] || '#6c757d';
  };

  if (loading) {
