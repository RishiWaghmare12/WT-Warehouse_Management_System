import { useState, useEffect } from "react";
import { useToast } from "../../hooks/useToast";
import { warehouseApi } from "../../services/api";
import "./Modal.css";

const ItemAddModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: "",
        maxQuantity: "100",
        initialQuantity: "0",
        categoryId: "",
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            // Reset form when modal opens
            setFormData({
                name: "",
                maxQuantity: "100",
                initialQuantity: "0",
                categoryId: "",
            });
        }
    }, [isOpen]);

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

        if (!formData.categoryId) {
            showError("Please select a compartment");
            return;
        }

        const maxQty = parseInt(formData.maxQuantity);
        const initialQty = parseInt(formData.initialQuantity);

        if (maxQty <= 0) {
            showError("Maximum quantity must be greater than 0");
            return;
        }

        if (initialQty < 0) {
            showError("Initial quantity cannot be negative");
            return;
        }

        if (initialQty > maxQty) {
            showError("Initial quantity cannot exceed maximum quantity");
            return;
        }

        setLoading(true);
        try {
            const response = await warehouseApi.createItem({
                name: formData.name.trim(),
                categoryId: formData.categoryId,
                maxQuantity: maxQty,
                initialQuantity: initialQty,
            });

            if (response.success) {
                showSuccess(`Item "${formData.name}" created successfully`);
                onAdd(response.data.data || response.data);
                onClose();
            } else {
                showError(response.error || "Failed to create item");
            }
        } catch {
            showError("Failed to create item");
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
                    <h2>Add New Item</h2>
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
                            placeholder="Enter item name"
                            required
                        />
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

                    <div className="form-group">
                        <label htmlFor="maxQuantity">Maximum Quantity</label>
                        <input
                            type="number"
                            id="maxQuantity"
                            name="maxQuantity"
                            value={formData.maxQuantity}
                            onChange={handleChange}
                            min="1"
                            required
                        />
                        <small>Maximum capacity for this item</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="initialQuantity">Initial Quantity</label>
                        <input
                            type="number"
                            id="initialQuantity"
                            name="initialQuantity"
                            value={formData.initialQuantity}
                            onChange={handleChange}
                            min="0"
                            max={formData.maxQuantity}
                            required
                        />
                        <small>Starting quantity (optional, defaults to 0)</small>
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
                            {loading ? "Creating..." : "Create Item"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemAddModal;
