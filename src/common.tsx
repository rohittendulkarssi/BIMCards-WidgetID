export function SelectSystemIcon(HeadData: any[]) {
	var headfinaldata = HeadData.map((obj, i) => {
		let icon: string = "hvac.svg";
		var name: string = obj.SystemID;

		switch (obj.SystemID) {
			case "CENTRAL AIR CONDITIONING SYSTEM":
				icon = "hvac.svg";
				name = "HVAC";
				break;
			case "Central Air Conditioning System":
				icon = "hvac.svg";
				name = "HVAC";
				break;
			case "HVAC":
				icon = "hvac.svg";
				name = "HVAC";
				break;
			case "DCS":
				icon = "dcs.svg";
				name = obj.SystemID;
				break;
			case "Lighting System":
				icon = "street-light.svg";
				name = obj.SystemID;
				break;
			case "WATER DISTRIBUTION SYSTEM":
				icon = "water.svg";
				name = "Water Distribution";
				break;
			case "FIRE PROTECTION AND DETECTION SYSTEM":
				icon = "gripfire.svg";
				name = "Fire Pro. and Det.";
				break;
			case "VERTICAL AND HORIZONTAL TRANSPORTATION SYSTEM":
				icon = "tram.svg";
				name = "Ver. And Hor. Trans.";
				break;
			case "ELECTRICAL SYSTEM":
				icon = "street-light.svg";
				name = "Electrical";
				break;
			case "PUBLIC ADDRESS SYSTEM":
				icon = "address-card.svg";
				name = "Public Address";
				break;
			case "LPG SYSTEM":
				icon = "lpg.png";
				name = "LPG";
				break;
			default:
				break;
		}
		return {
			SystemKey: obj.SystemKey,
			SystemID: obj.SystemID,
			SystemShortName: name,
			SystemIcon: icon,
			FailCount: obj.FailCount,
			MaintainedCount: obj.MaintainedCount,
		};
	});
	return headfinaldata;
}

export function DWYTimeFilter() {
	return [
		{ label: "Today", value: "D" },
		{ label: "This Week", value: "W" },
		{ label: "This Month", value: "M" },
		{ label: "This Year", value: "Y" },
		{ label: "Other", value: "O" },
	];
}

export const BASE_URL = `${window.location.origin}/`;
