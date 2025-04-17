// import React from "react";

// interface AlarmCardProps {
// 	data: any[];
// 	color: string;
// 	onView: () => void;
// }

// const AlarmCard: React.FC<AlarmCardProps> = ({ data, color, onView }) => {
// 	return (
// 		<>
// 			{data.map((item, index) => (
// 				<div className="alarm-card" key={index} style={{ borderColor: color }}>
// 					<div className="alarm-card-header" style={{ backgroundColor: color }}>
// 						<h4>{item.alarmType || "Alarm"}</h4>
// 					</div>
// 					<div className="alarm-card-body">
// 						{Object.keys(item).map((key) => (
// 							<div className="alarm-flexbox" key={key}>
// 								<p className="alarm-key">{key}:</p>
// 								<p className="alarm-value">
// 									{/* Convert boolean values to strings */}
// 									{typeof item[key] === "boolean"
// 										? String(item[key])
// 										: item[key]}
// 								</p>
// 							</div>
// 						))}
// 					</div>
// 					<button
// 						className="view-button"
// 						onClick={onView}
// 						style={{ backgroundColor: color }}
// 					>
// 						VIEW
// 					</button>
// 				</div>
// 			))}
// 		</>
// 	);
// };

// export default AlarmCard;
import React, { useState } from "react";
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

interface AlarmCardProps {
	data: any[];
	color: string;
	onView: () => void;
}

const AlarmCard: React.FC<AlarmCardProps> = ({ data, color, onView }) => {
	// Group data by subtypes
	const groupedData = data.reduce((acc: any, item: any) => {
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
	const currentData = groupedData[currentSubType];

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
			className="alarm-card-container"
			style={{ width: "80%", height: "100%" }}
		>
			<div
				className="alarm-card-header"
				style={{
					backgroundColor: color,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					padding: "10px",
					color: "#fff",
				}}
			>
				<div className="stepper-buttons">
					{subTypes.length > 1 && (
						// <button onClick={handlePrevious}>&lt; Previous</button>
						<IconButton type="arrow-left" onClick={handlePrevious} />
					)}
				</div>
				<h3>{currentSubType || "Alarm"}</h3>
				<div className="stepper-buttons">
					{subTypes.length > 1 && (
						// <button onClick={handleNext}>Next &gt;</button>
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
								<TableCell key={key} style={{ fontWeight: "bold", color }}>
									{key}
								</TableCell>
							))}
							<TableCell style={{ fontWeight: "bold", color }}>
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
											style={{ backgroundColor: color, color: "#fff" }}
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

export default AlarmCard;
