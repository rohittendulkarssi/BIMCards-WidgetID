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
} from "@mui/material";
import { IconButton } from "uxp/components";
import mockData from "../mockData.json"; // Import mockData

interface WorkOrderCardProps {
	data?: any[]; // Optional data prop
	color?: string; // Optional color prop
	onView: () => void;
}

const WorkOrderCard: React.FC<WorkOrderCardProps> = ({
	data,
	color,
	onView,
}) => {
	// State to hold data if not provided via props
	const [localData, setLocalData] = useState<any[]>([]);
	const [localColor, setLocalColor] = useState<string>("#f1c40f"); // Default color

	// Fetch data from mockData if not provided via props
	useEffect(() => {
		if (!data) {
			// Fetch data from mockData
			setLocalData(mockData.WorkOrder || []);
		}
		if (!color) {
			// Set default color if not provided
			setLocalColor("#f1c40f");
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

	return (
		<div
			className="workorder-card-container"
			style={{ width: "80%", height: "100%" }}
		>
			<div
				className="workorder-card-header"
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
				<h3>{currentSubType || "Work Order"}</h3>
				<div className="stepper-buttons">
					{subTypes.length > 1 && (
						<IconButton type="arrow-right" onClick={handleNext} />
					)}
				</div>
			</div>
			<TableContainer
				component={Paper}
				sx={{
					overflowX: "auto", // Enable horizontal scrolling
					maxWidth: "100%", // Ensure it doesn't exceed the container width
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
										<TableCell key={key}>{item[key]}</TableCell>
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
		</div>
	);
};

export default WorkOrderCard;
