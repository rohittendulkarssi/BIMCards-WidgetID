import * as React from "react";
import Box from "@mui/material/Box";
import { Tab, Tabs } from "@mui/material";
// import Tab from "@mui/material/Tab";
// import Tabs from "@mui/material/Tabs";
import TabPanel from "@mui/lab/TabPanel";
import TabContext from "@mui/lab/TabContext";
import { IContextProvider } from "../uxp";
import AssetCard from "./AssetCard";
import LocationCard from "./LocationCard";
import IncidentCard from "./IncidentCard";
import WorkOrderCard from "./WorkOrderCard";
import AlarmCard from "./AlarmCard";
// import DynamicCards from "./DynamicCards";
// import { IContextProvider } from "../uxp";
// import BuildingOverviewCard from "./BuildingOverviewCard";
// import TabElementSearchBox from "./TabElementSearchBox";
// import LocationViewportMapConfig from "./LocationViewportMapConfig";

interface ICardsProps {
	uxpContext: IContextProvider;
	cards?: any[];
	bindingInfo?: any;
	data?: any;
	onView?: () => void;
	AssetCard_SCDetails?: boolean;
	AssetCard_WRDetails?: boolean;
}

interface IWidgetProps {
	onView?: () => void;
	AssetCard_SCDetails?: boolean;
	AssetCard_WRDetails?: boolean;
	id: string;
	key: string;
	isTemplate: boolean;
	sourceUrl: string;
	templateType?: string;
	templateKey?: string;
	templateId?: string;
	props?: any;
	name: string;
	widget: any;
	configs: any;
	defaultProps?: any;
}

const colorThemes: any = {
	Asset: "#3498db",
	Location: "#2ecc71",
	Incident: "#e74c3c",
	WorkOrder: "#f1c40f",
	Alarm: "#9b59b6",
};

interface activateWidgets {
	objectType: string;
	widgetId: string;
}

