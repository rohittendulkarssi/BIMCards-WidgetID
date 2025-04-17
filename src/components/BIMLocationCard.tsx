import React, { useState, useEffect } from "react";
import { TabComponent, WidgetWrapper } from "uxp/components";
import AssetCard from "./AssetCard";
import LocationCard from "./LocationCard";
// import IncidentCard from "./IncidentCard";
import WorkOrderCard from "./WorkOrderCard";
// import AlarmCard from "./AlarmCard";
import { IContextProvider } from "../uxp";
import { IWDDesignModeProps } from "widget-designer/components";
import mockData from "../mockData.json";
import TabElement from "./TabComponent";
import { ConfigCardProvider } from "./ConfigContext";
import TabLocationElement from "./TabLocationComponent";

interface IWidgetProps {
	uxpContext?: IContextProvider;
	instanceId?: string;
	designer?: IWDDesignModeProps;
	uiProps?: any;
	address?: string;
	location?: string;
	onView: () => void;
	AssetCard_SCDetails?: boolean;
	AssetCard_WRDetails?: boolean;
	LocationCard_IMDetails?: boolean;
}

const colorThemes: any = {
	Asset: "#3498db",
	Location: "#2ecc71",
	Incident: "#e74c3c",
	WorkOrder: "#f1c40f",
	Alarm: "#9b59b6",
};

const BIMLocationCardWidget: React.FunctionComponent<IWidgetProps> = (
	props
) => {
	const { AssetCard_WRDetails, AssetCard_SCDetails, LocationCard_IMDetails } = {
		...props,
	};
	const [data, setData] = useState<any>({});
	const [selectedTab, setSelectedTab] = useState<string>("Asset");
	useEffect(() => {
		// Mock API call
		console.log("hello");
		console.log("fetching data...", mockData["Asset"]);
		const fetchData = async () => {
			// Replace with actual API call
			setData(mockData);
		};

		fetchData();
	}, []);

	const renderCard = (dataType: string, data: any[]) => {
		// console.log("dataType", dataType);
		// console.log("data", data);
		if (!data || data.length === 0) {
			return <div>No data available for {dataType}</div>;
		}
		switch (dataType) {
			case "Asset":
				return (
					<AssetCard
						data={data}
						color={colorThemes[dataType]}
						onView={props.onView}
					/>
				);
			case "Location":
				return (
					<LocationCard
						data={data}
						color={colorThemes[dataType]}
						onView={props.onView}
					/>
				);
			// case "Incident":
			// return (
			// 	<IncidentCard
			// 		data={data}
			// 		color={colorThemes[dataType]}
			// 		onView={props.onView}
			// 	/>
			// );
			case "WorkOrder":
				return (
					<WorkOrderCard
						data={data}
						color={colorThemes[dataType]}
						onView={props.onView}
					/>
				);
			// case "Alarm":
			// return (
			// 	<AlarmCard
			// 		data={data}
			// 		color={colorThemes[dataType]}
			// 		onView={props.onView}
			// 	/>
			// );
			default:
				return null;
		}
	};

	// const renderCard = (dataType: string, data: any[]) => {
	// 	if (!data || data.length === 0) {
	// 		return <div>No data available for {dataType}</div>;
	// 	}

	// 	switch (dataType) {
	// 		case "Asset":
	// 			return (
	// 				<AssetCard
	// 					data={data}
	// 					color={colorThemes[dataType]}
	// 					onView={props.onView}
	// 				/>
	// 			);
	// 		case "WorkOrder":
	// 			return (
	// 				<WorkOrderCard
	// 					data={data}
	// 					color={colorThemes[dataType]}
	// 					onView={props.onView}
	// 				/>
	// 			);
	// 		default:
	// 			return null;
	// 	}
	// };
	return (
		<WidgetWrapper className="widget-wrapper">
			{/* <TabComponent
				tabs={[
					{
						id: "Asset",
						label: "Asset",
						content: renderCard("Asset", data["Asset"]),
					},
					{
						id: "WorkOrder",
						label: "Work Orders",
						content: renderCard("WorkOrder", data["WorkOrder"]),
					},
					{
						id: "Location",
						label: "Location",
						content: renderCard("Location", data["Location"]),
					},
					{
						id: "Incident",
						label: "Incident",
						content: renderCard("Incident", data["Incident"]),
					},
				]}
				selected={selectedTab}
				onChangeTab={setSelectedTab}
			/> */}

			{/* {Object.keys(data).map((dataType) => (
				<div key={dataType}>
					<h3 style={{ color: colorThemes[dataType] }}>{dataType} Cards</h3>
					{renderCard(dataType, data[dataType])}
				</div>
			))} */}
			<ConfigCardProvider
				value={{
					AssetCard_SCDetails,
					AssetCard_WRDetails,
					LocationCard_IMDetails,
				}}
			>
				<TabLocationElement
					data={data}
					// cards={["Asset", "WorkOrders"]}
					uxpContext={props.uxpContext}
					// AssetCard_SCDetails={AssetCard_SCDetails}
					// AssetCard_WRDetails={AssetCard_WRDetails}
				/>
			</ConfigCardProvider>
		</WidgetWrapper>
	);
};

export default BIMLocationCardWidget;
