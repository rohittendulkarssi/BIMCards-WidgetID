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
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	SelectChangeEvent,
	Checkbox,
	Typography,
	Button,
} from "@mui/material";
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

	// Get all subtypes
	const subTypes = Array.from(
		new Set(effectiveData.map((item) => item.SubType || "Unknown"))
	);

	// State to track the selected subtype filter
	const [selectedSubType, setSelectedSubType] = useState("All");

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

	// Handler for subtype filter
	const handleFilterChange = (event: SelectChangeEvent) => {
		setSelectedSubType(event.target.value as string);
		setPage(0); // Reset pagination when filter changes
	};

	// Filter data based on selected subtype
	const filteredData =
		selectedSubType === "All"
			? effectiveData
			: effectiveData.filter((item) => item.SubType === selectedSubType);

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
				<h3>Incident</h3>
				<FormControl variant="outlined" size="small" style={{ minWidth: 150 }}>
					<InputLabel>Filter by SubType</InputLabel>
					<Select
						value={selectedSubType}
						onChange={handleFilterChange}
						label="Filter by SubType"
					>
						<MenuItem value="All">All</MenuItem>
						{subTypes.map((subType) => (
							<MenuItem key={subType} value={subType}>
								{subType}
							</MenuItem>
						))}
					</Select>
				</FormControl>
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
							{Object.keys(effectiveData[0] || {}).map((key) => (
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
						{filteredData
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
					count={filteredData.length}
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
						checked={false}
						onChange={() => {}}
						style={{ color: effectiveColor }}
					/>
				</div>
			)}
		</div>
	);
};

export default IncidentCard;
