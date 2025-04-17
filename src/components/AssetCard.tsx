import React, { useState, useEffect } from "react";
import {
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Typography,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ArrowForward, RemoveRedEye, LocationOn } from "@mui/icons-material";
import mockData from "../mockData.json"; // Import mockData
import { useConfigContext } from "./ConfigContext";

interface AssetCardProps {
	uxpContext?: any;
	cards?: any[];
	data?: any[];
	color?: string;
	onView?: () => void;
}

const AssetCard: React.FC<AssetCardProps> = ({
	data,
	color,
	onView,
	...props
}) => {
	// Default values for AssetCard_SCDetails and AssetCard_WRDetails
	let AssetCard_SCDetails = true;
	let AssetCard_WRDetails = true;

	try {
		const context = useConfigContext();
		AssetCard_SCDetails = context.AssetCard_SCDetails || true;
		AssetCard_WRDetails = context.AssetCard_WRDetails || true;
	} catch (error) {
		console.warn("useConfigContext is not available, using default values.");
	}

	// State to hold data if not provided via props
	const [localData, setLocalData] = useState<any[]>([]);
	const [localColor, setLocalColor] = useState<string>("#3498db"); // Default color

	// Fetch data from mockData if not provided via props
	useEffect(() => {
		if (!data) {
			setLocalData(mockData.Asset || []);
		}
		if (!color) {
			setLocalColor("#3498db");
		}
	}, [data]);

	// Use either the provided data or the local data
	const effectiveData = data || localData;

	// Use either the provided color or the local color
	const effectiveColor = color || localColor;

	// Function to render details
	const renderDetails = (details: any) => {
		return Object.keys(details).map((key) => (
			<div className="asset-flexbox" key={key}>
				<p className="asset-card-key">{key}:</p>
				<p className="asset-value" title={details[key]}>
					{details[key]}
				</p>
			</div>
		));
	};

	// State to toggle the "Create Work Request" section
	const [isWorkRequestOpen, setIsWorkRequestOpen] = useState(false);

	const toggleWorkRequest = () => {
		setIsWorkRequestOpen(!isWorkRequestOpen);
	};

	// Function to handle the "Locate" button action
	const handleLocate = (location: string) => {
		console.log(`Locate action triggered for: ${location}`);
		// Add logic to redirect or locate the item in the BIM file
	};

	return (
		<>
			{effectiveData.map((item, index) => (
				<div
					className="asset-card-bim-card"
					key={index}
					style={{ borderColor: effectiveColor }}
				>
					<div
						className="asset-card-bim-card-header"
						style={{ backgroundColor: effectiveColor }}
					>
						{/* Asset Icon */}
						{item.icon ? (
							<img
								src={item.icon}
								alt="Asset Icon"
								style={{ height: "50px", width: "50px" }}
							/>
						) : (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								height="50"
								viewBox="0 -960 960 960"
								width="50"
								fill="#ffffff"
							>
								<path d="M320-360q84 0 157-32t127-86q54-54 86-127t32-157q0-84-32-157t-86-127q-54-54-127-86T320 360q-84 0-157 32t-127 86q-54 54-86 127T360q0 84 32 157t86 127q54 54 127 86t157 32ZM320-440V-320h240V-440h-80l120-120-40-40-80 80-80-80-40 40 120 120h-80Z" />
							</svg>
						)}
						<h4 style={{ fontSize: "14px", flex: 1 }}>
							{item.name || "Asset"}
						</h4>
						<RemoveRedEye style={{ fontSize: "20px", cursor: "pointer" }} />
					</div>
					<div className="asset-card-bim-card-body">
						{/* Display Asset Details */}
						{Object.keys(item).map((key) =>
							key !== "AssetDetails" &&
							key !== "icon" &&
							key !== "ServiceContract" &&
							key !== "InstalledLocation" &&
							key !== "ServingLocations" ? (
								<div className="asset-flexbox" key={key}>
									<p className="asset-card-key">{key}:</p>
									<p
										className="asset-value"
										title={item[key]}
										style={{ whiteSpace: "normal", wordWrap: "break-word" }}
									>
										{key.includes("Date")
											? item[key]?.substring(0, 10) // Limit date to 10 characters
											: item[key]}
									</p>
								</div>
							) : key === "AssetDetails" ? (
								renderDetails(item[key])
							) : key === "ServiceContract" && AssetCard_SCDetails == true ? (
								<Accordion key={key}>
									<AccordionSummary
										expandIcon={<ExpandMoreIcon />}
										aria-controls={`${key}-content`}
										id={`${key}-header`}
										style={{ backgroundColor: effectiveColor, color: "#fff" }}
									>
										<h4>Service Contract Details</h4>
									</AccordionSummary>
									<AccordionDetails>
										{renderDetails(item[key])}
									</AccordionDetails>
								</Accordion>
							) : null
						)}

						{/* Installed Location */}
						{item.InstalledLocation && (
							<div className="asset-flexbox">
								<p className="asset-card-key">Installed Location:</p>
								<p
									className="asset-value"
									style={{ whiteSpace: "normal", wordWrap: "break-word" }}
								>
									{item.InstalledLocation}
								</p>
							</div>
						)}

						{/* Serving Locations */}
						{item.ServingLocations && item.ServingLocations.length > 0 && (
							<div>
								<h4>Serving Locations:</h4>
								<TableContainer component={Paper}>
									<Table size="small" aria-label="serving locations table">
										<TableBody>
											{item.ServingLocations.map(
												(location: string, idx: number) => (
													<TableRow key={idx}>
														<TableCell>{location}</TableCell>
														<TableCell align="right">
															<Button
																variant="outlined"
																startIcon={<LocationOn />}
																onClick={() => handleLocate(location)}
															>
																Locate
															</Button>
														</TableCell>
													</TableRow>
												)
											)}
										</TableBody>
									</Table>
								</TableContainer>
							</div>
						)}
					</div>

					{/* Create Work Request Section */}
					{AssetCard_WRDetails == true && (
						<div
							className="work-request-section"
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								marginTop: "10px",
							}}
						>
							<p style={{ color: effectiveColor }}>Create Work Request</p>
							<ArrowForward style={{ color: effectiveColor }} />
							{/* <Button
								variant="outlined"
								style={{ color: effectiveColor, borderColor: effectiveColor }}
								onClick={toggleWorkRequest}
							>
								Toggle
							</Button> */}
						</div>
					)}

					{/* Work Request Form */}
					{/* {isWorkRequestOpen && (
						<div className="work-request-form" style={{ marginTop: "10px" }}>
							<p>Work Request Form Placeholder</p>
							<Button
								variant="contained"
								style={{ backgroundColor: effectiveColor, color: "#fff" }}
							>
								Submit
							</Button>
						</div>
					)} */}
				</div>
			))}
		</>
	);
};

export default AssetCard;
