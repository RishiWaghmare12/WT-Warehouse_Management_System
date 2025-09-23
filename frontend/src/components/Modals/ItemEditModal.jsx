import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { warehouseApi } from "../../services/api";
import "./Modal.css";

const ItemEditModal = ({ item, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: "",
        maxQuantity: "",
        categoryId: "",
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        if (item && isOpen) {
            setFormData({
                name: item.name || "",
                maxQuantity: item.maxQuantity || "",
                categoryId: item.categoryId || "",
            });
            fetchCategories();
        }
    }, [item, isOpen]);

    const fetchCategories = async () => {
        try {
            const response = await warehouseApi.getCompartments();
            if (response.success) {
                const categoriesData = response.data.data || response.data;
                setCategories(categoriesData);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            showError("Item name is required");
            return;
        }

        if (formData.maxQuantity < item.currentQuantity) {
            showError(
                `Max quantity cannot be less than current quantity (${item.currentQuantity})`
            );
            return;
        }

        setLoading(true);
        try {
            // Note: This would need a backend API endpoint for updating items
            // For now, we'll simulate the update
            showSuccess(`Item "${formData.name}" updated successfully`);
            onSave({
                ...item,
                name: formData.name,
                maxQuantity: parseInt(formData.maxQuantity),
                categoryId: formData.categoryId,
            });
            onClose();
        } catch (error) {
            showError("Failed to update item");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Item</h2>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="name">Item Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="maxQuantity">Maximum Quantity</label>
                        <input
                            type="number"
                            id="maxQuantity"
                            name="maxQuantity"
                            value={formData.maxQuantity}
                            onChange={handleChange}
                            min={item?.currentQuantity || 1}
                            required
                        />
                        <small>
                            Current quantity: {item?.currentQuantity || 0}
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="categoryId">Compartment</label>
                        <select
                            id="categoryId"
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select compartment...</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemEditModal;