const TabLocationElement: React.FunctionComponent<ICardsProps> = (props) => {
	const {
		cards,
		uxpContext,
		bindingInfo,
		data,
		AssetCard_SCDetails,
		AssetCard_WRDetails,
	} = { ...props };
	const [value, setValue] = React.useState("1");
	let [widgets, setWidgets] = React.useState<any[]>([]);
	const [mockLocationConfigData, setMockLocationConfigData] = React.useState<
		any[]
	>([]); // State to hold mockData

	const [scriptsLoaded, setScriptsLoaded] = React.useState<boolean>(false);
	const [activeWidget, setActiveWidget] = React.useState<activateWidgets[]>([]);

	function tryParseJSON(x: string, def: any = null) {
		try {
			return JSON.parse(x);
		} catch {
			return def;
		}
	}

	const loadModuleScript = async () => {
		try {
			await Promise.all([loadScript("a027351c-cf1d-4c3a-c9f4-75727935dd34")]);
			console.log("All scripts loaded successfully");
			setScriptsLoaded(true);
		} catch (error) {
			console.error("Error loading scripts:", error);
		}
	};

	React.useEffect(() => {
		const mockData = [
			{
				objectType: "Location",
				widgetId:
					"a027351c-cf1d-4c3a-c9f4-75727935dd34/widget/sbimcard_locationcard",
				widgetParams: { createIncidents: true },
			},
			{
				objectType: "Incident",
				widgetId:
					"a027351c-cf1d-4c3a-c9f4-75727935dd34/widget/sbimcard_incidentcard",
				widgetParams: null,
			},
			{
				objectType: "Alarm",
				widgetId:
					"a027351c-cf1d-4c3a-c9f4-75727935dd34/widget/sbimcard_alarmcard",
				widgetParams: null,
			},
		];

		setMockLocationConfigData(mockData); // Set the mock data in state
		// const widgetsToBeActivated =
		// 			event?.detail?.elementInfo?.bindingsList.map((ele: any) => {
		// 				return {
		// 					dbId: ele.dbId,
		// 					elementID: ele.elementID,
		// 					elementKey: ele.elementKey,
		// 					position: ele.position,
		// 					objectType: ele.objectType,
		// 					widgetId: findWidgetId(ele.objectType),
		// 				};
		// 			});
		// 		setActiveWidget(widgetsToBeActivated);
	}, []);

	React.useEffect(() => {
		loadModuleScript();
	}, []);

	React.useEffect(() => {
		if (scriptsLoaded) {
			getAllWidgets();
		}
	}, [scriptsLoaded]);

	React.useEffect(() => {
		if (mockLocationConfigData.length > 0) {
			const widgetsToBeActivated = mockLocationConfigData.map((ele: any) => {
				return {
					objectType: ele.objectType,
					widgetId: ele.widgetId,
				};
			});
			setActiveWidget(widgetsToBeActivated);
		}
		console.log("Active widget:", activeWidget);
	}, [mockLocationConfigData]);

	function getAllWidgets() {
		props.uxpContext
			?.executeService(
				"UXP",
				"GetWidgets",
				{ pageNumber: 0, max: 100000 },
				{ json: true }
			)
			.then((res: any) => {
				let data = res[0];
				let widgets = tryParseJSON(data.widgets, []);
				console.log("Fetched widgets:", widgets);
				let widgetIds = [
					"a027351c-cf1d-4c3a-c9f4-75727935dd34/widget/sbimcard_locationcard",
					"a027351c-cf1d-4c3a-c9f4-75727935dd34/widget/sbimcard_incidentcard",
					"a027351c-cf1d-4c3a-c9f4-75727935dd34/widget/sbimcard_alarmcard",
					// "a027351c-cf1d-4c3a-c9f4-75727935cc34/widget/workordercard",
				];

				let updatedWidgets: IWidgetProps[] = widgets
					.filter((w: any) => widgetIds.includes(w.id))
					.map((w: any) => {
						let templateId = null;
						if (w.isTemplate && w.isDefaultTemplate) {
							templateId = w.props.__template__.id;
						}
						return {
							name: w.name,
							id: w.id,
							sourceUrl: w.sourceUrl,
							key: `${w.id}###${w.name.toLowerCase()}`,
							isTemplate: w.isTemplate,
							templateKey: w.templateKey,
							templateType: w.templateType,
							templateId: templateId,
							props: w.props,
							widget: findOrLoadWidget({ id: w.id, name: w.name }),
						} as IWidgetProps;
					});
				console.log("Filtered widgets:", updatedWidgets);
				setWidgets(updatedWidgets);
			})
			.catch((e: any) => {
				console.log("Exception getting widgets:", e);
			});
	}

	// const loadScript = (moduleId: string): Promise<void> => {
	// 	console.log("Load Script() called==>", moduleId);
	// 	return new Promise((resolve, reject) => {
	// 		const script = document.createElement("script");
	// 		script.src = `/api/UXP/module?id=${moduleId}`;
	// 		script.async = true;

	// 		script.onload = () => {
	// 			console.log(`Script loaded for module: ${moduleId}`);
	// 			resolve();
	// 		};

	// 		script.onerror = () => {
	// 			console.error(`Failed to load script for module: ${moduleId}`);
	// 			reject(new Error(`Failed to load script for module: ${moduleId}`));
	// 		};

	// 		document.body.appendChild(script);
	// 	});
	// };

	const loadScript = (moduleId: string): Promise<void> => {
		return new Promise((resolve, reject) => {
			// Check if script already exists in DOM
			const existingScript = document.querySelector(
				`script[src*="/api/UXP/module?id=${moduleId}"]`
			);

			if (existingScript) {
				console.log(`Script already loaded for module: ${moduleId}`);
				resolve();
				return;
			}

			// Create and load new script if not found
			const script = document.createElement("script");
			script.src = `/api/UXP/module?id=${moduleId}`;
			script.async = true;

			script.onload = () => {
				console.log(`Script loaded for module: ${moduleId}`);
				resolve();
			};

			script.onerror = () => {
				console.error(`Failed to load script for module: ${moduleId}`);
				reject(new Error(`Failed to load script for module: ${moduleId}`));
			};

			document.body.appendChild(script);
		});
	};

	const findOrLoadWidget = async (card: { id: string; name: string }) => {
		const registeredWidgets: any = widgets || [];
		const widget = registeredWidgets.find(
			(w: IWidgetProps) => w.id === card.id && w.name === card.name
		);
		if (widget) {
			console.log("Found widget:", widget);
			return widget;
		}
		console.log("Widget not found:", card);
		return null;
	};

	const renderWidget = (widgetIdToBeRendered: any, objectType: any) => {
		if (!activeWidget) return null;

		console.log(
			"Attempting to render widget, activeWidget:",
			activeWidget,
			widgetIdToBeRendered
		);
		let registeredWidgets = (window as any).Widgets || [];
		console.log("Registered widgets:", registeredWidgets);

		const instance = registeredWidgets.find((r: any) => {
			// if (activeWidget.find((ele: activateWidgets) => ele.widgetId == r.id)) {
			// 	return true;
			// } else {
			// 	return false;
			// }
			return r.id === widgetIdToBeRendered;
		});

		if (!instance) {
			console.log("Widget instance not found for IDs:", activeWidget);
			return <div>Widget not found</div>;
		}

		const Component = instance.widget;
		const configuredInstance = widgets.find((e) => e.id === instance.id);

		if (!configuredInstance) {
			console.log("Widget configuration not found for ID:", activeWidget);
			return <div>Widget configuration not found</div>;
		} else {
			console.log("configuredInstance", configuredInstance);
		}

		let defaultProps = instance.defaultProps || {};
		let mergedProps = { ...defaultProps, ...configuredInstance.props };
		console.log("Rendering widget with props:", mergedProps);

		const widgetStyles = {
			smartbim: {
				container: {
					position: "fixed",
					top: 0,
					left: 0,
					width: "100vw",
					height: "100vh",
					backgroundColor: "rgba(0, 0, 0, 0.5)",
					zIndex: 2000,
					display: "flex",
					justifyContent: "flex-start",
					alignItems: "center",
					paddingLeft: "100px",
				},
				widget: {
					width: "30%",
					height: "50vh",
					backgroundColor: "#fff",
					borderRadius: "8px",
					overflow: "auto",
					boxSizing: "border-box",
					padding: "10px",
					display: "flex",
					flexDirection: "column",
					position: "relative",
				},
			},
		};

		const currentStyle = widgetStyles.smartbim;

		return (
			// <div
			// 	key={instance.id}
			// 	style={currentStyle.container as React.CSSProperties}
			// >
			// 	<div style={currentStyle.widget as React.CSSProperties}>
			// 		<button
			// 			onClick={() => setActiveWidget(null)}
			// 			style={{
			// 				position: "absolute",
			// 				top: "10px",
			// 				right: "10px",
			// 				background: "none",
			// 				border: "none",
			// 				fontSize: "20px",
			// 				cursor: "pointer",
			// 				zIndex: 1,
			// 			}}
			// 		>
			// 			✕
			// 		</button>
			<>
				<Component
					uxpContext={props.uxpContext}
					bindingInfo={props.bindingInfo}
					{...mergedProps}
				/>
			</>
			// </div>
			//</div>
		);
	};

	if (!scriptsLoaded) {
		return <div>Loading scripts...</div>;
	}

	const handleChange = (event: React.SyntheticEvent, newValue: string) => {
		setValue(newValue);
	};

	// const renderCard = (dataType: string, data: any[]) => {
	// 	console.log("assetCard", AssetCard_SCDetails, AssetCard_WRDetails);
	// 	// console.log("dataType", dataType);
	// 	// console.log("data", data);
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
	// 					// AssetCard_SCDetails={AssetCard_SCDetails}
	// 					// AssetCard_WRDetails={AssetCard_WRDetails}
	// 				/>
	// 			);
	// 		case "Location":
	// 			return (
	// 				<LocationCard
	// 					data={data}
	// 					color={colorThemes[dataType]}
	// 					onView={props.onView}
	// 				/>
	// 			);
	// 		case "Incident":
	// 			return (
	// 				<IncidentCard
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
	// 		case "Alarm":
	// 			return (
	// 				<AlarmCard
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
		<Box sx={{ maxWidth: { xs: 320, sm: 500 }, bgcolor: "background.paper" }}>
			<Tabs
				value={value}
				onChange={handleChange}
				variant="scrollable"
				scrollButtons="auto"
				aria-label="dynamic tabs example"
			>
				{mockLocationConfigData.map((item, index) => (
					<Tab
						key={index}
						label={item.objectType}
						value={(index + 1).toString()}
					/>
				))}
			</Tabs>
			<TabContext value={value}>
				{/* Dynamically render TabPanels */}
				{mockLocationConfigData.map((item, index) => (
					<TabPanel
						key={index}
						value={(index + 1).toString()}
						sx={{
							padding: 0,
							maxHeight: "500px",
							overflowY: "auto",
							display: "flex",
							gap: "10px",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						{renderWidget(item.widgetId, item.objectType)}
					</TabPanel>
				))}
			</TabContext>
		</Box>
	);
};

export default TabLocationElement;
