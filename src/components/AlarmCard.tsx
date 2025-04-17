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
} from "@mui/material";
import mockData from "../mockData.json"; // Import mockData

interface AlarmCardProps {
	data?: any[]; // Optional data prop
	color?: string; // Optional color prop
	onView: () => void;
}

const AlarmCard: React.FC<AlarmCardProps> = ({ data, color, onView }) => {
	// State to hold data if not provided via props
	const [localData, setLocalData] = useState<any[]>([]);
	const [localColor, setLocalColor] = useState<string>("#9b59b6"); // Default color

	// Fetch data from mockData if not provided via props
	useEffect(() => {
		if (!data) {
			// Fetch data from mockData
			setLocalData(mockData.Alarm || []);
		}
		if (!color) {
			// Set default color if not provided
			setLocalColor("#9b59b6");
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
			className="alarm-card-container"
			style={{ width: "80%", height: "100%" }}
		>
			<div
				className="alarm-card-header"
				style={{
					backgroundColor: effectiveColor,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					padding: "10px",
					color: "#fff",
				}}
			>
				<h3>Alarm</h3>
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
		</div>
	);
};

export default AlarmCard;
