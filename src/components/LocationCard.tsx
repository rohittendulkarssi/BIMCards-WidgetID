import { Button, Checkbox, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useConfigContext } from "./ConfigContext";
import mockData from "../mockData.json"; // Import mockData
import { ArrowForward } from "@mui/icons-material";

interface LocationCardProps {
	data?: any[]; // Optional data prop
	color: string;
	onView: () => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ data, color, onView }) => {
	// Try to access the context, but handle cases where it is not available
	let LocationCard_IMDetails = true;

	try {
		const context = useConfigContext();
		LocationCard_IMDetails = context.LocationCard_IMDetails || true;
	} catch (error) {
		// Context is not available, fallback to default values
		console.warn("useConfigContext is not available, using default values.");
	}

	// State to hold data if not provided via props
	const [localData, setLocalData] = useState<any[]>([]);
	const [localColor, setLocalColor] = useState<string>("#2ecc71"); // Default color

	// Fetch data from mockData if not provided via props
	useEffect(() => {
		if (!data) {
			// Fetch data from mockData
			setLocalData(mockData.Location || []);
		}
		if (!color) {
			// Set default color if not provided
			setLocalColor("#2ecc71");
		}
	}, [data, color]);

	// Use either the provided data or the local data
	const effectiveData = data || localData;
	// Use either the provided color or the local color
	const effectiveColor = color || localColor;

	// State to toggle the "Create Incident" section
	const [isIncidentOpen, setIsIncidentOpen] = useState(false);

	const toggleIncident = (event: React.ChangeEvent<HTMLInputElement>) => {
		setIsIncidentOpen(event.target.checked);
	};

	return (
		<>
			{effectiveData.map((item, index) => (
				<div
					className="location-card"
					key={index}
					style={{ borderColor: effectiveColor }}
				>
					<div
						className="location-card-header"
						style={{ backgroundColor: effectiveColor }}
					>
						<h4>{item.name || "Location"}</h4>
					</div>
					<div className="location-card-body">
						{Object.keys(item).map((key) => (
							<div className="location-flexbox" key={key}>
								<p className="location-key">{key}:</p>
								<p className="location-value" title={item[key]}>
									{item[key]}
								</p>
							</div>
						))}
					</div>

					{/* Create Incident Section */}
					{LocationCard_IMDetails && (
						<div
							className="create-incident-section"
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								marginTop: "10px",
							}}
						>
							{/* <Typography style={{ fontWeight: "bold", color: effectiveColor }}>
								Create Incident
							</Typography>
							<Checkbox
								checked={isIncidentOpen}
								onChange={toggleIncident}
								style={{ color }}
							/> */}
							<p style={{ color: effectiveColor }}> Create Incident </p>
							<ArrowForward style={{ color: effectiveColor }} />
						</div>
					)}
					{isIncidentOpen && (
						<div className="incident-form" style={{ marginTop: "10px" }}>
							{/* Add your form fields here */}
							<p>Incident Form Placeholder</p>
							<Button
								variant="contained"
								style={{ backgroundColor: effectiveColor, color: "#fff" }}
							>
								Submit
							</Button>
						</div>
					)}

					<button
						className="view-button"
						onClick={onView}
						style={{ backgroundColor: effectiveColor }}
					>
						VIEW
					</button>
				</div>
			))}
		</>
	);
};

export default LocationCard;
