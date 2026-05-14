import React, { useEffect, useMemo, useState } from "react"
import { DASHBOARD_NAME } from "../../config"
import { Alert, Button, Card, CardBody, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common"

import { setBreadcrumbItems } from "../../store/actions"
import { deleteItemById, getItemById, getItemsPages, getCategoryList, getUnitList, getPackagingTypeList, saveItem } from "../../helpers/fakebackend_helper"
import { get } from "../../helpers/api_helper"
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService"
import ItemForm from "./ItemForm"

const ITEM_LIST_SORT_COLUMN = "itemName"
const ITEM_LIST_SORT_DIR = "asc"

const Items = props => {
  document.title = `Item | ${DASHBOARD_NAME}`
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const itemId = Number(params.id || 0)
  const isFormPage = location.pathname.startsWith("/Item/manage")
  const isEditMode = isFormPage && itemId > 0

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(0)
  const [error, setError] = useState("")
  const [formError, setFormError] = useState("")
   const [categoryOptions, setCategoryOptions] = useState([])
   const [unitOptions, setUnitOptions] = useState([])
   const [packagingTypeOptions, setPackagingTypeOptions] = useState([])
   const [rows, setRows] = useState([])
  const [sortColumn, setSortColumn] = useState(ITEM_LIST_SORT_COLUMN)
  const [sortColumnDir, setSortColumnDir] = useState(ITEM_LIST_SORT_DIR)
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit Item" : "Create Item")
   const [formData, setFormData] = useState({
     id: 0,
     categoryId: 0,
     itemName: "",
     unit: "",
     hsnCode: "",
     taxPercent: 0,
     description: "",
     rate: 0,
     mrp: 0,
     isAvailableForSale: false,
     isActive: true,
     isDeleted: false,
     category_Name: "",
     unit_Text: "",
     packagingType: "",
   })

  const breadcrumbItems = [
    { title: "Lexa", link: "#" },
    { title: "Item", link: "#" },
  ]

  const loadItems = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await getItemsPages({
        start: 0,
        length: 10,
        sortColumn,
        sortColumnDir,
      })

      if (!(response?.isSuccess && response?.statusCode === 1)) {
        throw new Error(response?.message || "Failed to load items")
      }

      const list = response?.data?.data || []
      setRows(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err?.message || err || "Failed to load items")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    props.setBreadcrumbItems("Item")
  }, [])

  useEffect(() => {
    if (!isFormPage) {
      loadItems()
    }
  }, [isFormPage, sortColumn, sortColumnDir])

  // Reset form when switching from edit to create mode
  useEffect(() => {
    if (!isEditMode && isFormPage) {
      setFormTitle("Create Item")
       setFormData({
         id: 0,
         categoryId: 0,
         itemName: "",
         unit: "",
         hsnCode: "",
         taxPercent: 0,
         description: "",
         rate: 0,
         mrp: 0,
         isAvailableForSale: false,
         isActive: true,
         isDeleted: false,
         category_Name: "",
         unit_Text: "",
         packagingType: "",
       })
    }
  }, [isFormPage, isEditMode])

   // Load form data (dropdowns) and item data for edit mode or reset for create mode
   useEffect(() => {
     const loadData = async () => {
       if (!isFormPage) {
         return
       }

       console.log("loadData called, isFormPage:", isFormPage)
       setFormError("")

       try {
         const [categoryRes, unitRes, packagingTypeRes] = await Promise.all([
           getCategoryList(),
           getUnitList(),
           getPackagingTypeList()
         ])

         console.log("Category API Response:", categoryRes)
         console.log("Unit API Response:", unitRes)
         console.log("PackagingType API Response:", packagingTypeRes)

         // Handle Category response - check different possible response structures
         if (categoryRes?.isSuccess && categoryRes?.statusCode === 1) {
           const catData = categoryRes?.data || []
           console.log("Setting categoryOptions:", catData)
           setCategoryOptions(catData)
         } else if (categoryRes?.data) {
           const catData = categoryRes.data || []
           console.log("Setting categoryOptions (alt):", catData)
           setCategoryOptions(catData)
         } else if (Array.isArray(categoryRes)) {
           console.log("Setting categoryOptions (array):", categoryRes)
           setCategoryOptions(categoryRes)
         } else {
           console.error("Unexpected Category API response structure:", categoryRes)
           setFormError("Failed to load categories: Unexpected response format")
         }

         // Handle Unit response - check different possible response structures
         if (unitRes?.isSuccess && unitRes?.statusCode === 1) {
           const unitData = unitRes?.data || []
           console.log("Setting unitOptions:", unitData)
           setUnitOptions(unitData)
         } else if (unitRes?.data) {
           const unitData = unitRes.data || []
           console.log("Setting unitOptions (alt):", unitData)
           setUnitOptions(unitData)
         } else if (Array.isArray(unitRes)) {
           console.log("Setting unitOptions (array):", unitRes)
           setUnitOptions(unitRes)
         } else {
           console.error("Unexpected Unit API response structure:", unitRes)
           setFormError("Failed to load units: Unexpected response format")
         }

         // Handle PackagingType response
         if (packagingTypeRes?.isSuccess && packagingTypeRes?.statusCode === 1) {
           const packagingTypeData = packagingTypeRes?.data || []
           console.log("Setting packagingTypeOptions:", packagingTypeData)
           setPackagingTypeOptions(packagingTypeData)
         } else if (packagingTypeRes?.data) {
           const packagingTypeData = packagingTypeRes.data || []
           console.log("Setting packagingTypeOptions (alt):", packagingTypeData)
           setPackagingTypeOptions(packagingTypeData)
         } else if (Array.isArray(packagingTypeRes)) {
           console.log("Setting packagingTypeOptions (array):", packagingTypeRes)
           setPackagingTypeOptions(packagingTypeRes)
         } else {
           console.error("Unexpected PackagingType API response structure:", packagingTypeRes)
           setFormError("Failed to load packaging types: Unexpected response format")
         }

         if (!isEditMode) {
           setFormTitle("Create Item")
           setFormData({
             id: 0,
             categoryId: 0,
             itemName: "",
             unit: "",
             hsnCode: "",
             taxPercent: 0,
             description: "",
             rate: 0,
             mrp: 0,
             isAvailableForSale: false,
             isActive: true,
             isDeleted: false,
             category_Name: "",
             unit_Text: "",
             packagingType: "",
           })
           return
         }

         setLoading(true)
         const response = await getItemById(itemId)
         if (!(response?.isSuccess && response?.statusCode === 1)) {
           throw new Error(response?.message || "Failed to load item")
         }

         const item = response?.data || {}
         setFormTitle("Edit Item")
         setFormData({
           id: item.id || 0,
           categoryId: item.categoryId || 0,
           itemName: item.itemName || "",
           unit: item.unit || "",
           hsnCode: item.hsnCode || "",
           taxPercent: item.taxPercent || 0,
           description: item.description || "",
           rate: item.rate || 0,
           mrp: item.mrp || 0,
           isAvailableForSale: Boolean(item.isAvailableForSale),
           isActive: Boolean(item.isActive),
           isDeleted: Boolean(item.isDeleted),
           category_Name: item.category_Name || "",
           unit_Text: item.unit_Text || "",
           packagingType: item.packagingType || "",
         })
       } catch (err) {
         setFormError(err?.message || err || "Failed to load data")
       } finally {
         setLoading(false)
       }
     }

     loadData()
   }, [isFormPage, isEditMode, itemId])

  const handleSortChange = fieldName => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName)
    setSortColumn(nextState.sortColumn)
    setSortColumnDir(nextState.sortColumnDir)
  }

  const data = useMemo(() => {
       return withAutoSrColumn({
         columns: buildServerSortColumns({
           columns: [
             { label: "Item Name", field: "itemName", sort: "asc" },
             { label: "Category Name", field: "category_Name", sort: "asc" },
             { label: "Unit", field: "unit_Text", sort: "asc" },
             { label: "Rate", field: "rate", sort: "asc" },
             { label: "Action", field: "action", sort: "disabled" },
           ],
           onSort: handleSortChange,
           activeSortColumn: sortColumn,
           sortColumnDir,
         }),
         rows: rows.map(item => ({
           id: item.id,
           itemName: `${item.itemName || ""}(${item.packagingType_Text || ""})`,
           category_Name: item.category_Name || "",
           unit_Text: item.unit_Text || "",
           rate: item.rate || 0,
           action: (
             <div className="d-flex gap-2 justify-content-center">
               <Button
                 color="link"
                 className="p-0 text-primary"
                 title="Edit"
                 type="button"
                 onClick={() => navigate(`/Item/manage/${item.id}`)}
               >
                 <i className="mdi mdi-pencil font-size-18" />
               </Button>
               <Button
                 color="link"
                 className="p-0 text-danger"
                 title="Delete"
                 type="button"
                 disabled={deletingId === item.id}
                 onClick={() => handleDelete(item.id)}
               >
                 {deletingId === item.id ? (
                   <Spinner size="sm" />
                 ) : (
                   <i className="mdi mdi-trash-can-outline font-size-18" />
                 )}
               </Button>
             </div>
           ),
         })),
       })
  }, [rows, sortColumn, sortColumnDir])

  const handleChange = event => {
    const { name, value, type, checked } = event.target
    setFormData(previous => ({
      ...previous,
      [name]: type === "checkbox" || type === "switch" ? checked : value,
    }))
  }

  const handleCategoryChange = option => {
    setFormData(previous => ({
      ...previous,
      categoryId: option?.value ?? 0,
    }))
  }

   const handleUnitChange = option => {
     setFormData(previous => ({
       ...previous,
       unit: option?.value ?? "",
     }))
   }

   const handlePackagingTypeChange = option => {
     setFormData(previous => ({
       ...previous,
       packagingType: option?.value ?? "",
     }))
   }

  const handleDelete = async id => {
    const isConfirmed = await showConfirm("Are you sure you want to delete this item?", "Delete", "Cancel")
    if (!isConfirmed) {
      return
    }

    setDeletingId(id)
    try {
      const response = await deleteItemById(id)
      if (response?.statusCode === 1) {
        await showSuccess(response?.message || "Item deleted successfully")
        await loadItems()
        return
      }

      throw new Error(response?.message || "Failed to delete item")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to delete item"
      await showError(errorMessage)
    } finally {
      setDeletingId(0)
    }
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setFormError("")
    setSaving(true)

     try {
       const payload = {
         itemName: formData.itemName,
         categoryId: Number(formData.categoryId) || 0,
         unit: formData.unit || null,
         hsnCode: formData.hsnCode || null,
         taxPercent: Number(formData.taxPercent) || 0,
         description: formData.description || null,
         rate: Number(formData.rate) || 0,
         mrp: Number(formData.mrp) || 0,
         isAvailableForSale: formData.isAvailableForSale,
         isActive: formData.isActive,
         packagingType: formData.packagingType || null,
       }

      if (isEditMode) {
        payload.id = Number(formData.id) || itemId
      }

      const response = await saveItem(payload)
      if (response?.statusCode === 1) {
        await showSuccess(response?.message || "Item saved successfully")
        navigate("/Item")
        return
      }

      throw new Error(response?.message || "Failed to save item")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save item"
      await showError(errorMessage)
      setFormError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (isFormPage) {
     return (
       <ItemForm
         title={formTitle}
         formData={formData}
         categoryOptions={categoryOptions}
         unitOptions={unitOptions}
         packagingTypeOptions={packagingTypeOptions}
         isEditMode={isEditMode}
         saving={saving}
         formError={formError}
         onChange={handleChange}
         onCategoryChange={handleCategoryChange}
         onUnitChange={handleUnitChange}
         onPackagingTypeChange={handlePackagingTypeChange}
         onSubmit={handleSubmit}
         onClose={() => navigate("/Item")}
       />
     )
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-end mb-3">
          <Button color="primary" type="button" onClick={() => navigate("/Item/manage")}>
            <i className="mdi mdi-plus me-1" />Add Item
          </Button>
        </div>
        {error ? <Alert color="danger">{error}</Alert> : null}
         {loading ? (
           <div className="text-center py-5">
             <Spinner color="primary" />
           </div>
         ) : (
           <>
             <MDBDataTable className="table-auto-sr" striped bordered small noBottomColumns data={data} />
           </>
         )}
      </CardBody>
    </Card>
  )
}

export default connect(null, { setBreadcrumbItems })(Items)
