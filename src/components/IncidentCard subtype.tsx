import React, { useState, useEffect } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination,
	Paper,
	Checkbox,
	Typography,
	Button,
} from "@mui/material";
import { IconButton } from "uxp/components";
import { useConfigContext } from "./ConfigContext";
import mockData from "../mockData.json"; // Import mockData

interface IncidentCardProps {
	data?: any[]; // Optional data prop
	color?: string; // Optional color prop
	onView: () => void;
}

const IncidentCard: React.FC<IncidentCardProps> = ({ data, color, onView }) => {
	// Try to access the context, but handle cases where it is not available
	let IncidentCard_IMDetails = false;

	try {
		const context = useConfigContext();
		// IncidentCard_IMDetails = context.IncidentCard_IMDetails || false;
	} catch (error) {
		// Context is not available, fallback to default values
		console.warn("useConfigContext is not available, using default values.");
	}

	// State to hold data if not provided via props
	const [localData, setLocalData] = useState<any[]>([]);
	const [localColor, setLocalColor] = useState<string>("#e74c3c"); // Default color

	// Fetch data from mockData if not provided via props
	useEffect(() => {
		if (!data) {
			// Fetch data from mockData
			setLocalData(mockData.Incident || []);
		}
		if (!color) {
			// Set default color if not provided
			setLocalColor("#e74c3c");
		}
	}, [data, color]);

	// Use either the provided data or the local data
	const effectiveData = data || localData;

	// Use either the provided color or the local color
	const effectiveColor = color || localColor;

	// Group data by subtypes
	const groupedData = effectiveData.reduce((acc: any, item: any) => {
		const subType = item.SubType || "Unknown";
		if (!acc[subType]) {
			acc[subType] = [];
		}
		acc[subType].push(item);
		return acc;
	}, {});

	// Get all subtypes
	const subTypes = Object.keys(groupedData);

	// State to track the current subtype
	const [currentSubTypeIndex, setCurrentSubTypeIndex] = useState(0);

	// Get the current subtype and its data
	const currentSubType = subTypes[currentSubTypeIndex];
	const currentData = groupedData[currentSubType] || [];

	// Pagination state
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	// Handlers for pagination
	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	// Handlers for navigation between subtypes
	const handleNext = () => {
		setCurrentSubTypeIndex((prev) => (prev + 1) % subTypes.length);
		setPage(0); // Reset pagination when switching subtypes
	};

	const handlePrevious = () => {
		setCurrentSubTypeIndex(
			(prev) => (prev - 1 + subTypes.length) % subTypes.length
		);
		setPage(0); // Reset pagination when switching subtypes
	};

	// State to toggle the "Create Incident" section
	const [isIncidentOpen, setIsIncidentOpen] = useState(false);

	const toggleIncident = (event: React.ChangeEvent<HTMLInputElement>) => {
		setIsIncidentOpen(event.target.checked);
	};

	return (
		<div
			className="incident-card-container"
			style={{ width: "80%", height: "100%" }}
		>
			<div
				className="incident-card-header"
				style={{
					backgroundColor: effectiveColor,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					padding: "10px",
					color: "#fff",
				}}
			>
				<div className="stepper-buttons">
					{subTypes.length > 1 && (
						<IconButton type="arrow-left" onClick={handlePrevious} />
					)}
				</div>
				<h3>{currentSubType || "Incident"}</h3>
				<div className="stepper-buttons">
					{subTypes.length > 1 && (
						<IconButton type="arrow-right" onClick={handleNext} />
					)}
				</div>
			</div>
			<TableContainer
				component={Paper}
				sx={{
					overflowX: "auto",
					maxWidth: "100%",
					flexGrow: 1,
				}}
			>
				<Table stickyHeader>
					<TableHead>
						<TableRow>
							{Object.keys(currentData[0] || {}).map((key) => (
								<TableCell
									key={key}
									style={{ fontWeight: "bold", color: effectiveColor }}
								>
									{key}
								</TableCell>
							))}
							<TableCell style={{ fontWeight: "bold", color: effectiveColor }}>
								Actions
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{currentData
							.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
							.map((item: any, index: number) => (
								<TableRow key={index}>
									{Object.keys(item).map((key) => (
										<TableCell key={key}>
											{typeof item[key] === "boolean"
												? String(item[key])
												: item[key]}
										</TableCell>
									))}
									<TableCell>
										<button
											className="view-button"
											onClick={onView}
											style={{ backgroundColor: effectiveColor, color: "#fff" }}
										>
											VIEW
										</button>
									</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
				<TablePagination
					rowsPerPageOptions={[5, 10, 25]}
					component="div"
					count={currentData.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			</TableContainer>

			{/* Create Incident Section */}
			{IncidentCard_IMDetails && (
				<div
					className="create-incident-section"
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						marginTop: "10px",
					}}
				>
					<Typography style={{ fontWeight: "bold", color: effectiveColor }}>
						Create Incident
					</Typography>
					<Checkbox
						checked={isIncidentOpen}
						onChange={toggleIncident}
						style={{ color: effectiveColor }}
					/>
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
		</div>
	);
};

export default IncidentCard;
