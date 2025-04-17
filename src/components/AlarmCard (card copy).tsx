import React from "react";

interface AlarmCardProps {
	data: any[];
	color: string;
	onView: () => void;
}

const AlarmCard: React.FC<AlarmCardProps> = ({ data, color, onView }) => {
	return (
		<>
			{data.map((item, index) => (
				<div className="alarm-card" key={index} style={{ borderColor: color }}>
					<div className="alarm-card-header" style={{ backgroundColor: color }}>
						<h4>{item.alarmType || "Alarm"}</h4>
					</div>
					<div className="alarm-card-body">
						{Object.keys(item).map((key) => (
							<div className="alarm-flexbox" key={key}>
								<p className="alarm-key">{key}:</p>
								<p className="alarm-value">
									{/* Convert boolean values to strings */}
									{typeof item[key] === "boolean"
										? String(item[key])
										: item[key]}
								</p>
							</div>
						))}
					</div>
					<button
						className="view-button"
						onClick={onView}
						style={{ backgroundColor: color }}
					>
						VIEW
					</button>
				</div>
			))}
		</>
	);
};

export default AlarmCard;
